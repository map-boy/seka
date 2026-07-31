import React, { useState } from 'react';
import { X, Send, Heart } from 'lucide-react';
import { MemePost, Comment } from '../types';
import { CURRENT_USER } from '../data/mockData';

interface CommentSheetProps {
 meme: MemePost | null;
 comments: Comment[];
 onAddComment: (memeId: string, text: string) => void;
 onLikeComment: (commentId: string) => void;
 onClose: () => void;
}

const QUICK_EMOJIS = ['🔥', '😂', '💀', '🎯', '👑', '💯'];

export const CommentSheet: React.FC<CommentSheetProps> = ({
 meme,
 comments,
 onAddComment,
 onLikeComment,
 onClose,
}) => {
 const [inputText, setInputText] = useState('');

 if (!meme) return null;

 const handleSend = () => {
 if (!inputText.trim()) return;
 onAddComment(meme.id, inputText.trim());
 setInputText('');
 };

 const handleQuickEmoji = (emoji: string) => {
 setInputText((prev) => prev + emoji);
 };

 const memeComments = comments.filter((c) => c.memeId === meme.id);

 return (
 <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
 <div className="bg-[#18181B] border-t border-[#27272A] rounded-t-3xl max-h-[80vh] flex flex-col shadow-2xl max-w-lg mx-auto w-full">
 {/* Header */}
 <div className="p-4 border-b border-[#27272A] flex items-center justify-between">
 <div className="flex items-center space-x-2">
 <h3 className="text-sm font-black text-white">
 Comments ({memeComments.length})
 </h3>
 <span className="text-[10px] bg-[#E6FF00]/15 text-[#E6FF00] px-2 py-0.5 rounded-full font-bold">
 Live
 </span>
 </div>
 <button
 onClick={onClose}
 className="w-8 h-8 rounded-full bg-[#27272A] flex items-center justify-center text-[#A1A1AA] hover:text-white"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* Scrollable Comment List */}
 <div className="flex-1 overflow-y-auto p-4 space-y-4">
 {memeComments.length === 0 ? (
 <div className="text-center py-8 space-y-2">
 <span className="text-3xl">💬</span>
 <p className="text-xs text-[#A1A1AA]">No comments yet. Be the first to drop some dankness!</p>
 </div>
 ) : (
 memeComments.map((comment) => (
 <div key={comment.id} className="flex space-x-3 items-start">
 <img
 src={comment.authorAvatar}
 alt={comment.authorName}
 className="w-8 h-8 rounded-full object-cover border border-[#27272A]"
 />
 <div className="flex-1 bg-[#27272A]/50 border border-[#27272A] rounded-2xl p-3">
 <div className="flex items-center justify-between mb-1">
 <span className="text-xs font-bold text-white">{comment.authorName}</span>
 <span className="text-[10px] text-[#A1A1AA]">{comment.timestamp}</span>
 </div>
 <p className="text-xs text-white leading-relaxed">{comment.text}</p>
 </div>
 <button
 onClick={() => onLikeComment(comment.id)}
 className={`flex flex-col items-center pt-2 transition-transform active:scale-125 ${
 comment.isLiked ? 'text-[#E6FF00]' : 'text-[#71717A] hover:text-white'
 }`}
 >
 <Heart className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-[#E6FF00]' : ''}`} />
 <span className="text-[10px] font-bold">{comment.likes}</span>
 </button>
 </div>
 ))
 )}
 </div>

 {/* Quick Tap Emoji Strip */}
 <div className="px-4 py-2 bg-[#0A0A0A] border-t border-[#27272A] flex items-center justify-around">
 <span className="text-[10px] font-bold text-[#A1A1AA]">Quick:</span>
 {QUICK_EMOJIS.map((emoji) => (
 <button
 key={emoji}
 onClick={() => handleQuickEmoji(emoji)}
 className="text-lg hover:scale-125 transition-transform"
 >
 {emoji}
 </button>
 ))}
 </div>

 {/* Comment Input */}
 <div className="p-3 bg-[#18181B] border-t border-[#27272A] flex items-center space-x-2">
 <img
 src={CURRENT_USER.avatar}
 alt="My Avatar"
 className="w-8 h-8 rounded-full object-cover border border-[#E6FF00]"
 />
 <input
 type="text"
 placeholder="Add a comment..."
 value={inputText}
 onChange={(e) => setInputText(e.target.value)}
 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
 className="flex-1 bg-[#27272A] text-white text-xs px-4 py-2.5 rounded-full border border-[#27272A] focus:outline-none focus:border-[#E6FF00]"
 />
 <button
 onClick={handleSend}
 disabled={!inputText.trim()}
 className="w-9 h-9 rounded-full bg-[#E6FF00] disabled:bg-[#27272A] disabled:text-[#71717A] text-[#0A0A0A] flex items-center justify-center font-bold transition-all"
 >
 <Send className="w-4 h-4" />
 </button>
 </div>
 </div>
 </div>
 );
};

