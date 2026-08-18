package com.example.ui.viewmodel

import android.app.Application
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.ChatMessage
import com.example.data.ChatMessageEntity
import com.example.data.ChatThread
import com.example.data.Comment
import com.example.data.MemePost
import com.example.data.MemeType
import com.example.data.SampleData
import com.example.data.SavedMemeEntity
import com.example.data.SekaDatabase
import com.example.data.StatusItem
import com.example.data.User
import com.example.utils.MemeWatermarkUtil
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.net.URL

enum class SekaTab {
  HOME,
  DISCOVER,
  CREATE,
  CHAT,
  PROFILE
}

data class WatermarkProcessingState(
  val post: MemePost,
  val isProcessing: Boolean = true,
  val progressPercent: Float = 0f,
  val resultMessage: String? = null
)

class SekaViewModel(application: Application) : AndroidViewModel(application) {

  private val database = SekaDatabase.getDatabase(application)
  private val memeDao = database.memeDao()

  // Selected bottom navigation tab
  private val _selectedTab = MutableStateFlow(SekaTab.HOME)
  val selectedTab: StateFlow<SekaTab> = _selectedTab.asStateFlow()

  // Home Feed tab filter ("For You", "Following", "Trending")
  private val _homeSubTab = MutableStateFlow("For You")
  val homeSubTab: StateFlow<String> = _homeSubTab.asStateFlow()

  // Selected category filter
  private val _selectedCategory = MutableStateFlow("All")
  val selectedCategory: StateFlow<String> = _selectedCategory.asStateFlow()

  // Search query
  private val _searchQuery = MutableStateFlow("")
  val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

