import React, { useState } from 'react';
import { Header } from '../components/Header';
import { StatusRingRow } from '../components/StatusRingRow';
import { MemeCard } from '../components/MemeCard';
import { Category, MemePost, StatusItem } from '../types';

interface HomeScreenProps {
 memes: MemePost[];
 statuses: StatusItem[];
 onLike: (id: string) => void;
 onCommentClick: (meme: MemePost) => void;
 onShareClick: (meme: MemePost) => void;
 onDownloadClick: (meme: MemePost) => void;
 onSaveClick: (id: string) => void;
 onLongPress: (meme: MemePost) => void;
 onSelectStatus: (status: StatusItem) => void;
 onAddStatusClick: () => void;
 onCreatorClick: (creatorId: string) => void;
}

type SubTab = 'for_you' | 'following' | 'trending';

const CATEGORIES: Category[] = [
 'All',
 'For You',
 'Relatable',
 'Dark Humor',
 'Anime',
 'Gaming',
 'Tech',
 'Sports',
 'Wholesome',
 'Dank',
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
 memes,
 statuses,
 onLike,
 onCommentClick,
 onShareClick,
 onDownloadClick,
 onSaveClick,
 onLongPress,
 onSelectStatus,
 onAddStatusClick,
 onCreatorClick,
}) => {
 const [subTab, setSubTab] = useState<SubTab>('for_you');
 const [selectedCategory, setSelectedCategory] = useState<Category>('All');
 const [searchQuery, setSearchQuery] = useState('');
 const [showSearch, setShowSearch] = useState(false);

 // Filter memes based on Sub-tab, Category, Search
 const filteredMemes = memes.filter((meme) => {
 // 1. Sub-tab filter
 if (subTab === 'following' && !meme.creator.isFollowing && !meme.isMine) {
 return false;
 }
 // handled below via ranked slice, not a per-item filter

 // 2. Category filter
 if (selectedCategory !== 'All' && selectedCategory !== 'For You' && meme.category !== selectedCategory) {
 return false;
 }

 // 3. Search query filter
 if (searchQuery.trim()) {
 const q = searchQuery.toLowerCase();
 const matchCaption = meme.caption.toLowerCase().includes(q);
 const matchCreator = meme.creator.name.toLowerCase().includes(q) || meme.creator.handle.toLowerCase().includes(q);
 const matchTag = meme.hashtags.some((t) => t.toLowerCase().includes(q));
 if (!matchCaption && !matchCreator && !matchTag) return false;
 }

 return true;
 });

 // For Trending: show the top 20 memes by (likes + shares*2), not an absolute cutoff
 const displayedMemes = subTab === 'trending'
 ? [...filteredMemes].sort((a, b) => (b.likes + b.shares * 2) - (a.likes + a.shares * 2)).slice(0, 20)
 : filteredMemes;

 return (
 <div className="pb-24">
 {/* Top Header */}
 <Header
 searchQuery={searchQuery}
 setSearchQuery={setSearchQuery}
 showSearch={showSearch}
 setShowSearch={setShowSearch}
 />

 {/* 24-hour Status Ring Row */}
 <StatusRingRow
 statuses={statuses}
 onSelectStatus={onSelectStatus}
 onAddStatusClick={onAddStatusClick}
 />

 {/* Sub-tabs: For You / Following / Trending */}
 <div className="flex border-b border-[#27272A] bg-[#0A0A0A]">
 <button
 onClick={() => setSubTab('for_you')}
 className={`flex-1 py-3 text-xs font-black uppercase tracking-wider text-center border-b-2 transition-colors ${
 subTab === 'for_you'
 ? 'border-[#E6FF00] text-[#E6FF00]'
 : 'border-transparent text-[#71717A] hover:text-[#A1A1AA]'
 }`}
 >
 For You
 </button>
 <button
 onClick={() => setSubTab('following')}
 className={`flex-1 py-3 text-xs font-black uppercase tracking-wider text-center border-b-2 transition-colors ${
 subTab === 'following'
 ? 'border-[#E6FF00] text-[#E6FF00]'
 : 'border-transparent text-[#71717A] hover:text-[#A1A1AA]'
 }`}
 >
 Following
 </button>
 <button
 onClick={() => setSubTab('trending')}
 className={`flex-1 py-3 text-xs font-black uppercase tracking-wider text-center border-b-2 transition-colors ${
 subTab === 'trending'
 ? 'border-[#E6FF00] text-[#E6FF00]'
 : 'border-transparent text-[#71717A] hover:text-[#A1A1AA]'
 }`}
 >
 Trending
 </button>
 </div>

 {/* Horizontal Category Chips */}
 <div className="overflow-x-auto no-scrollbar py-2.5 px-4 bg-[#0A0A0A] border-b border-[#27272A]/60">
 <div className="flex space-x-2 min-w-max">
 {CATEGORIES.map((cat) => (
 <button
 key={cat}
 onClick={() => setSelectedCategory(cat)}
 className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
 selectedCategory === cat
 ? 'bg-[#E6FF00] text-[#0A0A0A] border-[#E6FF00] shadow-[0_0_10px_rgba(230,255,0,0.3)]'
 : 'bg-[#18181B] text-[#A1A1AA] border-[#27272A] hover:text-white hover:border-[#3F3F46]'
 }`}
 >
 {cat}
 </button>
 ))}
 </div>
 </div>

 {/* TikTok-style snap feed */}
 <main className="mx-auto max-w-lg snap-y snap-mandatory overflow-y-auto px-2 pb-24 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
 {displayedMemes.length === 0 ? (
 <div className="text-center py-16 space-y-3">
 <span className="text-4xl">🙁</span>
 <p className="text-sm font-bold text-[#A1A1AA]">No memes found in this tab.</p>
 <button
 onClick={() => {
 setSelectedCategory('All');
 setSubTab('for_you');
 setSearchQuery('');
 }}
 className="text-xs font-bold text-[#E6FF00] underline"
 >
 Reset filters
 </button>
 </div>
 ) : (
 displayedMemes.map((meme) => (
 <MemeCard
 key={meme.id}
 meme={meme}
 onLike={onLike}
 onCommentClick={onCommentClick}
 onShareClick={onShareClick}
 onDownloadClick={onDownloadClick}
 onSaveClick={onSaveClick}
 onLongPress={onLongPress}
 onCreatorClick={onCreatorClick}
 />
 ))
 )}
 </main>
 </div>
 );
};


