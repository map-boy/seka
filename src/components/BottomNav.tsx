import React from 'react';
import { Home, Compass, Plus, MessageSquare, User } from 'lucide-react';

export type TabType = 'home' | 'discover' | 'create' | 'chat' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  unreadChatCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  unreadChatCount = 3,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-[#27272A] px-2 py-1.5 max-w-lg mx-auto">
      <div className="flex items-center justify-around relative">
        {/* Home Tab */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-colors ${
            activeTab === 'home' ? 'text-[#E6FF00]' : 'text-[#71717A] hover:text-[#A1A1AA]'
          }`}
        >
          <Home className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] font-bold mt-1">Home</span>
        </button>

        {/* Discover Tab */}
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-colors ${
            activeTab === 'discover' ? 'text-[#E6FF00]' : 'text-[#71717A] hover:text-[#A1A1AA]'
          }`}
        >
          <Compass className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] font-bold mt-1">Discover</span>
        </button>

        {/* Center CREATE FAB */}
        <div className="relative -top-5">
          <button
            onClick={() => setActiveTab('create')}
            className={`w-14 h-14 rounded-full bg-[#E6FF00] hover:bg-[#d8f000] text-[#0A0A0A] flex items-center justify-center shadow-[0_0_20px_rgba(230,255,0,0.5)] border-4 border-[#0A0A0A] transform active:scale-95 transition-all ${
              activeTab === 'create' ? 'ring-2 ring-[#E6FF00] ring-offset-2 ring-offset-[#0A0A0A]' : ''
            }`}
            title="Create Meme"
          >
            <Plus className="w-8 h-8 stroke-[3]" />
          </button>
        </div>

        {/* Chat Tab */}
        <button
          onClick={() => setActiveTab('chat')}
          className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition-colors ${
            activeTab === 'chat' ? 'text-[#E6FF00]' : 'text-[#71717A] hover:text-[#A1A1AA]'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 stroke-[2.2]" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#E6FF00] text-[#0A0A0A] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {unreadChatCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-1">Chat</span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-colors ${
            activeTab === 'profile' ? 'text-[#E6FF00]' : 'text-[#71717A] hover:text-[#A1A1AA]'
          }`}
        >
          <User className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] font-bold mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
};
