import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Video, Image as ImageIcon, Check } from 'lucide-react';
import { Category, MemeTemplate, MemePost, PostType } from '../types';
import { INITIAL_TEMPLATES } from '../data/mockData';
import { stampSekaWatermark } from '../utils/watermark';

interface CreateMemeStudioProps {
  onPublish: (newPost: MemePost, postToStatus: boolean) => void;
}

const CATEGORIES: Category[] = [
  'Relatable',
  'Dark Humor',
  'Anime',
  'Gaming',
  'Tech',
  'Sports',
  'Wholesome',
  'Dank',
];

const EMOJI_STICKERS = ['🔥', '💀', '😂', '👑', '🕶️', '🗿', '🤡', '🚀'];

export const CreateMemeStudio: React.FC<CreateMemeStudioProps> = ({ onPublish }) => {
  const [postType, setPostType] = useState<PostType>('image');
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate>(INITIAL_TEMPLATES[0]);
  const [topCaption, setTopCaption] = useState(INITIAL_TEMPLATES[0].defaultTopText);
  const [bottomCaption, setBottomCaption] = useState(INITIAL_TEMPLATES[0].defaultBottomText);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>('Tech');
  const [postToStatus, setPostToStatus] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Redraw preview canvas whenever template, text, or sticker changes
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

      // Base template image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Render Uppercase Impact Captions
      const fontSize = Math.floor(canvas.width * 0.07);
      ctx.font = `900 ${fontSize}px "Impact", "Arial Black", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;

      // Top caption
      if (topCaption.trim()) {
        const text = topCaption.trim().toUpperCase();
        ctx.strokeText(text, canvas.width / 2, fontSize + 20);
        ctx.fillText(text, canvas.width / 2, fontSize + 20);
      }

      // Bottom caption
      if (bottomCaption.trim()) {
        const text = bottomCaption.trim().toUpperCase();
        ctx.strokeText(text, canvas.width / 2, canvas.height - 30);
        ctx.fillText(text, canvas.width / 2, canvas.height - 30);
      }

      // Render Optional Sticker
      if (selectedSticker) {
        ctx.font = '100px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(selectedSticker, canvas.width / 2, canvas.height / 2);
      }

      // Stamp Seka Watermark
      stampSekaWatermark(ctx, canvas.width, canvas.height);
    };

    img.src = selectedTemplate.thumbnailUrl;
  }, [selectedTemplate, topCaption, bottomCaption, selectedSticker, postType]);

  const handleSelectTemplate = (tpl: MemeTemplate) => {
    setSelectedTemplate(tpl);
    setTopCaption(tpl.defaultTopText);
    setBottomCaption(tpl.defaultBottomText);
    setCategory(tpl.category);
  };

  const handlePublishSubmit = () => {
    const canvas = canvasRef.current;
    const mediaUrl = canvas ? canvas.toDataURL('image/png') : selectedTemplate.thumbnailUrl;

    const newPost: MemePost = {
      id: `meme_created_${Date.now()}`,
      creatorId: 'user_me',
      creator: {
        id: 'user_me',
        name: 'MemeLord Prime',
        handle: '@memelord_99',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        isFollowing: false,
        bio: '⚡ Crafting dank memes daily',
        badge: 'Seka Creator ⚡',
        rank: 1,
        followerCount: 34200,
        followingCount: 412,
        memeCount: 149,
        totalLikes: 892000,
      },
      createdAt: 'Just now',
      category: category,
      type: postType,
      mediaUrl: mediaUrl,
      duration: postType === 'reel' ? '0:12' : undefined,
      caption: `${topCaption} ${bottomCaption}`.trim(),
      hashtags: [`#${category}`, '#SekaOriginal', '#DankMemes'],
      likes: 1,
      commentsCount: 0,
      shares: 0,
      downloads: 0,
      isLiked: true,
      isSaved: false,
      isMine: true,
    };

    onPublish(newPost, postToStatus);
  };

  return (
    <div className="pb-24 pt-2 px-4 space-y-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-[#E6FF00]" />
          <h1 className="text-xl font-black text-white">Meme Studio</h1>
        </div>
        <p className="text-xs text-[#A1A1AA]">
          Craft viral photo & video memes with auto Seka watermarking
        </p>
      </div>

      {/* Live Canvas Preview */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-3 shadow-xl">
        <div className="relative w-full rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#27272A]">
          <canvas ref={canvasRef} className="w-full h-auto block max-h-[420px] object-contain mx-auto" />
          <span className="absolute top-2 left-2 text-[10px] font-bold bg-black/70 text-[#E6FF00] px-2 py-0.5 rounded-full border border-[#E6FF00]/30">
            ⚡ Live Canvas Preview
          </span>
        </div>
      </div>

      {/* Template Picker Strip */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider block">
          1. Select Format & Template
        </span>
        <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar py-1">
          {/* Format Toggle Tile */}
          <button
            onClick={() => setPostType(postType === 'image' ? 'reel' : 'image')}
            className="flex-shrink-0 w-20 h-20 rounded-xl bg-[#27272A] border border-[#E6FF00]/40 flex flex-col items-center justify-center text-[#E6FF00] space-y-1 hover:bg-[#3F3F46]"
          >
            {postType === 'image' ? <ImageIcon className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            <span className="text-[10px] font-black uppercase">{postType}</span>
          </button>

          {/* Templates */}
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

      {/* Top & Bottom Caption Inputs */}
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

      {/* Emoji Sticker Row */}
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

      {/* Category Picker */}
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

      {/* Post to My Status Toggle Switch */}
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

      {/* Publish Button */}
      <button
        onClick={handlePublishSubmit}
        className="w-full py-4 rounded-full bg-[#E6FF00] hover:bg-[#d8f000] text-[#0A0A0A] font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(230,255,0,0.5)] transition-all transform active:scale-98"
      >
        <Sparkles className="w-4 h-4 fill-current" />
        <span>Post Meme with Seka Watermark ⚡</span>
      </button>
    </div>
  );
};
