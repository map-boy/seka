import React, { useState } from 'react';
import { Grid, Bookmark, Heart, Share2, Edit3, Trophy, Copy, MoreHorizontal } from 'lucide-react';
import { Creator, MemePost } from '../types';

interface ProfileScreenProps {
 user: Creator;
 userMemes: MemePost[];
 savedMemes: MemePost[];
 likedMemes: MemePost[];
 onSelectMeme: (meme: MemePost) => void;
}
type ProfileTab = 'my_memes' | 'saved' | 'liked';

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
 user,
 userMemes,
 savedMemes,
 likedMemes,
 onSelectMeme,
}) => {
 const [activeTab, setActiveTab] = useState<ProfileTab>('my_memes');

 // Helper for formatting stats into 1.2K / 3.4M format
 const formatNumber = (num: number) => {
 if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
 if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
 return num.toString();
 };

 const getActiveList = () => {
 if (activeTab === 'my_memes') return userMemes;
 if (activeTab === 'saved') return savedMemes;
 return likedMemes;
 };

 const activeList = getActiveList();

 const handleShare = async () => {
 const profileUrl = `${window.location.origin}/profile/${user.handle}`;
 if (navigator.clipboard) await navigator.clipboard.writeText(profileUrl);
 };

 return (
 <div className="mx-auto max-w-lg space-y-5 px-4 pb-24 pt-3">
 {/* Top Header Row */}
 <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
 <div className="flex items-center gap-2">
 <span className="text-base font-black text-white">@{user.handle}</span>
 <span className="rounded-full bg-[#E6FF00] px-2 py-0.5 text-[9px] font-black uppercase text-[#0A0A0A]">Creator</span>
 </div>
 <div className="flex items-center gap-1">
 <button onClick={() => alert('Edit Profile: Update bio, avatar, and badge.')} className="flex h-9 items-center gap-1.5 rounded-full bg-[#E6FF00] px-3 text-[10px] font-black text-[#0A0A0A]" title="Edit profile">
 <Edit3 className="h-3.5 w-3.5" /> Edit
 </button>
 <button
 onClick={() => alert('Settings: Account, Privacy, Sekaa Watermark preferences.')}
 className="flex h-9 w-9 items-center justify-center rounded-full border border-[#27272A] bg-[#18181B] text-[#A1A1AA] hover:text-white"
 >
 <MoreHorizontal className="h-4 w-4" />
 </button>
 </div>

 {/* User Info Block */}
 <div className="flex flex-col items-center text-center space-y-3">
 <div className="flex flex-col items-center space-y-3 text-center">
 <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#E6FF00] via-[#22D3EE] to-[#FF3366] p-[3px] shadow-[0_0_20px_rgba(230,255,0,0.25)]">
 <img
 src={user.avatar}
 alt={user.name}
 className="w-full h-full rounded-full object-cover border-2 border-[#0A0A0A]"
 />
 </div>
 <span className="absolute bottom-0 right-0 rounded-full bg-[#E6FF00] p-1 text-[#0A0A0A] shadow-md">
 <Trophy className="w-3.5 h-3.5" />
 </span>
 </div>

 <div>
 <h2 className="text-xl font-black text-white">{user.name}</h2>
 <span className="inline-block text-[10px] font-bold bg-[#E6FF00]/15 text-[#E6FF00] border border-[#E6FF00]/30 px-2.5 py-0.5 rounded-full mt-1 uppercase">
 {user.badge}
 </span>
 </div>

 <p className="text-xs text-[#A1A1AA] max-w-xs leading-relaxed">{user.bio}</p>

 {/* Stats Row */}
 <div className="grid w-full grid-cols-4 divide-x divide-[#27272A] border-y border-[#27272A] py-3.5">
 <div className="text-center">
 <span className="text-sm font-black text-white block">
 {formatNumber(userMemes.length)}
 </span>
 <span className="text-[10px] text-[#71717A] font-bold uppercase">Memes</span>
 </div>
 <div className="text-center">
 <span className="text-sm font-black text-white block">
 {formatNumber(user.followerCount)}
 </span>
 <span className="text-[10px] text-[#71717A] font-bold uppercase">Followers</span>
 </div>
 <div className="text-center">
 <span className="text-sm font-black text-white block">
 {formatNumber(user.followingCount)}
 </span>
 <span className="text-[10px] text-[#71717A] font-bold uppercase">Following</span>
 </div>
 <div className="text-center">
 <span className="text-sm font-black text-[#E6FF00] block">
 {formatNumber(user.totalLikes)}
 </span>
 <span className="text-[10px] text-[#71717A] font-bold uppercase">Likes</span>
 </div>
 </div>

 {/* Share Button */}
 <div className="flex w-full space-x-2">
 <button
 onClick={handleShare}
 className="flex-1 rounded-full border border-[#27272A] bg-[#18181B] py-2.5 text-xs font-black text-white transition-colors hover:border-[#E6FF00] hover:text-[#E6FF00]"
 >
 <span className="flex items-center justify-center gap-1.5"><Share2 className="h-3.5 w-3.5" /> Share profile</span>
 </button>
 <button onClick={handleShare} className="flex h-9 w-10 items-center justify-center rounded-full border border-[#27272A] bg-[#18181B] text-[#A1A1AA] hover:text-white" title="Copy profile link">
 <Copy className="h-4 w-4" />
 </button>
 </div>
 </div>

 {/* Tabs Row */}
 <div className="flex border-b border-[#27272A] bg-[#0A0A0A]">
 <button
 onClick={() => setActiveTab('my_memes')}
 className={`flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-1 border-b-2 transition-colors ${
 activeTab === 'my_memes'
 ? 'border-[#E6FF00] text-[#E6FF00]'
 : 'border-transparent text-[#71717A] hover:text-[#A1A1AA]'
 }`}
 >
 <Grid className="w-4 h-4" />
 <span>Posts</span>
 </button>
 <button
 onClick={() => setActiveTab('saved')}
 className={`flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-1 border-b-2 transition-colors ${
 activeTab === 'saved'
 ? 'border-[#E6FF00] text-[#E6FF00]'
 : 'border-transparent text-[#71717A] hover:text-[#A1A1AA]'
 }`}
 >
 <Bookmark className="w-4 h-4" />
 <span>Saved</span>
 </button>
 <button
 onClick={() => setActiveTab('liked')}
 className={`flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-1 border-b-2 transition-colors ${
 activeTab === 'liked'
 ? 'border-[#E6FF00] text-[#E6FF00]'
 : 'border-transparent text-[#71717A] hover:text-[#A1A1AA]'
 }`}
 >
 <Heart className="w-4 h-4" />
 <span>Liked</span>
 </button>
 </div>

 {/* 3-Column Thumbnail Grid */}
 <div>
 {activeList.length === 0 ? (
 <div className="text-center py-12 space-y-2">
 <span className="text-3xl text-[#E6FF00]">+</span>
 <p className="text-xs text-[#A1A1AA] font-bold">
 {activeTab === 'my_memes'
 ? 'You havent created any memes yet. Tap + to craft one in Meme Studio!'
 : activeTab === 'saved'
 ? 'No saved memes yet.'
 : 'No liked memes yet.'}
 </p>
 </div>
 ) : (
 <div className="grid grid-cols-3 gap-1">
 {activeList.map((meme) => (
 <div
 key={meme.id}
 onClick={() => onSelectMeme(meme)}
 className="group relative aspect-[4/5] cursor-pointer overflow-hidden border border-[#27272A] bg-[#0A0A0A] hover:border-[#E6FF00]"
 >
 <img
 src={meme.mediaUrl}
 alt={meme.caption}
 className="w-full h-full object-cover group-hover:scale-105 transition-transform"
 />
 {/* Watermark Pill */}
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

