package com.example.data

enum class MemeType {
  IMAGE,
  VIDEO_REEL
}

data class User(
  val id: String,
  val handle: String,
  val name: String,
  val avatarUrl: String,
  val bio: String = "Professional shitposter 🗿",
  val isFollowing: Boolean = false,
  val followerCount: Int = 14200,
  val followingCount: Int = 312,
  val postCount: Int = 84,
  val totalLikes: Int = 248900,
  val badge: String = "Top Meme Creator 🏆"
)

data class Comment(
  val id: String,
  val postId: String,
  val authorName: String,
  val authorAvatar: String,
  val text: String,
  val timestampAgo: String,
  val likesCount: Int = 0,
  val userLiked: Boolean = false
)

data class MemePost(
  val id: String,
  val creator: User,
  val type: MemeType = MemeType.IMAGE,
  val mediaUrl: String, // Resource path or image URL or local bitmap
  val caption: String,
  val category: String, // e.g. "Relatable", "Dark Humor", "Anime", "Sports", "Gaming", "Tech"
  val tags: List<String> = emptyList(),
  val likesCount: Int,
  val commentsCount: Int,
  val sharesCount: Int,
  val downloadsCount: Int,
  val userLiked: Boolean = false,
  val userSaved: Boolean = false,
  val selectedReactionEmoji: String? = null,
  val timestampAgo: String = "2h ago",
  val videoDurationSeconds: Int = 15,
  val isSoundMuted: Boolean = true
)

data class StatusItem(
  val id: String,
  val userId: String,
  val userName: String,
  val userAvatar: String,
  val mediaUrl: String,
  val caption: String = "",
  val timestampAgo: String = "3h ago",
  val isViewed: Boolean = false,
  val viewsCount: Int = 142
)

data class ChatMessage(
  val id: String,
  val threadId: String,
  val senderId: String,
  val senderName: String,
  val text: String = "",
  val memePostId: String? = null,
  val memeUrl: String? = null,
  val timestamp: String = "10:42 AM",
  val isMine: Boolean = false
)

data class ChatThread(
  val id: String,
  val name: String,
  val avatarUrl: String,
  val isGroup: Boolean = false,
  val lastMessage: String,
  val lastMessageTime: String,
  val unreadCount: Int = 0
)

data class MemeTemplate(
  val id: String,
  val title: String,
  val previewUrl: String,
  val defaultTopText: String = "",
  val defaultBottomText: String = ""
)

data class StickerItem(
  val id: String,
  val emoji: String,
  val label: String
)
