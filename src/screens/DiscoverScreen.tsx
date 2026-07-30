import React, { useState } from 'react';
import { Search, Trophy, Flame, UserPlus, UserCheck } from 'lucide-react';
import { Creator, MemePost } from '../types';

interface DiscoverScreenProps {
  creators: Creator[];
  memes: MemePost[];
  onToggleFollow: (creatorId: string) => void;
  onSelectMeme: (meme: MemePost) => void;
  onCreatorClick: (creatorId: string) => void;
}

const TRENDING_TAGS = ['#TechHumor', '#CatMeme', '#Relatable', '#DevLife', '#AnimeMemes', '#Gaming3AM', '#DankSeka'];

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({
  creators,
  memes,
  onToggleFollow,
  onSelectMeme,
  onCreatorClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // 24H Virality Rank calculation: likes + shares*2 + downloads*3
  const rankedMemes = [...memes].sort((a, b) => {
    const scoreA = a.likes + a.shares * 2 + a.downloads * 3;
    const scoreB = b.likes + b.shares * 2 + b.downloads * 3;
    return scoreB - scoreA;
  });

  const filteredRankedMemes = rankedMemes.filter((m) =>
    searchQuery
      ? m.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.hashtags.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
  );

  return (
    <div className="pb-24 pt-4 px-4 space-y-6 max-w-lg mx-auto">
      {/* Header & Search Bar */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Trophy className="w-6 h-6 text-[#E6FF00]" />
          <h1 className="text-xl font-black text-white">Discover & 24h Rank</h1>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search memes, tags, creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181B] text-white text-xs pl-9 pr-4 py-3 rounded-full border border-[#27272A] focus:outline-none focus:border-[#E6FF00] shadow-md"
          />
          <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-3.5" />
        </div>
      </div>

      {/* Trending Hashtag Chips */}
      <div className="space-y-2">
        <div className="flex items-center space-x-1 text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5 text-[#FF9500] fill-current" />
          <span>Trending Hashtags</span>
        </div>
        <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
          {TRENDING_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              className="px-3 py-1.5 rounded-full bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-bold text-[#E6FF00] whitespace-nowrap transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Top Meme Creators */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider block">
          Top Meme Creators
        </span>
        <div className="flex space-x-3 overflow-x-auto no-scrollbar py-1">
          {creators
            .filter((c) => !c.isMine)
            .map((creator) => (
              <div
                key={creator.id}
                className="w-36 bg-[#18181B] border border-[#27272A] rounded-2xl p-3 flex flex-col items-center text-center space-y-2 flex-shrink-0 hover:border-[#3F3F46] transition-colors"
              >
                <div
                  className="w-12 h-12 rounded-full p-[2px] bg-[#E6FF00] cursor-pointer"
                  onClick={() => onCreatorClick(creator.id)}
                >
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-full h-full rounded-full object-cover border border-[#18181B]"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white truncate max-w-[120px]">{creator.name}</h4>
                  <span className="text-[10px] text-[#E6FF00] font-semibold block">{creator.handle}</span>
                </div>
                <button
                  onClick={() => onToggleFollow(creator.id)}
                  className={`w-full py-1.5 rounded-full text-[10px] font-black uppercase flex items-center justify-center space-x-1 transition-all ${
                    creator.isFollowing
                      ? 'bg-[#27272A] text-[#A1A1AA] border border-[#27272A]'
                      : 'bg-[#E6FF00] text-[#0A0A0A] shadow-[0_0_10px_rgba(230,255,0,0.3)]'
                  }`}
                >
                  {creator.isFollowing ? (
                    <>
                      <UserCheck className="w-3 h-3" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* 24H VIRALITY RANK Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-[#E6FF00] font-black text-sm">⚡ 24H VIRALITY RANK</span>
          </div>
          <span className="text-[10px] text-[#A1A1AA] font-bold uppercase">score = likes + shares×2 + downloads×3</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredRankedMemes.map((meme, idx) => {
            const rank = idx + 1;
            const badgeEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

            return (
              <div
                key={meme.id}
                onClick={() => onSelectMeme(meme)}
                className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden hover:border-[#E6FF00] transition-all cursor-pointer group shadow-md"
              >
                {/* Image Container with Rank Badge */}
                <div className="relative aspect-[4/3] bg-black">
                  <img
                    src={meme.mediaUrl}
                    alt={meme.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />

                  {/* Rank Badge */}
                  <div
                    className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-black shadow-lg ${
                      rank <= 3
                        ? 'bg-[#E6FF00] text-[#0A0A0A]'
                        : 'bg-[#0A0A0A]/80 text-[#A1A1AA] border border-[#27272A]'
                    }`}
                  >
                    {badgeEmoji}
                  </div>

                  {/* Watermark Pill */}
                  <div className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-xs px-1.5 py-0.5 rounded-full border border-[#E6FF00]/30 flex items-center space-x-0.5">
                    <span className="text-[#FF3366] text-[9px] font-black">⚡</span>
                    <span className="text-[8px] font-bold text-white">Seka</span>
                  </div>
                </div>

                {/* Caption & Stats */}
                <div className="p-2.5 space-y-1">
                  <p className="text-xs font-bold text-white line-clamp-2 leading-tight">
                    {meme.caption}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-semibold text-[#A1A1AA] pt-1 border-t border-[#27272A]">
                    <span className="text-[#E6FF00]">❤️ {meme.likes.toLocaleString()}</span>
                    <span>📥 {meme.downloads.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
