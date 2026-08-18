package com.example.data

object SampleData {
  val currentUser = User(
    id = "user_me",
    handle = "@seka_king",
    name = "Alex Rivera",
    avatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    bio = "Meme Archivist 🗿 Watermark Enforcer 👑 Posting 24/7",
    followerCount = 28400,
    followingCount = 412,
    postCount = 142,
    totalLikes = 389200,
    badge = "Seka Legend 🏆"
  )

  val creators = listOf(
    User("c1", "@dank_lord_99", "Meme God", "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80", "Dankest memes in the west 🔥", followerCount = 89200),
    User("c2", "@relatable_queen", "Chloe B.", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80", "If you don't laugh you lose 💅", followerCount = 124000),
    User("c3", "@tech_humor_dev", "CodeBro", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80", "Writing bugs and posting memes 💻", followerCount = 45000),
    User("c4", "@anime_weeb_x", "Kenji", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80", "Anime logic > Real life 🍜", followerCount = 67800),
    User("c5", "@gaming_guru", "Pixel", "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80", "Lag is my excuse 🎮", followerCount = 98100)
  )

  val categories = listOf(
    "All", "For You", "Relatable", "Dark Humor", "Anime", "Gaming", "Tech", "Sports", "Wholesome", "Dank"
  )

  val samplePosts = listOf(
    MemePost(
      id = "post_1",
      creator = creators[0],
      type = MemeType.IMAGE,
      mediaUrl = "android.resource://com.aistudio.seka.meme/drawable/img_sample_cat_meme_1785393372413",
      caption = "When you fix a bug at 3 AM and celebrate like you won the World Cup ☕🐱",
      category = "Tech",
      tags = listOf("#TechHumor", "#CodingLife", "#CatMeme", "#SekaDank"),
      likesCount = 14280,
      commentsCount = 642,
      sharesCount = 3890,
      downloadsCount = 1240,
      userLiked = true,
      userSaved = true,
      timestampAgo = "15m ago"
    ),
    MemePost(
      id = "post_2",
      creator = creators[1],
      type = MemeType.VIDEO_REEL,
      mediaUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
      caption = "Me explaining why I need to spend $50 on meme stickers to my bank account 💀",
      category = "Relatable",
      tags = listOf("#Relatable", "#BrokeLife", "#SekaReels"),
      likesCount = 28900,
      commentsCount = 1204,
      sharesCount = 8900,
      downloadsCount = 4200,
      userLiked = false,
      timestampAgo = "1h ago",
      videoDurationSeconds = 12
    ),
    MemePost(
      id = "post_3",
      creator = creators[2],
      type = MemeType.IMAGE,
      mediaUrl = "android.resource://com.aistudio.seka.meme/drawable/img_sample_doge_meme_1785393384913",
      caption = "Senior Dev vs Junior Dev looking at production logs after Friday 5 PM release 🐕💻",
      category = "Gaming",
      tags = listOf("#Doge", "#DevMemes", "#FridayRelease"),
      likesCount = 9840,
      commentsCount = 312,
      sharesCount = 1540,
      downloadsCount = 820,
      userLiked = false,
      timestampAgo = "3h ago"
    ),
    MemePost(
      id = "post_4",
      creator = creators[3],
      type = MemeType.VIDEO_REEL,
      mediaUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
      caption = "Anime main character getting a 5-minute flashback right before losing ⚔️🔥",
      category = "Anime",
      tags = listOf("#AnimeMemes", "#Shonen", "#SekaReels"),
      likesCount = 34500,
      commentsCount = 1890,
      sharesCount = 12400,
      downloadsCount = 6700,
      userLiked = true,
      timestampAgo = "5h ago",
      videoDurationSeconds = 24
    ),
    MemePost(
      id = "post_5",
      creator = creators[4],
      type = MemeType.IMAGE,
      mediaUrl = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
      caption = "When your teammate says 'I got your back' and immediately runs away 🎮🤡",
      category = "Gaming",
      tags = listOf("#GamingMemes", "#ClutchOrKick", "#GamerMoments"),
      likesCount = 17600,
      commentsCount = 540,
      sharesCount = 4100,
      downloadsCount = 1890,
      userLiked = false,
      timestampAgo = "8h ago"
    )
  )

  val sampleStatusList = listOf(
    StatusItem(
      id = "status_0",
      userId = currentUser.id,
      userName = "My Status",
      userAvatar = currentUser.avatarUrl,
      mediaUrl = "android.resource://com.aistudio.seka.meme/drawable/img_sample_cat_meme_1785393372413",
      caption = "Testing my new Seka status!",
      timestampAgo = "Just now",
      isViewed = false,
      viewsCount = 12
    ),
    StatusItem(
      id = "status_1",
      userId = creators[0].id,
      userName = creators[0].name,
      userAvatar = creators[0].avatarUrl,
      mediaUrl = "android.resource://com.aistudio.seka.meme/drawable/img_sample_doge_meme_1785393384913",
      caption = "Daily mood check 🐶",
      timestampAgo = "2h ago",
      isViewed = false,
      viewsCount = 340
    ),
    StatusItem(
      id = "status_2",
      userId = creators[1].id,
      userName = creators[1].name,
      userAvatar = creators[1].avatarUrl,
      mediaUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
      caption = "Weekend vibes 🔥",
      timestampAgo = "4h ago",
      isViewed = true,
      viewsCount = 512
    ),
    StatusItem(
      id = "status_3",
      userId = creators[2].id,
      userName = creators[2].name,
      userAvatar = creators[2].avatarUrl,
      mediaUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
      caption = "New meme dropping soon!",
      timestampAgo = "6h ago",
      isViewed = false,
      viewsCount = 210
    )
  )

  val sampleChatThreads = listOf(
    ChatThread(
      id = "thread_1",
      name = "The Meme Syndicate 🗿",
      avatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      isGroup = true,
      lastMessage = "@dank_lord_99 dropped a meme reel! 😂",
      lastMessageTime = "10:45 AM",
      unreadCount = 3
    ),
    ChatThread(
      id = "thread_2",
      name = "Chloe B.",
      avatarUrl = creators[1].avatarUrl,
      isGroup = false,
      lastMessage = "Did you see that cat meme on Seka??",
      lastMessageTime = "Yesterday",
      unreadCount = 0
    ),
    ChatThread(
      id = "thread_3",
      name = "Dev Memes & Bugs 💻",
      avatarUrl = creators[2].avatarUrl,
      isGroup = true,
      lastMessage = "CodeBro: 404 error funny cat saved",
      lastMessageTime = "Jul 28",
      unreadCount = 1
    )
  )

  val sampleChatMessages = listOf(
    ChatMessage(
      id = "m1",
      threadId = "thread_1",
      senderId = creators[0].id,
      senderName = creators[0].name,
      text = "Yo squad check out this bug fix meme!",
      memePostId = "post_1",
      memeUrl = "android.resource://com.aistudio.seka.meme/drawable/img_sample_cat_meme_1785393372413",
      timestamp = "10:40 AM",
      isMine = false
    ),
    ChatMessage(
      id = "m2",
      threadId = "thread_1",
      senderId = currentUser.id,
      senderName = currentUser.name,
      text = "HAHAHA 💀 that cat is literally me every Monday morning",
      timestamp = "10:42 AM",
      isMine = true
    ),
    ChatMessage(
      id = "m3",
      threadId = "thread_1",
      senderId = creators[1].id,
      senderName = creators[1].name,
      text = "Dropping this doge into the chat!",
      memePostId = "post_3",
      memeUrl = "android.resource://com.aistudio.seka.meme/drawable/img_sample_doge_meme_1785393384913",
      timestamp = "10:45 AM",
      isMine = false
    )
  )

  val sampleTemplates = listOf(
    MemeTemplate(
      id = "t1",
      title = "Dramatic Cat Coffee",
      previewUrl = "android.resource://com.aistudio.seka.meme/drawable/img_sample_cat_meme_1785393372413",
      defaultTopText = "WHEN THE COFFEE KICKS IN",
      defaultBottomText = "AND YOU SEE THE CODE BUILDS"
    ),
    MemeTemplate(
      id = "t2",
      title = "Confused Doge Laptop",
      previewUrl = "android.resource://com.aistudio.seka.meme/drawable/img_sample_doge_meme_1785393384913",
      defaultTopText = "ME LOOKING AT MY OWN CODE",
      defaultBottomText = "WRITTEN 6 MONTHS AGO"
    ),
    MemeTemplate(
      id = "t3",
      title = "Distracted Boyfriend",
      previewUrl = "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80",
      defaultTopText = "ME LOOKING AT NEW MEMES",
      defaultBottomText = "MY TO-DO LIST"
    ),
    MemeTemplate(
      id = "t4",
      title = "Brain Expansion",
      previewUrl = "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=500&q=80",
      defaultTopText = "SAVING MEMES IN GALLERY",
      defaultBottomText = "WATERMARKING WITH SEKA 🚀"
    )
  )

  val sampleStickers = listOf(
    StickerItem("s1", "🔥", "Fire"),
    StickerItem("s2", "💀", "Skull"),
    StickerItem("s3", "😂", "Joy"),
    StickerItem("s4", "👑", "Crown"),
    StickerItem("s5", "🕶️", "Shades"),
    StickerItem("s6", "🗿", "Moai"),
    StickerItem("s7", "🤡", "Clown"),
    StickerItem("s8", "🚀", "Rocket")
  )

  val sampleComments = listOf(
    Comment("cm1", "post_1", "Sarah_L", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80", "The sunglasses on the cat sent me 💀💀", "12m ago", 84, true),
    Comment("cm2", "post_1", "Alex_K", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80", "Every programmer at 3 AM can confirm this", "8m ago", 42, false),
    Comment("cm3", "post_1", "MemeQueen", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80", "Downloading with Seka watermark right now to share on WhatsApp! 🔥", "2m ago", 19, true)
  )
}
