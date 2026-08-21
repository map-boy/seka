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
 <article className="relative mb-2 min-h-[calc(100svh-13.5rem)] snap-start overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#18181B] shadow-2xl">
 {/* Creator overlay */}
 <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/75 to-transparent p-4 pb-12">
 <div
 className="flex items-center space-x-2.5 cursor-pointer"
 onClick={() => onCreatorClick && onCreatorClick(meme.creatorId)}
 >
 <div className="h-10 w-10 rounded-full p-[2px] bg-[#E6FF00] flex items-center justify-center">
 <img
 src={meme.creator.avatar}
 alt={meme.creator.name}
 className="w-full h-full rounded-full object-cover border border-[#18181B]"
 />
 </div>
 <div className="drop-shadow-md">
 <div className="flex items-center space-x-1.5">
 <span className="text-xs font-bold text-white hover:underline">{meme.creator.name}</span>
 <span className="text-[10px] text-[#A1A1AA]">. {meme.createdAt}</span>
 </div>
 <span className="block text-[11px] font-semibold leading-tight text-[#E6FF00]">
 {meme.creator.handle}
 </span>
 </div>
 </div>

 {/* Category Pill */}
 <span className="rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-md">
 {meme.category}
 </span>
 </div>

 {/* Media Area */}
 <div
 className="relative h-full min-h-[calc(100svh-13.5rem)] cursor-pointer select-none overflow-hidden bg-[#0A0A0A]"
 onClick={handleMediaClick}
 onMouseDown={handleTouchStart}
 onMouseUp={handleTouchEnd}
 onTouchStart={handleTouchStart}
 onTouchEnd={handleTouchEnd}
 >
 {meme.type === 'reel' ? (
 <video
 src={meme.mediaUrl}
 className="h-full w-full object-cover"
 autoPlay
 loop
 muted={isMuted}
 playsInline
 />
 ) : (
 <img
 src={meme.mediaUrl}
 alt={meme.caption}
 className="h-full w-full object-cover"
 loading="lazy"
 />
 )}

 {/* Reel Badges & Audio Control */}
 {meme.type === 'reel' && (
 <>
 <div className="absolute left-3 top-16 flex items-center space-x-1.5 rounded-full border border-white/10 bg-[#0A0A0A]/70 px-2.5 py-1 backdrop-blur-md">
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
 className="absolute bottom-28 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#0A0A0A]/70 text-white backdrop-blur-md transition-colors hover:text-[#E6FF00]"
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
 <div className="pointer-events-none absolute bottom-4 left-4 flex items-center space-x-1 rounded-full border border-[#E6FF00]/40 bg-[#0A0A0A]/75 px-2.5 py-1 shadow-md backdrop-blur-md">
 <span className="text-[#FF3366] text-xs font-black">⚡</span>
 <span className="text-xs font-black text-white">Sekaa</span>
 </div>
 </div>

 {/* Caption and action rail */}
 <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between bg-gradient-to-t from-black/90 via-black/55 to-transparent p-4 pt-28">
 <div className="max-w-[calc(100%-4rem)] space-y-1.5">
 <p className="text-sm font-semibold leading-relaxed text-white">{meme.caption}</p>
 <div className="flex flex-wrap gap-1.5">
 {meme.hashtags.map((tag) => (
 <span key={tag} className="cursor-pointer text-[11px] font-bold text-[#E6FF00] hover:underline">
 {tag}
 </span>
 ))}
 </div>

 <div className="flex flex-col items-center gap-3">
 <button onClick={() => onLike(meme.id)} className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${meme.isLiked ? 'text-[#E6FF00]' : 'text-white'}`} title="Like">
 {meme.reaction ? <span className="text-xl leading-none">{meme.reaction}</span> : <Heart className={`h-6 w-6 ${meme.isLiked ? 'fill-[#E6FF00]' : ''}`} />}
 <span>{meme.likes.toLocaleString()}</span>
 </button>
 <button onClick={() => onCommentClick(meme)} className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-white" title="Comments"><MessageCircle className="h-6 w-6" /><span>{meme.commentsCount.toLocaleString()}</span></button>
 <button onClick={() => onShareClick(meme)} className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-white" title="Share"><Share2 className="h-6 w-6" /><span>{meme.shares.toLocaleString()}</span></button>
 <button onClick={() => onSaveClick(meme.id)} className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${meme.isSaved ? 'text-[#E6FF00]' : 'text-white'}`} title={meme.isSaved ? 'Saved' : 'Save'}><Bookmark className={`h-6 w-6 ${meme.isSaved ? 'fill-[#E6FF00]' : ''}`} /><span>Save</span></button>
 <button onClick={() => onDownloadClick(meme)} className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-white" title="Download with watermark"><Download className="h-6 w-6 text-[#FF9500]" /><span>Save</span></button>
 </div>
 </div>
 </div>
 </article>
 );
};



