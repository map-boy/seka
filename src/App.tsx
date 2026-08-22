import { useEffect, useState } from 'react';
import { TabType, BottomNav } from './components/BottomNav';
import { HomeScreen } from './screens/HomeScreen';
import { DiscoverScreen } from './screens/DiscoverScreen';
import { CreateMemeStudio } from './components/CreateMemeStudio';
import { ChatScreen } from './screens/ChatScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AuthScreen } from './screens/AuthScreen';
import { useAuth } from './lib/AuthContext';

import { WatermarkDialog } from './components/WatermarkDialog';
import { EmojiReactionPicker } from './components/EmojiReactionPicker';
import { CommentSheet } from './components/CommentSheet';
import { StatusViewer } from './components/StatusViewer';
import { MemeTray } from './components/MemeTray';

import {
  subscribeToMemes,
  subscribeToUserMemeLikes,
  subscribeToUserMemeSaves,
  createMeme,
  toggleLikeMeme,
  setMemeReaction,
  toggleSaveMeme,
  MemeDoc,
} from './lib/firestore/memes';
import {
  subscribeToComments,
  subscribeToUserCommentLikes,
  addComment,
  toggleLikeComment,
} from './lib/firestore/comments';
import {
  subscribeToCreators,
  subscribeToFollowing,
  toggleFollow,
} from './lib/firestore/creators';
import {
  subscribeToActiveStatuses,
  subscribeToUserStatusViews,
  createStatus,
  markStatusViewed,
  StatusDoc,
} from './lib/firestore/statuses';
import { Creator, MemePost, StatusItem, Comment } from './types';

const EMPTY_CREATOR: Omit<Creator, 'id'> = {
  name: 'New User',
  handle: 'newuser',
  avatar: '',
  isFollowing: false,
  bio: '',
  badge: '',
  rank: 0,
  followerCount: 0,
  followingCount: 0,
  memeCount: 0,
  totalLikes: 0,
};

function AuthGate() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <AuthScreen />
    </div>
  );
}

