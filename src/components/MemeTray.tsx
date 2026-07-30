import React, { useState } from 'react';
import { X, Search, Bookmark, Flame } from 'lucide-react';
import { MemePost } from '../types';

interface MemeTrayProps {
 isOpen: boolean;
 onClose: () => void;
 memes: MemePost[];
 savedMemes: MemePost[];
 onSelectMeme: (meme: MemePost) => void;
}

export const MemeTray: React.FC<MemeTrayProps> = ({
 isOpen,
 onClose,
 memes,
 savedMemes,
 onSelectMeme,
}) => {
 const [trayTab, setTrayTab] = useState<'trending' | 'saved'>('trending');
 const [searchQuery, setSearchQuery] = useState('');

 if (!isOpen) return null;

 const activeList = trayTab === 'trending' ? memes : savedMemes;
 const filteredList = activeList.filter((m) =>
 searchQuery
 ? m.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
 m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
 m.hashtags.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()))
 : true
 );

 return (
 <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
 <div className="bg-[#18181B] border-t border-[#27272A] rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl max-w-lg mx-auto w-full">
 {/* Header */}
 <div className="p-4 border-b border-[#27272A] flex items-center justify-between">
 <div className="flex items-center space-x-2">
 <span className="text-lg text-[#FF3366]"></span>
 <h3 className="text-base font-black text-white">Meme Tray</h3>
 </div>
 <button
 onClick={onClose}
 className="w-8 h-8 rounded-full bg-[#27272A] flex items-center justify-center text-[#A1A1AA] hover:text-white"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* Tabs & Search */}
 <div className="p-3 border-b border-[#27272A] space-y-3">
 <div className="flex bg-[#0A0A0A] p-1 rounded-xl border border-[#27272A]">
 <button
 onClick={() => setTrayTab('trending')}
 className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center space-x-1 transition-colors ${
 trayTab === 'trending'
 ? 'bg-[#E6FF00] text-[#0A0A0A]'
 : 'text-[#A1A1AA] hover:text-white'
 }`}
 >
 <Flame className="w-3.5 h-3.5 fill-current" />
 <span>Trending Memes</span>
 </button>
 <button
 onClick={() => setTrayTab('saved')}
 className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center space-x-1 transition-colors ${
 trayTab === 'saved'
 ? 'bg-[#E6FF00] text-[#0A0A0A]'
 : 'text-[#A1A1AA] hover:text-white'
 }`}
 >
 <Bookmark className="w-3.5 h-3.5 fill-current" />
 <span>Saved Collection ({savedMemes.length})</span>
 </button>
 </div>

 {/* Search Field */}
 <div className="relative">
 <input
 type="text"
 placeholder="Filter memes by caption or hashtag..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-[#27272A] text-white text-xs pl-8 pr-3 py-2 rounded-xl border border-[#27272A] focus:outline-none focus:border-[#E6FF00]"
 />
 <Search className="w-3.5 h-3.5 text-[#A1A1AA] absolute left-2.5 top-2.5" />
 </div>
 </div>

 {/* 3-Column Grid */}
 <div className="flex-1 overflow-y-auto p-3">
 {filteredList.length === 0 ? (
 <div className="text-center py-12 px-4 space-y-2">
 <Bookmark className="w-10 h-10 text-[#71717A] mx-auto" />
 <p className="text-xs font-bold text-[#A1A1AA]">
 {trayTab === 'saved'
 ? 'No saved memes yet! Bookmark memes from Home Feed to drop them here.'
 : 'No memes matched your search filter.'}
 </p>
 </div>
 ) : (
 <div className="grid grid-cols-3 gap-2">
 {filteredList.map((meme) => (
 <div
 key={meme.id}
 onClick={() => {
 onSelectMeme(meme);
 onClose();
 }}
 className="relative aspect-square rounded-xl overflow-hidden border border-[#27272A] hover:border-[#E6FF00] cursor-pointer group bg-[#0A0A0A]"
 >
 <img
 src={meme.mediaUrl}
 alt={meme.caption}
 className="w-full h-full object-cover group-hover:scale-105 transition-transform"
 />
 {/* Sekaa Watermark Badge on thumbnail */}
 <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-xs px-1.5 py-0.5 rounded-full border border-[#E6FF00]/40 flex items-center space-x-0.5 pointer-events-none">
 <span className="text-[#FF3366] text-[9px] font-black"></span>
 <span className="text-[8px] font-bold text-white">Sekaa</span>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 );
};

