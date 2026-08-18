import React, { useState } from 'react';
import { Settings, Grid, Bookmark, Heart, Share2, Edit3, Trophy, Check } from 'lucide-react';
import { Creator, MemePost } from '../types';
import { EditProfileSheet } from '../components/EditProfileSheet';
import { SettingsSheet } from '../components/SettingsSheet';

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
  const [showEdit, setShowEdit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);

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
    const url = `${window.location.origin}/u/${user.handle}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail on non-HTTPS/insecure contexts - fall back silently
      setCopied(false);
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 space-y-5 max-w-lg mx-auto">
      {/* Top Header Row */}
      <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
        <span className="text-base font-black text-[#E6FF00]">{user.handle}</span>
        <button
          onClick={() => setShowSettings(true)}
          className="w-9 h-9 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#A1A1AA] hover:text-white"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* User Info Block */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="relative">
          <div className="w-24 h-24 rounded-full p-[3px] bg-[#E6FF00] shadow-[0_0_20px_rgba(230,255,0,0.4)]">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.id}`}
              alt={user.name}
              className="w-full h-full rounded-full object-cover border-2 border-[#0A0A0A]"
            />
          </div>
          <span className="absolute bottom-0 right-0 bg-[#E6FF00] text-[#0A0A0A] p-1 rounded-full shadow-md">
            <Trophy className="w-3.5 h-3.5" />
          </span>
        </div>

        <div>
          <h2 className="text-lg font-black text-white">{user.name}</h2>
          <span className="inline-block text-[10px] font-bold bg-[#E6FF00]/15 text-[#E6FF00] border border-[#E6FF00]/30 px-2.5 py-0.5 rounded-full mt-1 uppercase">
            {user.badge}
          </span>
        </div>

        <p className="text-xs text-[#A1A1AA] max-w-xs leading-relaxed">{user.bio}</p>

        {/* Stats Row */}
        <div className="w-full bg-[#18181B] border border-[#27272A] rounded-2xl p-3.5 flex justify-around">
          <div className="text-center">
            <span className="text-sm font-black text-white block">{formatNumber(userMemes.length)}</span>
            <span className="text-[10px] text-[#71717A] font-bold uppercase">Memes</span>
          </div>
          <div className="w-[1px] bg-[#27272A]" />
          <div className="text-center">
            <span className="text-sm font-black text-white block">{formatNumber(user.followerCount)}</span>
            <span className="text-[10px] text-[#71717A] font-bold uppercase">Followers</span>
          </div>
          <div className="w-[1px] bg-[#27272A]" />
          <div className="text-center">
            <span className="text-sm font-black text-white block">{formatNumber(user.followingCount)}</span>
            <span className="text-[10px] text-[#71717A] font-bold uppercase">Following</span>
          </div>
          <div className="w-[1px] bg-[#27272A]" />
          <div className="text-center">
            <span className="text-sm font-black text-[#E6FF00] block">{formatNumber(user.totalLikes)}</span>
            <span className="text-[10px] text-[#71717A] font-bold uppercase">Likes</span>
          </div>
        </div>

        {/* Edit & Share Buttons */}
        <div className="w-full flex space-x-2">
          <button
            onClick={() => setShowEdit(true)}
            className="flex-1 py-2.5 rounded-full bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-bold border border-[#27272A] flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-2.5 rounded-full bg-[#E6FF00] hover:bg-[#d8f000] text-[#0A0A0A] text-xs font-black flex items-center justify-center space-x-1.5 shadow-[0_0_12px_rgba(230,255,0,0.3)] transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />}
            <span>{copied ? 'Link Copied!' : 'Share Profile'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-[#27272A] bg-[#0A0A0A]">
        <button
          onClick={() => setActiveTab('my_memes')}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-1 border-b-2 transition-colors ${
            activeTab === 'my_memes' ? 'border-[#E6FF00] text-[#E6FF00]' : 'border-transparent text-[#71717A] hover:text-[#A1A1AA]'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>My Memes</span>
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-1 border-b-2 transition-colors ${
            activeTab === 'saved' ? 'border-[#E6FF00] text-[#E6FF00]' : 'border-transparent text-[#71717A] hover:text-[#A1A1AA]'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved ({savedMemes.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('liked')}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-1 border-b-2 transition-colors ${
            activeTab === 'liked' ? 'border-[#E6FF00] text-[#E6FF00]' : 'border-transparent text-[#71717A] hover:text-[#A1A1AA]'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Liked ({likedMemes.length})</span>
        </button>
      </div>

      {/* 3-Column Thumbnail Grid */}
      <div>
        {activeList.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <span className="text-3xl">📭</span>
            <p className="text-xs text-[#A1A1AA] font-bold">
              {activeTab === 'my_memes'
                ? "You haven't created any memes yet. Tap + to craft one in Meme Studio!"
                : activeTab === 'saved'
                ? 'No saved memes yet.'
                : 'No liked memes yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {activeList.map((meme) => (
              <div
                key={meme.id}
                onClick={() => onSelectMeme(meme)}
                className="relative aspect-square rounded-xl overflow-hidden border border-[#27272A] hover:border-[#E6FF00] cursor-pointer group bg-[#0A0A0A]"
              >
                <img
                  src={meme.mediaUrl}
                  alt={meme.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-xs px-1.5 py-0.5 rounded-full border border-[#E6FF00]/40 flex items-center space-x-0.5 pointer-events-none">
                  <span className="text-[8px] font-bold text-white">Sekaa</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showEdit && <EditProfileSheet user={user} onClose={() => setShowEdit(false)} />}
      {showSettings && <SettingsSheet onClose={() => setShowSettings(false)} />}
    </div>
  );
};