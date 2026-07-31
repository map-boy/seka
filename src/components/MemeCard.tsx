import React, { useState, useRef } from 'react';
import { Heart, MessageCircle, Share2, Download, Bookmark, Volume2, VolumeX, Play } from 'lucide-react';
import { MemePost } from '../types';

interface MemeCardProps {
 meme: MemePost;
 onLike: (id: string) => void;
 onCommentClick: (meme: MemePost) => void;
 onShareClick: (meme: MemePost) => void;
 onDownloadClick: (meme: MemePost) => void;
 onSaveClick: (id: string) => void;
 onLongPress: (meme: MemePost) => void;
 onCreatorClick?: (creatorId: string) => void;
}

export const MemeCard: React.FC<MemeCardProps> = ({
 meme,
 onLike,
 onCommentClick,
 onShareClick,
 onDownloadClick,
 onSaveClick,
 onLongPress,
 onCreatorClick,
}) => {
 const [isMuted, setIsMuted] = useState(true);
 const [showHeartAnim, setShowHeartAnim] = useState(false);
 const lastTapRef = useRef<number>(0);
 const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

 // Handle Double Tap to Like with Heart overlay
 const handleMediaClick = () => {
 const now = Date.now();
 const DOUBLE_TAP_DELAY = 300;
 if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
 // Double tap detected!
 if (!meme.isLiked) {
 onLike(meme.id);
 }
 setShowHeartAnim(true);
 setTimeout(() => setShowHeartAnim(false), 800);
 }
 lastTapRef.current = now;
 };

 // Handle Long Press for Emoji Reaction Picker
 const handleTouchStart = () => {
 longPressTimerRef.current = setTimeout(() => {
 onLongPress(meme);
 }, 500);
 };

 const handleTouchEnd = () => {
 if (longPressTimerRef.current) {
 clearTimeout(longPressTimerRef.current);
 }
 };

 return (
 <article className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden mb-4 shadow-lg transition-all hover:border-[#27272A]">
 {/* Header Row */}
 <div className="p-3 flex items-center justify-between border-b border-[#27272A]/50">
 <div
 className="flex items-center space-x-2.5 cursor-pointer"
 onClick={() => onCreatorClick && onCreatorClick(meme.creatorId)}
 >
 <div className="w-10 h-10 rounded-full p-[2px] bg-[#E6FF00] flex items-center justify-center">
 <img
 src={meme.creator.avatar}
 alt={meme.creator.name}
 className="w-full h-full rounded-full object-cover border border-[#18181B]"
 />
 </div>
 <div>
 <div className="flex items-center space-x-1.5">
 <span className="text-xs font-bold text-white hover:underline">{meme.creator.name}</span>
 <span className="text-[10px] text-[#A1A1AA]">. {meme.createdAt}</span>
 </div>
 <span className="text-[11px] font-semibold text-[#E6FF00] block leading-tight">
 {meme.creator.handle}
 </span>
 </div>
 </div>

 {/* Category Pill */}
 <span className="text-[10px] font-bold bg-[#27272A] text-[#E6FF00] border border-[#E6FF00]/30 px-2.5 py-1 rounded-full uppercase tracking-wide">
 {meme.category}
 </span>
 </div>

 {/* Media Area */}
 <div
 className={`relative bg-[#0A0A0A] overflow-hidden cursor-pointer select-none ${
 meme.type === 'reel' ? 'aspect-[4/5]' : 'aspect-[4/3]'
 }`}
 onClick={handleMediaClick}
 onMouseDown={handleTouchStart}
 onMouseUp={handleTouchEnd}
 onTouchStart={handleTouchStart}
 onTouchEnd={handleTouchEnd}
 >
 {meme.type === 'reel' ? (
 <video
 src={meme.mediaUrl}
 className="w-full h-full object-cover"
 autoPlay
 loop
 muted={isMuted}
 playsInline
 />
 ) : (
 <img
 src={meme.mediaUrl}
 alt={meme.caption}
 className="w-full h-full object-cover"
 loading="lazy"
 />
 )}

 {/* Reel Badges & Audio Control */}
 {meme.type === 'reel' && (
 <>
 <div className="absolute top-3 left-3 bg-[#0A0A0A]/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 flex items-center space-x-1.5">
 <Play className="w-3 h-3 text-[#E6FF00] fill-current" />
 <span className="text-[10px] font-black text-white tracking-wider">
 REEL . {meme.duration || '0:12'}
 </span>
 </div>
 <button
 onClick={(e) => {
 e.stopPropagation();
 setIsMuted(!isMuted);
 }}
 className="absolute bottom-3 right-16 w-8 h-8 rounded-full bg-[#0A0A0A]/70 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:text-[#E6FF00] transition-colors"
 title={isMuted ? 'Unmute' : 'Mute'}
 >
 {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
 </button>
 </>
 )}

 {/* Double-tap Animated Heart Overlay */}
 {showHeartAnim && (
 <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none animate-in zoom-in-50 duration-200">
 <Heart className="w-24 h-24 text-[#E6FF00] fill-[#E6FF00] drop-shadow-[0_0_25px_rgba(230,255,0,0.8)]" />
 </div>
 )}

 {/* Live Watermark Preview Badge (always visible bottom-right corner) */}
 <div className="absolute bottom-3 right-3 bg-[#0A0A0A]/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#E6FF00]/40 flex items-center space-x-1 shadow-md pointer-events-none">
 <span className="text-[#FF3366] text-xs font-black">⚡</span>
 <span className="text-xs font-black text-white">Sekaa</span>
 </div>
 </div>

 {/* Caption Line + Hashtags */}
 <div className="p-3 space-y-1.5">
 <p className="text-xs font-semibold text-white leading-relaxed">{meme.caption}</p>
 <div className="flex flex-wrap gap-1.5">
 {meme.hashtags.map((tag) => (
 <span key={tag} className="text-[11px] font-bold text-[#E6FF00] hover:underline cursor-pointer">
 {tag}
 </span>
 ))}
 </div>
 </div>

 {/* Action Rail */}
 <div className="bg-[#27272A]/40 border-t border-[#27272A] px-3 py-2 flex items-center justify-between">
 {/* Left Actions: Like, Comment, Share */}
 <div className="flex items-center space-x-4">
 {/* Like */}
 <button
 onClick={() => onLike(meme.id)}
 className={`flex items-center space-x-1.5 text-xs font-bold transition-transform active:scale-125 ${
 meme.isLiked ? 'text-[#E6FF00]' : 'text-[#A1A1AA] hover:text-white'
 }`}
 >
 {meme.reaction ? (
 <span className="text-base leading-none">{meme.reaction}</span>
 ) : (
 <Heart className={`w-4 h-4 ${meme.isLiked ? 'fill-[#E6FF00]' : ''}`} />
 )}
 <span>{meme.likes.toLocaleString()}</span>
 </button>

 {/* Comment */}
 <button
 onClick={() => onCommentClick(meme)}
 className="flex items-center space-x-1.5 text-xs font-bold text-[#A1A1AA] hover:text-white transition-colors"
 >
 <MessageCircle className="w-4 h-4" />
 <span>{meme.commentsCount.toLocaleString()}</span>
 </button>

 {/* Share */}
 <button
 onClick={() => onShareClick(meme)}
 className="flex items-center space-x-1.5 text-xs font-bold text-[#A1A1AA] hover:text-white transition-colors"
 >
 <Share2 className="w-4 h-4" />
 <span>{meme.shares.toLocaleString()}</span>
 </button>
 </div>

 {/* Right Actions: Download (Watermark) & Save */}
 <div className="flex items-center space-x-2">
 {/* Download with Sekaa Watermark */}
 <button
 onClick={() => onDownloadClick(meme)}
 className="flex items-center space-x-1 bg-[#FF9500]/15 hover:bg-[#FF9500]/25 text-[#FF9500] border border-[#FF9500]/40 px-2.5 py-1 rounded-full text-xs font-bold transition-all"
 title="Download with Sekaa Watermark"
 >
 <Download className="w-3.5 h-3.5" />
 <span className="hidden sm:inline">Watermark</span>
 </button>

 {/* Save to Collection */}
 <button
 onClick={() => onSaveClick(meme.id)}
 className={`p-1.5 rounded-full border transition-colors ${
 meme.isSaved
 ? 'bg-[#E6FF00]/15 border-[#E6FF00] text-[#E6FF00]'
 : 'bg-[#27272A] border-[#27272A] text-[#A1A1AA] hover:text-white'
 }`}
 title={meme.isSaved ? 'Saved' : 'Save Meme'}
 >
 <Bookmark className={`w-4 h-4 ${meme.isSaved ? 'fill-[#E6FF00]' : ''}`} />
 </button>
 </div>
 </div>
 </article>
 );
};



