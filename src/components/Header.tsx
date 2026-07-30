import React from 'react';
import { Zap, Bell, Search, X } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  showSearch,
  setShowSearch,
  unreadNotificationsCount = 2,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#27272A] px-4 py-3 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center space-x-2.5">
        <div className="w-9 h-9 rounded-full bg-[#E6FF00] flex items-center justify-center text-[#0A0A0A] shadow-[0_0_15px_rgba(230,255,0,0.4)]">
          <Zap className="w-5 h-5 fill-current stroke-current stroke-1" />
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-xl font-black tracking-wider text-white">SEKA</span>
          <span className="text-[10px] font-bold bg-[#E6FF00]/15 text-[#E6FF00] border border-[#E6FF00]/30 px-1.5 py-0.5 rounded-full uppercase">
            MEME
          </span>
        </div>
      </div>

      {/* Expandable Search Input or Action Icons */}
      <div className="flex items-center space-x-2">
        {showSearch ? (
          <div className="relative flex items-center animate-in fade-in duration-150">
            <input
              type="text"
              placeholder="Search memes, tags, creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-48 sm:w-64 bg-[#27272A] text-white text-xs pl-8 pr-7 py-2 rounded-full border border-[#E6FF00]/40 focus:outline-none focus:border-[#E6FF00]"
            />
            <Search className="w-3.5 h-3.5 text-[#A1A1AA] absolute left-2.5" />
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
              }}
              className="absolute right-2 text-[#A1A1AA] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setShowSearch(true)}
              className="w-9 h-9 rounded-full bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] flex items-center justify-center text-[#A1A1AA] hover:text-white transition-colors"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <div className="relative">
              <button
                onClick={() => alert('Notifications: @giga_coder liked your post! 🔥')}
                className="w-9 h-9 rounded-full bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] flex items-center justify-center text-[#A1A1AA] hover:text-white transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
              </button>
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E6FF00] text-[#0A0A0A] text-[10px] font-black rounded-full flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};
