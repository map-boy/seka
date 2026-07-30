import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Video, Image as ImageIcon } from 'lucide-react';
import { Category, MemeTemplate, MemePost, PostType } from '../types';
import { INITIAL_TEMPLATES } from '../data/mockData';
import { stampSekaaWatermark } from '../utils/watermark';
import { uploadMemeImage } from '../lib/storage';
import { useAuth } from '../lib/AuthContext';

interface CreateMemeStudioProps {
  onPublish: (newPost: MemePost, postToStatus: boolean) => void;
}

const CATEGORIES: Category[] = [
  'Relatable', 'Dark Humor', 'Anime', 'Gaming', 'Tech', 'Sports', 'Wholesome', 'Dank',
];

const EMOJI_STICKERS = ['🔥', '💀', '😂', '👑', '🕶️', '🗿', '🤡', '🚀'];

export const CreateMemeStudio: React.FC<CreateMemeStudioProps> = ({ onPublish }) => {
  const { currentUser } = useAuth();
  const [postType, setPostType] = useState<PostType>('image');
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate>(INITIAL_TEMPLATES[0]);
  const [topCaption, setTopCaption] = useState(INITIAL_TEMPLATES[0].defaultTopText);
  const [bottomCaption, setBottomCaption] = useState(INITIAL_TEMPLATES[0].defaultBottomText);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>('Tech');
  const [postToStatus, setPostToStatus] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = 600;
      canvas.height = postType === 'reel' ? 750 : 600;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const fontSize = Math.floor(canvas.width * 0.07);
      ctx.font = `900 ${fontSize}px "Impact", "Arial Black", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;

      if (topCaption.trim()) {
        const text = topCaption.trim().toUpperCase();
        ctx.strokeText(text, canvas.width / 2, fontSize + 20);
        ctx.fillText(text, canvas.width / 2, fontSize + 20);
      }

      if (bottomCaption.trim()) {
        const text = bottomCaption.trim().toUpperCase();
        ctx.strokeText(text, canvas.width / 2, canvas.height - 30);
        ctx.fillText(text, canvas.width / 2, canvas.height - 30);
      }

      if (selectedSticker) {
        ctx.font = '100px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(selectedSticker, canvas.width / 2, canvas.height / 2);
      }

      stampSekaaWatermark(ctx, canvas.width, canvas.height);
    };

    img.src = selectedTemplate.thumbnailUrl;
  }, [selectedTemplate, topCaption, bottomCaption, selectedSticker, postType]);

  const handleSelectTemplate = (tpl: MemeTemplate) => {
    setSelectedTemplate(tpl);
    setTopCaption(tpl.defaultTopText);
    setBottomCaption(tpl.defaultBottomText);
    setCategory(tpl.category);
  };

  const handlePublishSubmit = async () => {
    if (!currentUser) {
      setError('You must be logged in to publish.');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    setPublishing(true);
    setError(null);
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const realMediaUrl = await uploadMemeImage(currentUser.uid, dataUrl);

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
        type: postType,
        mediaUrl: realMediaUrl,
        duration: postType === 'reel' ? '0:12' : undefined,
        caption: `${topCaption} ${bottomCaption}`.trim(),
        hashtags: [`#${category}`, '#SekaaOriginal', '#DankMemes'],
        likes: 0,
        commentsCount: 0,
        shares: 0,
        downloads: 0,
        isLiked: false,
        isSaved: false,
        isMine: true,
      };

      onPublish(newPost, postToStatus);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="pb-24 pt-2 px-4 space-y-5 max-w-lg mx-auto">
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-[#E6FF00]" />
          <h1 className="text-xl font-black text-white">Meme Studio</h1>
        </div>
        <p className="text-xs text-[#A1A1AA]">
          Craft viral photo & video memes with auto Sekaa watermarking
        </p>
      </div>

      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-3 shadow-xl">
        <div className="relative w-full rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#27272A]">
          <canvas ref={canvasRef} className="w-full h-auto block max-h-[420px] object-contain mx-auto" />
          <span className="absolute top-2 left-2 text-[10px] font-bold bg-black/70 text-[#E6FF00] px-2 py-0.5 rounded-full border border-[#E6FF00]/30">
            Live Canvas Preview
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider block">
          1. Select Format & Template
        </span>
        <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setPostType(postType === 'image' ? 'reel' : 'image')}
            className="flex-shrink-0 w-20 h-20 rounded-xl bg-[#27272A] border border-[#E6FF00]/40 flex flex-col items-center justify-center text-[#E6FF00] space-y-1 hover:bg-[#3F3F46]"
          >
            {postType === 'image' ? <ImageIcon className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            <span className="text-[10px] font-black uppercase">{postType}</span>
          </button>

          {INITIAL_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => handleSelectTemplate(tpl)}
              className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer relative ${
                selectedTemplate.id === tpl.id
                  ? 'border-[#E6FF00] shadow-[0_0_12px_rgba(230,255,0,0.4)]'
                  : 'border-[#27272A] opacity-70 hover:opacity-100'
              }`}
            >
              <img src={tpl.thumbnailUrl} alt={tpl.name} className="w-full h-full object-cover" />
              <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-bold text-white px-1 py-0.5 truncate text-center">
                {tpl.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider block">
          2. Impact Captions
        </span>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="TOP CAPTION (UPPERCASE)..."
            value={topCaption}
            onChange={(e) => setTopCaption(e.target.value)}
            className="w-full bg-[#27272A] text-white text-xs px-4 py-3 rounded-xl border border-[#27272A] focus:outline-none focus:border-[#E6FF00] uppercase font-bold"
          />
          <input
            type="text"
            placeholder="BOTTOM CAPTION (UPPERCASE)..."
            value={bottomCaption}
            onChange={(e) => setBottomCaption(e.target.value)}
            className="w-full bg-[#27272A] text-white text-xs px-4 py-3 rounded-xl border border-[#27272A] focus:outline-none focus:border-[#E6FF00] uppercase font-bold"
          />
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider block">
          3. Overlay Sticker (Optional)
        </span>
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
          {EMOJI_STICKERS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setSelectedSticker(selectedSticker === emoji ? null : emoji)}
              className={`text-xl p-2.5 rounded-xl border transition-all ${
                selectedSticker === emoji
                  ? 'bg-[#E6FF00]/20 border-[#E6FF00] scale-110'
                  : 'bg-[#27272A] border-[#27272A] hover:border-[#71717A]'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider block">
          4. Category Tag
        </span>
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
      </div>

      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-white block">Also Post to My Status</span>
          <span className="text-[11px] text-[#A1A1AA]">Broadcast meme to 24-hour status ring</span>
        </div>
        <button
          onClick={() => setPostToStatus(!postToStatus)}
          className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center ${
            postToStatus ? 'bg-[#E6FF00] justify-end' : 'bg-[#27272A] justify-start'
          }`}
        >
          <div className={`w-4 h-4 rounded-full ${postToStatus ? 'bg-[#0A0A0A]' : 'bg-[#71717A]'}`} />
        </button>
      </div>

      {error && <p className="text-xs text-[#FF3366] font-semibold">{error}</p>}

      <button
        onClick={handlePublishSubmit}
        disabled={publishing}
        className="w-full py-4 rounded-full bg-[#E6FF00] hover:bg-[#d8f000] disabled:opacity-50 text-[#0A0A0A] font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(230,255,0,0.5)] transition-all transform active:scale-98"
      >
        <Sparkles className="w-4 h-4 fill-current" />
        <span>{publishing ? 'Uploading...' : 'Post Meme with Sekaa Watermark'}</span>
      </button>
    </div>
  );
};
