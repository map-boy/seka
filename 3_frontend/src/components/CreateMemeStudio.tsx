import React, { useState, useRef, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { Category, MemePost, PostType } from '../types';
import { uploadMemeFile } from '../lib/storage';
import { useAuth } from '../hooks/AuthContext';

interface CreateMemeStudioProps {
  onPublish: (newPost: MemePost, postToStatus: boolean) => void;
}

const CATEGORIES: Category[] = [
  'Relatable', 'Dark Humor', 'Anime', 'Gaming', 'Tech', 'Sports', 'Wholesome', 'Dank',
];

const MAX_BYTES = 50 * 1024 * 1024;

export const CreateMemeStudio: React.FC<CreateMemeStudioProps> = ({ onPublish }) => {
  const { currentUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<Category>('Tech');
  const [postToStatus, setPostToStatus] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isVideo = !!file && file.type.startsWith('video/');

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0];
    e.target.value = '';
    if (!chosen) return;
    if (!chosen.type.startsWith('image/') && !chosen.type.startsWith('video/')) {
      setError('Please choose an image or video file.');
      return;
    }
    if (chosen.size > MAX_BYTES) {
      setError('File is too large. Maximum size is 50 MB.');
      return;
    }
    setError(null);
    setFile(chosen);
  };

  const handlePublishSubmit = async () => {
    if (!currentUser) {
      setError('You must be logged in to publish.');
      return;
    }
    if (!file) {
      setError('Choose a photo or video first.');
      return;
    }

    setPublishing(true);
    setError(null);
    try {
      const mediaUrl = await uploadMemeFile(currentUser.uid, file);
      const type: PostType = isVideo ? 'reel' : 'image';
      const newPost: MemePost = {
        id: `pending_${Date.now()}`,
        creatorId: currentUser.uid,
        creator: {
          id: currentUser.uid,
          name: currentUser.displayName || 'New User',
          handle: '',
          avatar: currentUser.photoURL || '',
          isFollowing: false,
          bio: '',
          badge: '',
          rank: 0,
          followerCount: 0,
          followingCount: 0,
          memeCount: 0,
          totalLikes: 0,
        },
        createdAt: 'Just now',
        category,
        type,
        mediaUrl,
        caption: caption.trim(),
        hashtags: [`#${category}`],
        likes: 0,
        commentsCount: 0,
        shares: 0,
        downloads: 0,
        isLiked: false,
        isSaved: false,
        isMine: true,
      };
      onPublish(newPost, postToStatus && !isVideo);
      setFile(null);
      setCaption('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="pb-24 pt-2 px-4 space-y-5 max-w-lg mx-auto">
      <h1 className="text-xl font-black text-white">Post a meme</h1>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChosen}
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative w-full rounded-2xl overflow-hidden bg-[#0A0A0A] border border-[#27272A]">
          {isVideo ? (
            <video src={previewUrl} className="block w-full max-h-[60svh] object-contain" controls muted playsInline />
          ) : (
            <img src={previewUrl} alt="Preview" className="block w-full max-h-[60svh] object-contain" />
          )}
          <button
            onClick={() => setFile(null)}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90"
            title="Remove"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center space-y-2 py-16 rounded-2xl bg-[#E6FF00]/10 border-2 border-dashed border-[#E6FF00]/50 text-[#E6FF00] font-bold text-sm hover:bg-[#E6FF00]/20 transition-colors"
        >
          <Upload className="w-6 h-6" />
          <span>Choose a photo or video</span>
        </button>
      )}

      <input
        type="text"
        placeholder="Caption (optional)"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        maxLength={200}
        className="w-full bg-[#27272A] text-white text-sm px-4 py-3 rounded-xl border border-[#27272A] focus:outline-none focus:border-[#E6FF00]"
      />

      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-colors ${
              category === cat
                ? 'bg-[#E6FF00] text-[#0A0A0A] border-[#E6FF00]'
                : 'bg-[#27272A] text-[#A1A1AA] border-[#27272A] hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={`bg-[#18181B] border border-[#27272A] rounded-2xl p-4 flex items-center justify-between ${isVideo ? 'opacity-50' : ''}`}>
        <div>
          <span className="text-xs font-bold text-white block">Also post to my status</span>
          <span className="text-[11px] text-[#A1A1AA]">{isVideo ? 'Photos only' : 'Shows for 24 hours'}</span>
        </div>
        <button
          onClick={() => setPostToStatus(!postToStatus)}
          disabled={isVideo}
          className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center ${
            postToStatus && !isVideo ? 'bg-[#E6FF00] justify-end' : 'bg-[#27272A] justify-start'
          }`}
        >
          <div className={`w-4 h-4 rounded-full ${postToStatus && !isVideo ? 'bg-[#0A0A0A]' : 'bg-[#71717A]'}`} />
        </button>
      </div>

      {error && <p className="text-xs text-[#FF3366] font-semibold">{error}</p>}

      <button
        onClick={handlePublishSubmit}
        disabled={publishing || !file}
        className="w-full py-4 rounded-full bg-[#E6FF00] hover:bg-[#d8f000] disabled:opacity-50 text-[#0A0A0A] font-black text-xs uppercase tracking-wider transition-all"
      >
        {publishing ? 'Uploading...' : 'Post'}
      </button>
    </div>
  );
};