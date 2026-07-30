import React, { useState } from 'react';
import { ChevronLeft, Send, Users, Zap } from 'lucide-react';
import { ChatThread, ChatMessage, MemePost } from '../types';
import { CURRENT_USER } from '../data/mockData';

interface ChatScreenProps {
  threads: ChatThread[];
  onSendMessage: (threadId: string, text?: string, meme?: MemePost) => void;
  onOpenMemeTray: () => void;
  selectedMemeForChat?: MemePost | null;
  onClearSelectedMeme?: () => void;
  onReStatusMeme?: (meme: MemePost) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  threads,
  onSendMessage,
  onOpenMemeTray,
  selectedMemeForChat,
  onClearSelectedMeme,
  onReStatusMeme,
}) => {
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');

  const activeThread = threads.find((t) => t.id === activeThreadId);

  const handleSend = () => {
    if (!activeThreadId) return;
    if (!inputText.trim() && !selectedMemeForChat) return;

    onSendMessage(
      activeThreadId,
      inputText.trim() || undefined,
      selectedMemeForChat || undefined
    );
    setInputText('');
    if (onClearSelectedMeme) onClearSelectedMeme();
  };

  // THREAD LIST VIEW
  if (!activeThread) {
    return (
      <div className="pb-24 pt-4 px-4 space-y-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-white">Meme Chats</h1>
            <span className="text-[10px] font-bold bg-[#E6FF00] text-[#0A0A0A] px-2 py-0.5 rounded-full uppercase">
              Meme-Native ⚡
            </span>
          </div>
        </div>

        {/* Thread List */}
        <div className="space-y-2">
          {threads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => setActiveThreadId(thread.id)}
              className="bg-[#18181B] border border-[#27272A] hover:border-[#E6FF00] rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={thread.avatar}
                    alt={thread.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#E6FF00]"
                  />
                  {thread.isGroup && (
                    <span className="absolute -bottom-1 -right-1 bg-[#27272A] text-white p-1 rounded-full border border-[#0A0A0A]">
                      <Users className="w-3 h-3 text-[#E6FF00]" />
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs font-bold text-white group-hover:text-[#E6FF00] transition-colors">
                      {thread.name}
                    </h3>
                  </div>
                  <p
                    className={`text-xs truncate max-w-[200px] mt-0.5 ${
                      thread.unreadCount > 0 ? 'font-bold text-white' : 'text-[#A1A1AA]'
                    }`}
                  >
                    {thread.lastMessage}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-1">
                <span className="text-[10px] text-[#71717A]">{thread.timestamp}</span>
                {thread.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-[#E6FF00] text-[#0A0A0A] text-[10px] font-black rounded-full flex items-center justify-center">
                    {thread.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // CONVERSATION VIEW
  return (
    <div className="fixed inset-0 z-30 bg-[#0A0A0A] flex flex-col max-w-lg mx-auto">
      {/* Top Conversation Bar */}
      <div className="bg-[#18181B] border-b border-[#27272A] px-4 py-3 flex items-center space-x-3">
        <button
          onClick={() => setActiveThreadId(null)}
          className="w-8 h-8 rounded-full bg-[#27272A] flex items-center justify-center text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <img
          src={activeThread.avatar}
          alt={activeThread.name}
          className="w-10 h-10 rounded-full object-cover border border-[#E6FF00]"
        />

        <div>
          <h3 className="text-xs font-bold text-white">{activeThread.name}</h3>
          <span className="text-[10px] font-semibold text-[#22D3EE] block">
            Online • Meme Drop Ready ⚡
          </span>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeThread.messages.map((msg: ChatMessage) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}
          >
            {!msg.isMine && (
              <span className="text-[10px] font-bold text-[#A1A1AA] mb-1 px-1">
                {msg.senderName}
              </span>
            )}

            <div
              className={`max-w-[80%] rounded-2xl p-3 shadow-md space-y-2 ${
                msg.isMine
                  ? 'bg-[#E6FF00] text-[#0A0A0A] rounded-tr-none font-medium'
                  : 'bg-[#18181B] text-white border border-[#27272A] rounded-tl-none'
              }`}
            >
              {/* Embedded Meme Image if present */}
              {msg.meme && (
                <div
                  className="rounded-xl overflow-hidden border border-black/20 bg-black relative cursor-pointer"
                  onClick={() => onReStatusMeme && onReStatusMeme(msg.meme!)}
                >
                  <img
                    src={msg.meme.mediaUrl}
                    alt={msg.meme.caption}
                    className="w-full h-auto object-cover max-h-56"
                  />
                  {/* Watermark Pill */}
                  <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-xs px-2 py-0.5 rounded-full border border-[#E6FF00]/40 flex items-center space-x-1">
                    <span className="text-[#FF3366] text-[9px] font-black">⚡</span>
                    <span className="text-[9px] font-bold text-white">Seka</span>
                  </div>
                  <div className="p-2 bg-black/80 backdrop-blur-xs text-[10px] font-bold text-[#E6FF00] flex items-center justify-between">
                    <span>{msg.meme.caption}</span>
                    <span className="text-[9px] text-[#22D3EE] underline">Tap & hold to re-status</span>
                  </div>
                </div>
              )}

              {msg.text && <p className="text-xs leading-relaxed">{msg.text}</p>}
            </div>
            <span className="text-[9px] text-[#71717A] mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}
      </div>

      {/* Selected Meme Preview before sending */}
      {selectedMemeForChat && (
        <div className="px-4 py-2 bg-[#18181B] border-t border-[#27272A] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src={selectedMemeForChat.mediaUrl}
              alt="Meme preview"
              className="w-10 h-10 rounded-lg object-cover border border-[#E6FF00]"
            />
            <span className="text-xs text-white font-bold truncate max-w-[200px]">
              Ready to send: {selectedMemeForChat.caption}
            </span>
          </div>
          <button
            onClick={onClearSelectedMeme}
            className="text-xs text-[#FF3366] font-bold hover:underline"
          >
            Remove
          </button>
        </div>
      )}

      {/* Composer Bar */}
      <div className="p-3 bg-[#18181B] border-t border-[#27272A] flex items-center space-x-2">
        {/* Dedicated Meme Tray button */}
        <button
          onClick={onOpenMemeTray}
          className="flex items-center space-x-1 bg-[#27272A] hover:bg-[#E6FF00]/20 text-[#E6FF00] border border-[#E6FF00]/40 px-3 py-2 rounded-full text-xs font-black transition-all"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>⚡ Memes</span>
        </button>

        {/* Text input */}
        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-[#27272A] text-white text-xs px-4 py-2.5 rounded-full border border-[#27272A] focus:outline-none focus:border-[#E6FF00]"
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!inputText.trim() && !selectedMemeForChat}
          className="w-10 h-10 rounded-full bg-[#E6FF00] disabled:bg-[#27272A] disabled:text-[#71717A] text-[#0A0A0A] flex items-center justify-center font-bold transition-all shadow-[0_0_10px_rgba(230,255,0,0.3)]"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