export default function App() {
  const { currentUser, loading } = useAuth();
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const requireAuth = (): boolean => {
    if (!currentUser) {
      setAuthPromptOpen(true);
      return false;
    }
    return true;
  };

  const [activeTab, setActiveTab] = useState<TabType>('home');

  const [creators, setCreators] = useState<Creator[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [rawMemes, setRawMemes] = useState<(MemeDoc & { id: string })[]>([]);
  const [likedMemeMap, setLikedMemeMap] = useState<Map<string, string>>(new Map());
  const [savedMemeIds, setSavedMemeIds] = useState<Set<string>>(new Set());
  const [rawStatuses, setRawStatuses] = useState<(StatusDoc & { id: string })[]>([]);
  const [viewedStatusIds, setViewedStatusIds] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Comment[]>([]);
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());

  const [watermarkMeme, setWatermarkMeme] = useState<MemePost | null>(null);
  const [reactionMeme, setReactionMeme] = useState<MemePost | null>(null);
  const [commentMeme, setCommentMeme] = useState<MemePost | null>(null);
  const [activeStatus, setActiveStatus] = useState<StatusItem | null>(null);
  const [isMemeTrayOpen, setIsMemeTrayOpen] = useState(false);
  const [selectedMemeForChat, setSelectedMemeForChat] = useState<MemePost | null>(null);

  useEffect(() => subscribeToCreators(setCreators), []);

  useEffect(() => {
    if (!currentUser) { setFollowingIds(new Set()); return; }
    return subscribeToFollowing(currentUser.uid, setFollowingIds);
  }, [currentUser]);

  useEffect(() => subscribeToMemes(setRawMemes), []);

  useEffect(() => {
    if (!currentUser) { setLikedMemeMap(new Map()); return; }
    return subscribeToUserMemeLikes(currentUser.uid, setLikedMemeMap);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) { setSavedMemeIds(new Set()); return; }
    return subscribeToUserMemeSaves(currentUser.uid, setSavedMemeIds);
  }, [currentUser]);

  useEffect(() => subscribeToActiveStatuses(setRawStatuses), []);

  useEffect(() => {
    if (!currentUser) { setViewedStatusIds(new Set()); return; }
    return subscribeToUserStatusViews(currentUser.uid, setViewedStatusIds);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) { setLikedCommentIds(new Set()); return; }
    return subscribeToUserCommentLikes(currentUser.uid, setLikedCommentIds);
  }, [currentUser]);

  useEffect(() => {
    if (!commentMeme) { setComments([]); return; }
    return subscribeToComments(commentMeme.id, (list) => {
      setComments(
        list.map((c) => ({
          id: c.id,
          memeId: c.memeId,
          authorName: c.authorName,
          authorAvatar: c.authorAvatar,
          timestamp: 'Just now',
          text: c.text,
          likes: c.likesCount,
          isLiked: likedCommentIds.has(c.id),
        }))
      );
    });
  }, [commentMeme, likedCommentIds]);

  const creatorsMap = new Map<string, Creator>(creators.map((c) => [c.id, c]));

  const memes: MemePost[] = rawMemes.map((m) => {
    const creator = creatorsMap.get(m.creatorId) ?? { id: m.creatorId, ...EMPTY_CREATOR };
    return {
      id: m.id,
      creatorId: m.creatorId,
      creator,
      createdAt: 'Just now',
      category: m.category,
      type: m.type,
      mediaUrl: m.mediaUrl,
      duration: m.duration,
      caption: m.caption,
      hashtags: m.hashtags,
      likes: m.likesCount,
      commentsCount: m.commentsCount,
      shares: m.sharesCount,
      downloads: m.downloadsCount,
      isLiked: likedMemeMap.has(m.id),
      reaction: likedMemeMap.get(m.id) || undefined,
      isSaved: savedMemeIds.has(m.id),
      isMine: currentUser ? m.creatorId === currentUser.uid : false,
    };
  });

  const statuses: StatusItem[] = rawStatuses.map((s) => ({
    id: s.id,
    creatorId: s.creatorId,
    creatorName: currentUser && s.creatorId === currentUser.uid ? 'My Status' : s.creatorName,
    creatorAvatar: s.creatorAvatar,
    mediaUrl: s.mediaUrl,
    caption: s.caption,
    timestamp: 'Just now',
    views: s.viewsCount,
    isViewed: viewedStatusIds.has(s.id),
    isMine: currentUser ? s.creatorId === currentUser.uid : false,
  }));

  const displayCreators: Creator[] = creators.map((c) => ({
    ...c,
    isFollowing: followingIds.has(c.id),
  }));

  const getCreatorForUser = (): Creator => {
    if (!currentUser) return { id: '', ...EMPTY_CREATOR };
    const existing = creatorsMap.get(currentUser.uid);
    if (existing) return existing;
    return {
      id: currentUser.uid,
      ...EMPTY_CREATOR,
      name: currentUser.displayName || 'New User',
      avatar: currentUser.photoURL || '',
    };
  };

  const user: Creator = getCreatorForUser();

  const handleLikeMeme = (id: string) => {
    if (!requireAuth() || !currentUser) return;
    toggleLikeMeme(currentUser.uid, id);
  };

  const handleSaveMeme = (id: string) => {
    if (!requireAuth() || !currentUser) return;
    toggleSaveMeme(currentUser.uid, id);
  };

  const handleSelectReaction = (emoji: string) => {
    if (!requireAuth() || !currentUser || !reactionMeme) return;
    setMemeReaction(currentUser.uid, reactionMeme.id, emoji);
    setReactionMeme(null);
  };

  const handleAddComment = (memeId: string, text: string) => {
    if (!requireAuth() || !currentUser) return;
    addComment(memeId, currentUser.uid, user.name, user.avatar, text);
  };

  const handleLikeComment = (commentId: string) => {
    if (!requireAuth() || !currentUser) return;
    toggleLikeComment(currentUser.uid, commentId);
  };

  const handlePublishMeme = (newPost: MemePost, postToStatus: boolean) => {
    if (!requireAuth() || !currentUser) return;
    createMeme({
      creatorId: currentUser.uid,
      category: newPost.category,
      type: newPost.type,
      mediaUrl: newPost.mediaUrl,
      ...(newPost.duration ? { duration: newPost.duration } : {}),
      caption: newPost.caption,
      hashtags: newPost.hashtags,
    });
    if (postToStatus) {
      createStatus({
        creatorId: currentUser.uid,
        creatorName: 'My Status',
        creatorAvatar: user.avatar,
        mediaUrl: newPost.mediaUrl,
        caption: newPost.caption,
      });
    }
    setActiveTab('home');
  };

  const handleToggleFollow = (creatorId: string) => {
    if (!requireAuth() || !currentUser) return;
    toggleFollow(currentUser.uid, creatorId);
  };

  const handlePostToMyStatus = (status: StatusItem) => {
    if (!requireAuth() || !currentUser) return;
    createStatus({
      creatorId: currentUser.uid,
      creatorName: 'My Status',
      creatorAvatar: user.avatar,
      mediaUrl: status.mediaUrl,
      caption: status.caption || 'Re-shared to my status',
    });
  };

  const handleSelectStatus = (s: StatusItem) => {
    setActiveStatus(s);
    if (currentUser && !s.isMine) {
      markStatusViewed(currentUser.uid, s.id);
    }
  };

  const savedMemes = memes.filter((m) => m.isSaved);
  const likedMemes = memes.filter((m) => m.isLiked);
  const userMemes = memes.filter((m) => m.isMine);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <p className="text-[#A1A1AA] text-xs">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans antialiased selection:bg-[#E6FF00] selection:text-[#0A0A0A]">
      {activeTab === 'home' && (
        <HomeScreen
          memes={memes}
          statuses={statuses}
          onLike={handleLikeMeme}
          onCommentClick={(m) => setCommentMeme(m)}
          onShareClick={(m) => { setSelectedMemeForChat(m); setActiveTab('chat'); }}
          onDownloadClick={(m) => setWatermarkMeme(m)}
          onSaveClick={handleSaveMeme}
          onLongPress={(m) => setReactionMeme(m)}
          onSelectStatus={handleSelectStatus}
          onAddStatusClick={() => setActiveTab('create')}
          onCreatorClick={() => setActiveTab('profile')}
        />
      )}

      {activeTab === 'discover' && (
        <DiscoverScreen
          creators={displayCreators}
          memes={memes}
          onToggleFollow={handleToggleFollow}
          onSelectMeme={(m) => setWatermarkMeme(m)}
          onCreatorClick={() => setActiveTab('profile')}
        />
      )}

      {activeTab === 'create' && (currentUser ? <CreateMemeStudio onPublish={handlePublishMeme} /> : <AuthGate />)}

      {activeTab === 'chat' && (
        currentUser ? (
          <ChatScreen
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
        ) : (
          <AuthGate />
        )
      )}

      {activeTab === 'profile' && (
        currentUser ? (
          <ProfileScreen
            user={user}
            userMemes={userMemes}
            savedMemes={savedMemes}
            likedMemes={likedMemes}
            onSelectMeme={(m) => setWatermarkMeme(m)}
          />
        ) : (
          <AuthGate />
        )
      )}

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadChatCount={0}
      />

      <WatermarkDialog meme={watermarkMeme} onClose={() => setWatermarkMeme(null)} />

      {reactionMeme && (
        <EmojiReactionPicker onSelectEmoji={handleSelectReaction} onClose={() => setReactionMeme(null)} />
      )}

      <CommentSheet
        meme={commentMeme}
        comments={comments}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
        onClose={() => setCommentMeme(null)}
      />

      <StatusViewer
        status={activeStatus}
        onClose={() => setActiveStatus(null)}
        onPostToMyStatus={handlePostToMyStatus}
        onShareToChat={(status) => {
          setSelectedMemeForChat({
            id: status.id,
            creatorId: status.creatorId,
            creator: creatorsMap.get(status.creatorId) ?? { id: status.creatorId, ...EMPTY_CREATOR },
            createdAt: status.timestamp,
            category: 'Relatable',
            type: 'image',
            mediaUrl: status.mediaUrl,
            caption: status.caption,
            hashtags: ['#SekaaStatus'],
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

      <MemeTray
        isOpen={isMemeTrayOpen}
        onClose={() => setIsMemeTrayOpen(false)}
        memes={memes}
        savedMemes={savedMemes}
        onSelectMeme={(meme) => { setSelectedMemeForChat(meme); setIsMemeTrayOpen(false); }}
      />

      {authPromptOpen && !currentUser && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm">
            <button
              onClick={() => setAuthPromptOpen(false)}
              className="absolute -top-10 right-0 text-white text-xs uppercase tracking-wider"
            >
              Close
            </button>
            <AuthScreen onSuccess={() => setAuthPromptOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}


