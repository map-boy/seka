import { useState } from 'react';
import { TabType, BottomNav } from './components/BottomNav';
import { HomeScreen } from './screens/HomeScreen';
import { DiscoverScreen } from './screens/DiscoverScreen';
import { CreateMemeStudio } from './components/CreateMemeStudio';
import { ChatScreen } from './screens/ChatScreen';
import { ProfileScreen } from './screens/ProfileScreen';

import { WatermarkDialog } from './components/WatermarkDialog';
import { EmojiReactionPicker } from './components/EmojiReactionPicker';
import { CommentSheet } from './components/CommentSheet';
import { StatusViewer } from './components/StatusViewer';
import { MemeTray } from './components/MemeTray';

import {
  CURRENT_USER,
  INITIAL_CREATORS,
  INITIAL_MEMES,
  INITIAL_STATUSES,
  INITIAL_CHAT_THREADS,
  SAMPLE_COMMENTS,
} from './data/mockData';
import { Creator, MemePost, StatusItem, ChatThread, Comment } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Application State
  const [user, setUser] = useState<Creator>(CURRENT_USER);
  const [creators, setCreators] = useState<Creator[]>(INITIAL_CREATORS);
  const [memes, setMemes] = useState<MemePost[]>(INITIAL_MEMES);
  const [statuses, setStatuses] = useState<StatusItem[]>(INITIAL_STATUSES);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(INITIAL_CHAT_THREADS);
  const [comments, setComments] = useState<Comment[]>(SAMPLE_COMMENTS);

  // Active Overlays
  const [watermarkMeme, setWatermarkMeme] = useState<MemePost | null>(null);
  const [reactionMeme, setReactionMeme] = useState<MemePost | null>(null);
  const [commentMeme, setCommentMeme] = useState<MemePost | null>(null);
  const [activeStatus, setActiveStatus] = useState<StatusItem | null>(null);
  const [isMemeTrayOpen, setIsMemeTrayOpen] = useState(false);
  const [selectedMemeForChat, setSelectedMemeForChat] = useState<MemePost | null>(null);

  // --- Handlers ---

  // Like Meme
  const handleLikeMeme = (id: string) => {
    setMemes((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const isLiked = !m.isLiked;
          const newLikes = isLiked ? m.likes + 1 : m.likes - 1;
          return {
            ...m,
            isLiked,
            likes: newLikes,
            reaction: isLiked ? m.reaction || '❤️' : undefined,
          };
        }
        return m;
      })
    );
  };

  // Save Meme
  const handleSaveMeme = (id: string) => {
    setMemes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isSaved: !m.isSaved } : m))
    );
  };

  // Long Press -> Reaction
  const handleSelectReaction = (emoji: string) => {
    if (!reactionMeme) return;
    setMemes((prev) =>
      prev.map((m) =>
        m.id === reactionMeme.id
          ? {
              ...m,
              isLiked: true,
              likes: m.isLiked ? m.likes : m.likes + 1,
              reaction: emoji,
            }
          : m
      )
    );
    setReactionMeme(null);
  };

  // Add Comment
  const handleAddComment = (memeId: string, text: string) => {
    const newComment: Comment = {
      id: `c_${Date.now()}`,
      memeId,
      authorName: user.name,
      authorAvatar: user.avatar,
      timestamp: 'Just now',
      text,
      likes: 0,
      isLiked: false,
    };
    setComments((prev) => [newComment, ...prev]);

    // Increment comments count on meme
    setMemes((prev) =>
      prev.map((m) => (m.id === memeId ? { ...m, commentsCount: m.commentsCount + 1 } : m))
    );
  };

  // Like Comment
  const handleLikeComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
          : c
      )
    );
  };

  // Publish New Meme from Studio
  const handlePublishMeme = (newPost: MemePost, postToStatus: boolean) => {
    setMemes((prev) => [newPost, ...prev]);

    // Update user stats
    setUser((prev) => ({
      ...prev,
      memeCount: prev.memeCount + 1,
    }));

    // Post to status if toggled ON
    if (postToStatus) {
      const newStatus: StatusItem = {
        id: `status_${Date.now()}`,
        creatorId: user.id,
        creatorName: 'My Status',
        creatorAvatar: user.avatar,
        mediaUrl: newPost.mediaUrl,
        caption: newPost.caption,
        timestamp: 'Just now',
        views: 1,
        isViewed: true,
        isMine: true,
      };
      setStatuses((prev) => [newStatus, ...prev.filter((s) => !s.isMine)]);
    }

    setActiveTab('home');
  };

  // Toggle Follow Creator
  const handleToggleFollow = (creatorId: string) => {
    setCreators((prev) =>
      prev.map((c) => (c.id === creatorId ? { ...c, isFollowing: !c.isFollowing } : c))
    );
  };

  // Add to My Status
  const handlePostToMyStatus = (status: StatusItem) => {
    const newStatus: StatusItem = {
      id: `status_${Date.now()}`,
      creatorId: user.id,
      creatorName: 'My Status',
      creatorAvatar: user.avatar,
      mediaUrl: status.mediaUrl,
      caption: status.caption || 'Re-shared to my status ⚡',
      timestamp: 'Just now',
      views: 1,
      isViewed: true,
      isMine: true,
    };
    setStatuses((prev) => [newStatus, ...prev.filter((s) => !s.isMine)]);
  };

  // Share Meme to Chat
  const handleShareToChat = (meme: MemePost) => {
    setSelectedMemeForChat(meme);
    setActiveTab('chat');
  };

  // Send Chat Message
  const handleSendMessage = (threadId: string, text?: string, meme?: MemePost) => {
    const newMessage = {
      id: `msg_${Date.now()}`,
      threadId,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      text,
      meme,
      timestamp: 'Just now',
      isMine: true,
    };

    setChatThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          const updatedMessages = [...t.messages, newMessage];
          return {
            ...t,
            lastMessage: text || (meme ? `Sent a meme: ${meme.caption}` : 'Sent a meme'),
            timestamp: 'Just now',
            messages: updatedMessages,
          };
        }
        return t;
      })
    );
  };

  // Saved Memes list
  const savedMemes = memes.filter((m) => m.isSaved);
  // Liked Memes list
  const likedMemes = memes.filter((m) => m.isLiked);
  // User created Memes list
  const userMemes = memes.filter((m) => m.isMine);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans antialiased selection:bg-[#E6FF00] selection:text-[#0A0A0A]">
      {/* Active Tab Screen Content */}
      {activeTab === 'home' && (
        <HomeScreen
          memes={memes}
          statuses={statuses}
          onLike={handleLikeMeme}
          onCommentClick={(m) => setCommentMeme(m)}
          onShareClick={handleShareToChat}
          onDownloadClick={(m) => setWatermarkMeme(m)}
          onSaveClick={handleSaveMeme}
          onLongPress={(m) => setReactionMeme(m)}
          onSelectStatus={(s) => setActiveStatus(s)}
          onAddStatusClick={() => setActiveTab('create')}
          onCreatorClick={() => setActiveTab('profile')}
        />
      )}

      {activeTab === 'discover' && (
        <DiscoverScreen
          creators={creators}
          memes={memes}
          onToggleFollow={handleToggleFollow}
          onSelectMeme={(m) => setWatermarkMeme(m)}
          onCreatorClick={() => setActiveTab('profile')}
        />
      )}

      {activeTab === 'create' && <CreateMemeStudio onPublish={handlePublishMeme} />}

      {activeTab === 'chat' && (
        <ChatScreen
          threads={chatThreads}
          onSendMessage={handleSendMessage}
          onOpenMemeTray={() => setIsMemeTrayOpen(true)}
          selectedMemeForChat={selectedMemeForChat}
          onClearSelectedMeme={() => setSelectedMemeForChat(null)}
          onReStatusMeme={(m) => {
            handlePostToMyStatus({
              id: m.id,
              creatorId: m.creatorId,
              creatorName: m.creator.name,
              creatorAvatar: m.creator.avatar,
              mediaUrl: m.mediaUrl,
              caption: m.caption,
              timestamp: 'Just now',
              views: 1,
              isViewed: true,
            });
            setActiveTab('home');
          }}
        />
      )}

      {activeTab === 'profile' && (
        <ProfileScreen
          user={user}
          userMemes={userMemes}
          savedMemes={savedMemes}
          likedMemes={likedMemes}
          onSelectMeme={(m) => setWatermarkMeme(m)}
        />
      )}

      {/* Global Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadChatCount={chatThreads.reduce((acc, t) => acc + t.unreadCount, 0)}
      />

      {/* Supporting Overlays & Sheets */}

      {/* 1. Seka Watermark Progress & Export Dialog */}
      <WatermarkDialog
        meme={watermarkMeme}
        onClose={() => setWatermarkMeme(null)}
      />

      {/* 2. Emoji Reaction Picker */}
      {reactionMeme && (
        <EmojiReactionPicker
          onSelectEmoji={handleSelectReaction}
          onClose={() => setReactionMeme(null)}
        />
      )}

      {/* 3. Comment Bottom Sheet */}
      <CommentSheet
        meme={commentMeme}
        comments={comments}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
        onClose={() => setCommentMeme(null)}
      />

      {/* 4. Full-screen Status Viewer */}
      <StatusViewer
        status={activeStatus}
        onClose={() => setActiveStatus(null)}
        onPostToMyStatus={handlePostToMyStatus}
        onShareToChat={(status) => {
          setSelectedMemeForChat({
            id: status.id,
            creatorId: status.creatorId,
            creator: {
              id: status.creatorId,
              name: status.creatorName,
              handle: `@${status.creatorName.toLowerCase().replace(/\s+/g, '_')}`,
              avatar: status.creatorAvatar,
              isFollowing: false,
              bio: '',
              badge: '',
              rank: 1,
              followerCount: 1000,
              followingCount: 100,
              memeCount: 10,
              totalLikes: 5000,
            },
            createdAt: status.timestamp,
            category: 'Relatable',
            type: 'image',
            mediaUrl: status.mediaUrl,
            caption: status.caption,
            hashtags: ['#SekaStatus'],
            likes: status.views,
            commentsCount: 0,
            shares: 0,
            downloads: 0,
            isLiked: false,
            isSaved: false,
          });
          setActiveTab('chat');
        }}
      />

      {/* 5. Meme Tray Bottom Sheet (Chat composer) */}
      <MemeTray
        isOpen={isMemeTrayOpen}
        onClose={() => setIsMemeTrayOpen(false)}
        memes={memes}
        savedMemes={savedMemes}
        onSelectMeme={(meme) => {
          setSelectedMemeForChat(meme);
          setIsMemeTrayOpen(false);
        }}
      />
    </div>
  );
}
