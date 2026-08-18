package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import com.example.data.SampleData
import com.example.ui.components.CommentBottomSheet
import com.example.ui.components.EmojiReactionPicker
import com.example.ui.components.MemeTraySheet
import com.example.ui.components.SekaBottomNav
import com.example.ui.components.StatusViewerDialog
import com.example.ui.components.WatermarkProgressDialog
import com.example.ui.screens.ChatScreen
import com.example.ui.screens.CreateMemeScreen
import com.example.ui.screens.DiscoverScreen
import com.example.ui.screens.HomeScreen
import com.example.ui.screens.ProfileScreen
import com.example.ui.theme.SekaBackground
import com.example.ui.theme.SekaTheme
import com.example.ui.viewmodel.SekaTab
import com.example.ui.viewmodel.SekaViewModel

class MainActivity : ComponentActivity() {

  private val viewModel: SekaViewModel by viewModels()

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    setContent {
      SekaTheme {
        SekaApp(viewModel = viewModel)
      }
    }
  }
}

@Composable
fun SekaApp(viewModel: SekaViewModel) {
  val context = LocalContext.current

  val selectedTab by viewModel.selectedTab.collectAsState()
  val homeSubTab by viewModel.homeSubTab.collectAsState()
  val selectedCategory by viewModel.selectedCategory.collectAsState()
  val searchQuery by viewModel.searchQuery.collectAsState()

  val posts by viewModel.posts.collectAsState()
  val statuses by viewModel.statuses.collectAsState()
  val activeStatusView by viewModel.activeStatusView.collectAsState()

  val chatThreads by viewModel.chatThreads.collectAsState()
  val activeChatThread by viewModel.activeChatThread.collectAsState()
  val currentChatMessages by viewModel.currentChatMessages.collectAsState()

  val savedMemes by viewModel.savedMemes.collectAsState()
  val activeCommentPost by viewModel.activeCommentPost.collectAsState()
  val postComments by viewModel.postComments.collectAsState()
  val watermarkState by viewModel.watermarkState.collectAsState()
  val reactionPost by viewModel.reactionPost.collectAsState()
  val currentUser by viewModel.currentUser.collectAsState()

  var showMemeTraySheet by remember { mutableStateOf(false) }

  Scaffold(
    containerColor = SekaBackground,
    bottomBar = {
      SekaBottomNav(
        currentTab = selectedTab,
        onTabSelected = { viewModel.selectTab(it) },
        unreadChatCount = chatThreads.sumOf { it.unreadCount }
      )
    }
  ) { innerPadding ->
    Box(
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
    ) {
      // Screen Router
      when (selectedTab) {
        SekaTab.HOME -> {
          HomeScreen(
            posts = posts,
            statuses = statuses,
            categories = SampleData.categories,
            selectedCategory = selectedCategory,
            selectedHomeSubTab = homeSubTab,
            onSelectSubTab = { viewModel.setHomeSubTab(it) },
            onSelectCategory = { viewModel.setSelectedCategory(it) },
            onStatusClick = { viewModel.openStatus(it) },
            onAddStatusClick = { viewModel.selectTab(SekaTab.CREATE) },
            onLikeClick = { viewModel.toggleLikePost(it) },
            onSaveClick = { viewModel.toggleSavePost(it) },
            onCommentClick = { viewModel.openComments(it) },
            onShareClick = { viewModel.processWatermarkShare(context, it) },
            onDownloadWatermarkClick = { viewModel.processWatermarkDownload(context, it) },
            onLongPressReaction = { viewModel.showReactionPicker(it) },
            onSearchClick = { viewModel.selectTab(SekaTab.DISCOVER) }
          )
        }

        SekaTab.DISCOVER -> {
          DiscoverScreen(
            posts = posts,
            creators = SampleData.creators,
            searchQuery = searchQuery,
            onSearchQueryChange = { viewModel.setSearchQuery(it) },
            onMemeClick = { viewModel.openComments(it) },
            onCreatorClick = {}
          )
        }

        SekaTab.CREATE -> {
          CreateMemeScreen(
            templates = SampleData.sampleTemplates,
            categories = SampleData.categories,
            onPublishMeme = { caption, category, mediaUrl, type, pushToStatus ->
              viewModel.createAndPublishMeme(caption, category, mediaUrl, type, pushToStatus)
            }
          )
        }

        SekaTab.CHAT -> {
          ChatScreen(
            threads = chatThreads,
            activeThread = activeChatThread,
            messages = currentChatMessages,
            currentUser = currentUser,
            onOpenThread = { viewModel.openChatThread(it) },
            onCloseThread = { viewModel.closeChatThread() },
            onSendMessage = { text, memeUrl -> viewModel.sendChatMessage(text, memeUrl) },
            onOpenMemeTray = { showMemeTraySheet = true },
            onShareMemeToStatus = { memeUrl -> viewModel.postToStatus(memeUrl, "Reshared meme ⚡") }
          )
        }

        SekaTab.PROFILE -> {
          ProfileScreen(
            user = currentUser,
            myPosts = posts.filter { it.creator.id == currentUser.id },
            savedMemes = savedMemes,
            likedPosts = posts.filter { it.userLiked },
            onPostClick = { viewModel.openComments(it) }
          )
        }
      }

      // 1. Status Viewer Overlay
      activeStatusView?.let { statusItem ->
        StatusViewerDialog(
          statusItem = statusItem,
          onDismiss = { viewModel.closeStatus() },
          onShareToMyStatus = { viewModel.postToStatus(statusItem.mediaUrl, statusItem.caption) },
          onDropToChat = {
            viewModel.selectTab(SekaTab.CHAT)
            val thread = chatThreads.firstOrNull()
            if (thread != null) {
              viewModel.openChatThread(thread)
              viewModel.sendChatMessage("Check out this status meme! ⚡", statusItem.mediaUrl)
            }
          }
        )
      }

      // 2. Comments Bottom Sheet
      activeCommentPost?.let { post ->
        CommentBottomSheet(
          post = post,
          comments = postComments,
          onDismiss = { viewModel.closeComments() },
          onAddComment = { text -> viewModel.addComment(text) }
        )
      }

      // 3. Chat Meme Tray Bottom Sheet
      if (showMemeTraySheet) {
        MemeTraySheet(
          trendingMemes = posts,
          savedMemes = savedMemes,
          onDismiss = { showMemeTraySheet = false },
          onMemeSelected = { memeUrl ->
            viewModel.sendChatMessage("", memeUrl)
          }
        )
      }

      // 4. Watermark Progress Dialog
      watermarkState?.let { wState ->
        WatermarkProgressDialog(
          state = wState,
          onDismiss = { viewModel.dismissWatermarkDialog() }
        )
      }

      // 5. Emoji Reaction Picker
      reactionPost?.let { post ->
        EmojiReactionPicker(
          post = post,
          onDismiss = { viewModel.showReactionPicker(null) },
          onEmojiSelected = { emoji -> viewModel.setReactionEmoji(post.id, emoji) }
        )
      }
    }
  }
}
