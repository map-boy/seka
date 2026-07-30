import React, { useEffect, useState } from 'react';
import { X, Eye, Zap, MessageSquare } from 'lucide-react';
import { StatusItem } from '../types';

interface StatusViewerProps {
  status: StatusItem | null;
  onClose: () => void;
  onPostToMyStatus: (status: StatusItem) => void;
  onShareToChat: (status: StatusItem) => void;
}

export const StatusViewer: React.FC<StatusViewerProps> = ({
  status,
  onClose,
  onPostToMyStatus,
  onShareToChat,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!status) return;
    setProgress(0);

    const DURATION_MS = 5000;
    const INTERVAL_MS = 50;
    const step = (INTERVAL_MS / DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          onClose();
          return 100;
        }
        return prev + step;
      });
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, [status, onClose]);

  if (!status) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between animate-in fade-in duration-200">
      {/* Top Overlay Controls & Progress Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4 space-y-3">
        {/* 5-second Progress Bar */}
        <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
          <div
            className="bg-[#E6FF00] h-full transition-all duration-75 shadow-[0_0_8px_#E6FF00]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Poster User Info & Close Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full p-[2px] bg-[#E6FF00]">
              <img
                src={status.creatorAvatar}
                alt={status.creatorName}
                className="w-full h-full rounded-full object-cover border border-black"
              />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">{status.creatorName}</span>
              <span className="text-[10px] text-[#A1A1AA]">{status.timestamp}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Full-Bleed Media */}
      <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
        <img
          src={status.mediaUrl}
          alt={status.caption}
          className="max-h-full max-w-full object-contain"
        />

        {/* Permanent Seka Watermark Badge (bottom-right of media) */}
        <div className="absolute bottom-20 right-4 bg-[#0A0A0A]/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#E6FF00]/40 flex items-center space-x-1 shadow-lg">
          <span className="text-[#FF3366] text-sm font-black">⚡</span>
          <span className="text-xs font-black text-white">Seka</span>
        </div>
      </div>

      {/* Bottom Overlay Actions & Caption */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 space-y-3 max-w-lg mx-auto w-full">
        {/* Caption */}
        {status.caption && (
          <p className="text-xs font-semibold text-white text-center px-4 leading-relaxed drop-shadow">
            {status.caption}
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          {/* Views count pill */}
          <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-full text-[11px] font-bold text-[#A1A1AA]">
            <Eye className="w-3.5 h-3.5 text-[#E6FF00]" />
            <span>{status.views} views</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Post to My Status */}
            <button
              onClick={() => {
                onPostToMyStatus(status);
                onClose();
              }}
              className="flex items-center space-x-1.5 bg-[#E6FF00] hover:bg-[#d8f000] text-[#0A0A0A] px-3 py-1.5 rounded-full text-xs font-black shadow-[0_0_12px_rgba(230,255,0,0.4)] transition-all"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Post to Status</span>
            </button>

            {/* Chat button */}
            <button
              onClick={() => {
                onShareToChat(status);
                onClose();
              }}
              className="flex items-center space-x-1.5 bg-[#27272A] hover:bg-[#3F3F46] text-white px-3 py-1.5 rounded-full text-xs font-bold border border-[#27272A] transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
