import React, { useEffect, useState } from 'react';
import { ChevronLeft, Send, Users, Zap, Plus } from 'lucide-react';
import { MemePost, Creator } from '../types';
import { useAuth } from '../hooks/AuthContext';
import {
  subscribeToThreads,
  subscribeToMessages,
  createThread,
  sendMessage,
  ChatThreadDoc,
  ChatMessageDoc,
} from '../lib/firestore/chat';
import { subscribeToCreators } from '../lib/firestore/creators';

interface ChatScreenProps {
  onOpenMemeTray: () => void;
  selectedMemeForChat?: MemePost | null;
  onClearSelectedMeme?: () => void;
  onReStatusMeme?: (meme: MemePost) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  onOpenMemeTray,
  selectedMemeForChat,
  onClearSelectedMeme,
  onReStatusMeme,
}) => {
  const { currentUser } = useAuth();
  const [threads, setThreads] = useState<(ChatThreadDoc & { id: string })[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<(ChatMessageDoc & { id: string })[]>([]);
  const [inputText, setInputText] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    return subscribeToThreads(currentUser.uid, setThreads);
  }, [currentUser]);

  useEffect(() => subscribeToCreators(setCreators), []);

  useEffect(() => {
    if (!activeThreadId) { setMessages([]); return; }
    return subscribeToMessages(activeThreadId, setMessages);
  }, [activeThreadId]);

  const activeThread = threads.find((t) => t.id === activeThreadId);

  const handleSend = async () => {
    if (!activeThreadId || !currentUser) return;
    if (!inputText.trim() && !selectedMemeForChat) return;

    await sendMessage(
      activeThreadId,
      currentUser.uid,
      currentUser.displayName || 'User',
      currentUser.photoURL || '',
      inputText.trim() || undefined,
      selectedMemeForChat ? selectedMemeForChat.id : undefined
    );
    setInputText('');
    if (onClearSelectedMeme) onClearSelectedMeme();
  };

  const handleStartChat = async (otherUser: Creator) => {
    if (!currentUser) return;
    const threadId = await createThread({
      participantIds: [currentUser.uid, otherUser.id],
      name: otherUser.name,
      avatar: otherUser.avatar,
      isGroup: false,
    });
    setShowNewChat(false);
    setActiveThreadId(threadId);
  };

  if (!currentUser) return null;

  // NEW CHAT PICKER
  if (showNewChat) {
    return (
      <div className="pb-24 pt-4 px-4 space-y-4 max-w-lg mx-auto">
        <div className="flex items-center space-x-3 border-b border-[#27272A] pb-3">
          <button
            onClick={() => setShowNewChat(false)}
            className="w-8 h-8 rounded-full bg-[#27272A] flex items-center justify-center text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-black text-white">New Chat</h1>
        </div>
        <div className="space-y-2">
          {creators.filter((c) => c.id !== currentUser.uid).map((c) => (
            <div
              key={c.id}
              onClick={() => handleStartChat(c)}
              className="bg-[#18181B] border border-[#27272A] hover:border-[#E6FF00] rounded-2xl p-3.5 flex items-center space-x-3 cursor-pointer transition-all"
            >
              <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#E6FF00]" />
              <div>
                <h3 className="text-xs font-bold text-white">{c.name}</h3>
                <p className="text-xs text-[#A1A1AA]">@{c.handle}</p>
              </div>
            </div>
          ))}
          {creators.length <= 1 && (
            <p className="text-xs text-[#71717A] text-center py-8">No other users yet.</p>
          )}
        </div>
      </div>
    );
  }

  // THREAD LIST VIEW
  if (!activeThread) {
    return (
      <div className="pb-24 pt-4 px-4 space-y-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-white">Meme Chats</h1>
            <span className="text-[10px] font-bold bg-[#E6FF00] text-[#0A0A0A] px-2 py-0.5 rounded-full uppercase">
              Meme-Native
            </span>
          </div>
          <button
            onClick={() => setShowNewChat(true)}
            className="w-8 h-8 rounded-full bg-[#E6FF00] flex items-center justify-center text-[#0A0A0A]"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

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
                  <h3 className="text-xs font-bold text-white group-hover:text-[#E6FF00] transition-colors">
                    {thread.name}
                  </h3>
                  <p className="text-xs truncate max-w-[200px] mt-0.5 text-[#A1A1AA]">
                    {thread.lastMessage || 'Say hello!'}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {threads.length === 0 && (
            <p className="text-xs text-[#71717A] text-center py-8">
              No chats yet. Tap + to start one.
            </p>
          )}
        </div>
      </div>
    );
  }

  // CONVERSATION VIEW
  return (
    <div className="fixed inset-0 z-30 bg-[#0A0A0A] flex flex-col max-w-lg mx-auto">
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
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUser.uid;
          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
              {!isMine && (
                <span className="text-[10px] font-bold text-[#A1A1AA] mb-1 px-1">
                  {msg.senderName}
                </span>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-3 shadow-md space-y-2 ${
                  isMine
                    ? 'bg-[#E6FF00] text-[#0A0A0A] rounded-tr-none font-medium'
                    : 'bg-[#18181B] text-white border border-[#27272A] rounded-tl-none'
                }`}
              >
                {msg.memeId && selectedMemeForChat?.id === msg.memeId && (
                  <div className="rounded-xl overflow-hidden border border-black/20 bg-black relative">
                    <img
                      src={selectedMemeForChat.mediaUrl}
                      alt={selectedMemeForChat.caption}
                      className="w-full h-auto object-cover max-h-56"
                    />
                  </div>
                )}
                {msg.text && <p className="text-xs leading-relaxed">{msg.text}</p>}
              </div>
            </div>
          );
        })}
      </div>

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
          <button onClick={onClearSelectedMeme} className="text-xs text-[#FF3366] font-bold hover:underline">
            Remove
          </button>
        </div>
      )}

      <div className="p-3 bg-[#18181B] border-t border-[#27272A] flex items-center space-x-2">
        <button
          onClick={onOpenMemeTray}
          className="flex items-center space-x-1 bg-[#27272A] hover:bg-[#E6FF00]/20 text-[#E6FF00] border border-[#E6FF00]/40 px-3 py-2 rounded-full text-xs font-black transition-all"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Memes</span>
        </button>
        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-[#27272A] text-white text-xs px-4 py-2.5 rounded-full border border-[#27272A] focus:outline-none focus:border-[#E6FF00]"
        />
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