  // Posts State
  private val _posts = MutableStateFlow(SampleData.samplePosts)
  val posts: StateFlow<List<MemePost>> = combine(
    _posts, _selectedCategory, _homeSubTab, _searchQuery
  ) { postsList, category, subTab, query ->
    postsList.filter { post ->
      val matchesCategory = (category == "All" || post.category.equals(category, ignoreCase = true))
      val matchesQuery = query.isBlank() || post.caption.contains(query, ignoreCase = true) ||
          post.tags.any { it.contains(query, ignoreCase = true) }
      val matchesSubTab = when (subTab) {
        "Following" -> post.creator.isFollowing
        "Trending" -> (post.likesCount + post.sharesCount) > 10000
        else -> true
      }
      matchesCategory && matchesQuery && matchesSubTab
    }
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), SampleData.samplePosts)

  // Status Stories
  private val _statuses = MutableStateFlow(SampleData.sampleStatusList)
  val statuses: StateFlow<List<StatusItem>> = _statuses.asStateFlow()

  private val _activeStatusView = MutableStateFlow<StatusItem?>(null)
  val activeStatusView: StateFlow<StatusItem?> = _activeStatusView.asStateFlow()

  // Chat Threads & Active Thread
  private val _chatThreads = MutableStateFlow(SampleData.sampleChatThreads)
  val chatThreads: StateFlow<List<ChatThread>> = _chatThreads.asStateFlow()

  private val _activeChatThread = MutableStateFlow<ChatThread?>(null)
  val activeChatThread: StateFlow<ChatThread?> = _activeChatThread.asStateFlow()

  private val _chatMessagesMap = MutableStateFlow(
    mapOf("thread_1" to SampleData.sampleChatMessages)
  )

  val currentChatMessages: StateFlow<List<ChatMessage>> = combine(
    _activeChatThread, _chatMessagesMap
  ) { activeThread, map ->
    if (activeThread != null) map[activeThread.id] ?: emptyList() else emptyList()
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  // Saved Memes from Room DB
  val savedMemes: StateFlow<List<SavedMemeEntity>> = memeDao.getAllSavedMemes()
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  // Active Comments Drawer
  private val _activeCommentPost = MutableStateFlow<MemePost?>(null)
  val activeCommentPost: StateFlow<MemePost?> = _activeCommentPost.asStateFlow()

  private val _postComments = MutableStateFlow(SampleData.sampleComments)
  val postComments: StateFlow<List<Comment>> = _postComments.asStateFlow()

  // Watermark Dialog State
  private val _watermarkState = MutableStateFlow<WatermarkProcessingState?>(null)
  val watermarkState: StateFlow<WatermarkProcessingState?> = _watermarkState.asStateFlow()

  // Reaction picker overlay
  private val _reactionPost = MutableStateFlow<MemePost?>(null)
  val reactionPost: StateFlow<MemePost?> = _reactionPost.asStateFlow()

  // Current Logged in User
  val currentUser: StateFlow<User> = MutableStateFlow(SampleData.currentUser)

  fun selectTab(tab: SekaTab) {
    _selectedTab.value = tab
  }

  fun setHomeSubTab(subTab: String) {
    _homeSubTab.value = subTab
  }

  fun setSelectedCategory(category: String) {
    _selectedCategory.value = category
  }

  fun setSearchQuery(query: String) {
    _searchQuery.value = query
  }

  fun toggleLikePost(postId: String) {
    _posts.value = _posts.value.map { post ->
      if (post.id == postId) {
        val newLiked = !post.userLiked
        val newCount = if (newLiked) post.likesCount + 1 else (post.likesCount - 1).coerceAtLeast(0)
        post.copy(userLiked = newLiked, likesCount = newCount)
      } else post
    }
  }

  fun toggleSavePost(post: MemePost) {
    val newSaved = !post.userSaved
    _posts.value = _posts.value.map { p ->
      if (p.id == post.id) p.copy(userSaved = newSaved) else p
    }

    viewModelScope.launch {
      if (newSaved) {
        memeDao.insertSavedMeme(
          SavedMemeEntity(
            id = post.id,
            title = post.caption,
            mediaUrl = post.mediaUrl,
            category = post.category
          )
        )
      } else {
        memeDao.deleteSavedMeme(post.id)
      }
    }
  }

  fun setReactionEmoji(postId: String, emoji: String) {
    _posts.value = _posts.value.map { post ->
      if (post.id == postId) post.copy(selectedReactionEmoji = emoji) else post
    }
    _reactionPost.value = null
  }

  fun showReactionPicker(post: MemePost?) {
    _reactionPost.value = post
  }

  fun openComments(post: MemePost) {
    _activeCommentPost.value = post
  }

  fun closeComments() {
    _activeCommentPost.value = null
  }

  fun addComment(text: String) {
    val activePost = _activeCommentPost.value ?: return
    if (text.isBlank()) return
    val newComment = Comment(
      id = "cm_${System.currentTimeMillis()}",
      postId = activePost.id,
      authorName = currentUser.value.name,
      authorAvatar = currentUser.value.avatarUrl,
      text = text.trim(),
      timestampAgo = "Just now",
      likesCount = 0
    )
    _postComments.value = listOf(newComment) + _postComments.value
    // Increment post comment count
    _posts.value = _posts.value.map { p ->
      if (p.id == activePost.id) p.copy(commentsCount = p.commentsCount + 1) else p
    }
  }

  fun openStatus(statusItem: StatusItem) {
    _activeStatusView.value = statusItem
    _statuses.value = _statuses.value.map { s ->
      if (s.id == statusItem.id) s.copy(isViewed = true) else s
    }
  }

  fun closeStatus() {
    _activeStatusView.value = null
  }

  fun postToStatus(mediaUrl: String, caption: String) {
    val newStatus = StatusItem(
      id = "status_${System.currentTimeMillis()}",
      userId = currentUser.value.id,
      userName = "My Status",
      userAvatar = currentUser.value.avatarUrl,
      mediaUrl = mediaUrl,
      caption = caption,
      timestampAgo = "Just now",
      isViewed = false,
      viewsCount = 1
    )
    _statuses.value = listOf(newStatus) + _statuses.value
  }

  fun createAndPublishMeme(
    caption: String,
    category: String,
    mediaUrl: String,
    type: MemeType,
    pushToStatus: Boolean
  ) {
    val newPost = MemePost(
      id = "post_${System.currentTimeMillis()}",
      creator = currentUser.value,
      type = type,
      mediaUrl = mediaUrl,
      caption = caption,
      category = category,
      tags = listOf("#SekaOriginal", "#${category.replace(" ", "")}"),
      likesCount = 1,
      commentsCount = 0,
      sharesCount = 0,
      downloadsCount = 0,
      userLiked = true,
      timestampAgo = "Just now"
    )

    _posts.value = listOf(newPost) + _posts.value

    if (pushToStatus) {
      postToStatus(mediaUrl, caption)
    }

    _selectedTab.value = SekaTab.HOME
  }

  fun openChatThread(thread: ChatThread) {
    _activeChatThread.value = thread
    _selectedTab.value = SekaTab.CHAT
  }

  fun closeChatThread() {
    _activeChatThread.value = null
  }

  fun sendChatMessage(text: String, memeUrl: String? = null) {
    val thread = _activeChatThread.value ?: return
    if (text.isBlank() && memeUrl == null) return

    val newMsg = ChatMessage(
      id = "msg_${System.currentTimeMillis()}",
      threadId = thread.id,
      senderId = currentUser.value.id,
      senderName = currentUser.value.name,
      text = text.trim(),
      memeUrl = memeUrl,
      timestamp = "Just now",
      isMine = true
    )

    val currentList = _chatMessagesMap.value[thread.id] ?: emptyList()
    val updatedMap = _chatMessagesMap.value.toMutableMap()
    updatedMap[thread.id] = currentList + newMsg
    _chatMessagesMap.value = updatedMap

    // Update last message in thread list
    val lastMsgText = if (memeUrl != null) "Dropped a meme ⚡" else text
    _chatThreads.value = _chatThreads.value.map { t ->
      if (t.id == thread.id) t.copy(lastMessage = lastMsgText, lastMessageTime = "Just now") else t
    }
  }

  // --- Watermark Export Flow ---

  fun processWatermarkDownload(context: Context, post: MemePost) {
    viewModelScope.launch {
      _watermarkState.value = WatermarkProcessingState(post = post, isProcessing = true, progressPercent = 0.2f)

      delay(300)
      _watermarkState.value = _watermarkState.value?.copy(progressPercent = 0.6f)

      val bitmap = loadBitmapFromUrl(context, post.mediaUrl, post.caption)
      val watermarkedBitmap = MemeWatermarkUtil.addSekaWatermark(bitmap)

      delay(400)
      _watermarkState.value = _watermarkState.value?.copy(progressPercent = 0.9f)

      val savedUri = MemeWatermarkUtil.saveToGallery(context, watermarkedBitmap, post.caption)

      // Increment download counter
      _posts.value = _posts.value.map { p ->
        if (p.id == post.id) p.copy(downloadsCount = p.downloadsCount + 1) else p
      }

      delay(200)
      _watermarkState.value = WatermarkProcessingState(
        post = post,
        isProcessing = false,
        progressPercent = 1.0f,
        resultMessage = if (savedUri != null) "Saved to Gallery with Seka Watermark! 🚀" else "Saved with Seka Watermark!"
      )
    }
  }

  fun processWatermarkShare(context: Context, post: MemePost) {
    viewModelScope.launch {
      _watermarkState.value = WatermarkProcessingState(post = post, isProcessing = true, progressPercent = 0.3f)

      delay(300)
      val bitmap = loadBitmapFromUrl(context, post.mediaUrl, post.caption)
      val watermarkedBitmap = MemeWatermarkUtil.addSekaWatermark(bitmap)

      _watermarkState.value = null
      MemeWatermarkUtil.shareWatermarkedMeme(context, watermarkedBitmap, post.caption)

      // Increment shares counter
      _posts.value = _posts.value.map { p ->
        if (p.id == post.id) p.copy(sharesCount = p.sharesCount + 1) else p
      }
    }
  }

  fun dismissWatermarkDialog() {
    _watermarkState.value = null
  }

  private suspend fun loadBitmapFromUrl(context: Context, urlStr: String, fallbackText: String): Bitmap = withContext(Dispatchers.IO) {
    try {
      if (urlStr.startsWith("android.resource://")) {
        val uri = android.net.Uri.parse(urlStr)
        val inputStream = context.contentResolver.openInputStream(uri)
        if (inputStream != null) {
          val bmp = BitmapFactory.decodeStream(inputStream)
          inputStream.close()
          if (bmp != null) return@withContext bmp
        }
      } else if (urlStr.startsWith("http")) {
        val connection = URL(urlStr).openConnection()
        connection.connectTimeout = 5000
        connection.readTimeout = 5000
        val inputStream = connection.getInputStream()
        val bmp = BitmapFactory.decodeStream(inputStream)
        inputStream.close()
        if (bmp != null) return@withContext bmp
      }
    } catch (e: Exception) {
      e.printStackTrace()
    }
    // Fallback generated canvas bitmap if image loading fails or is simulated
    return@withContext createFallbackMemeBitmap(fallbackText)
  }

  private fun createFallbackMemeBitmap(text: String): Bitmap {
    val width = 800
    val height = 600
    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)

    // Dark charcoal background
    canvas.drawColor(Color.parseColor("#161820"))

    // Meme top/bottom text styling
    val paint = Paint().apply {
      color = Color.WHITE
      textSize = 42f
      typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
      textAlign = Paint.Align.CENTER
      isAntiAlias = true
    }

    val shadowPaint = Paint().apply {
      color = Color.BLACK
      textSize = 42f
      typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
      textAlign = Paint.Align.CENTER
      isAntiAlias = true
    }

    canvas.drawText(text.take(30).uppercase(), width / 2f + 3, 100f + 3, shadowPaint)
    canvas.drawText(text.take(30).uppercase(), width / 2f, 100f, paint)

    return bitmap
  }
}
