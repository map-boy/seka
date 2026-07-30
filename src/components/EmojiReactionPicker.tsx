import React from 'react';

interface EmojiReactionPickerProps {
 onSelectEmoji: (emoji: string) => void;
 onClose: () => void;
}

const EMOJIS = ['', '', '', 'ðŸŽ¯', 'ðŸ’©', '', '', ''];

export const EmojiReactionPicker: React.FC<EmojiReactionPickerProps> = ({
 onSelectEmoji,
 onClose,
}) => {
 return (
 <div
 className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
 onClick={onClose}
 >
 <div
 className="bg-[#18181B] border-2 border-[#E6FF00] rounded-2xl p-4 shadow-2xl max-w-xs w-full animate-in zoom-in-90 duration-200"
 onClick={(e) => e.stopPropagation()}
 >
 <p className="text-center text-xs font-black text-white mb-3 uppercase tracking-wider">
 Choose Sekaa Reaction
 </p>
 <div className="grid grid-cols-4 gap-2">
 {EMOJIS.map((emoji) => (
 <button
 key={emoji}
 onClick={() => {
 onSelectEmoji(emoji);
 onClose();
 }}
 className="text-2xl p-2.5 rounded-xl bg-[#27272A] hover:bg-[#E6FF00]/20 hover:scale-115 border border-[#27272A] hover:border-[#E6FF00] transition-all flex items-center justify-center active:scale-90"
 >
 {emoji}
 </button>
 ))}
 </div>
 </div>
 </div>
 );
};

