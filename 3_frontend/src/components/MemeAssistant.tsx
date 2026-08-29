import React, { useEffect, useRef, useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import type { MemePost } from '../types';
import { askAssistant, type AssistantTurn } from '../lib/rag';

interface MemeAssistantProps {
  isOpen: boolean;
  memes: MemePost[];
  onClose: () => void;
  onSelectMeme: (meme: MemePost) => void;
  /** Pulls cited memes that the paginated feed has not loaded yet. */
  onEnsureMemesLoaded?: (memeIds: string[]) => void;
}

interface Turn {
  role: 'user' | 'assistant';
  content: string;
  /** Ids, not memes: cited memes may still be loading when the answer arrives. */
  sourceIds?: string[];
  /** Set when the answer came from the retrieval-only fallback, not a model. */
  retrievalOnly?: boolean;
  failed?: boolean;
}

const SUGGESTIONS = [
  'What is trending in Tech right now?',
  'Find me a meme about deploying on a Friday',
  'Any wholesome memes to cheer someone up?',
];

export const MemeAssistant: React.FC<MemeAssistantProps> = ({
  isOpen,
  memes,
  onClose,
  onSelectMeme,
  onEnsureMemesLoaded,
}) => {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns, pending]);

  if (!isOpen) return null;

  const memesById = new Map(memes.map((meme) => [meme.id, meme]));

  const resolveSources = (ids: string[]): MemePost[] =>
    ids.map((id) => memesById.get(id)).filter((meme): meme is MemePost => !!meme);

  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || pending) return;

    const history: AssistantTurn[] = turns.map((turn) => ({
      role: turn.role,
      content: turn.content,
    }));

    setTurns((prev) => [...prev, { role: 'user', content: trimmed }]);
    setInput('');
    setPending(true);

    try {
      const response = await askAssistant({ question: trimmed, history });
      const sourceIds = response.sources.map((source) => source.memeId);
      onEnsureMemesLoaded?.(sourceIds);
      setTurns((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.answer,
          sourceIds,
          retrievalOnly: !response.generative,
        },
      ]);
    } catch {
      setTurns((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I couldn't reach the meme assistant. Try the search tab instead.",
          failed: true,
        },
      ]);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
      <div className="bg-[#18181B] border-t border-[#27272A] rounded-t-3xl h-[85vh] flex flex-col shadow-2xl max-w-lg mx-auto w-full">
        <div className="p-4 border-b border-[#27272A] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#E6FF00]" />
            <h3 className="text-sm font-black text-white">Meme Assistant</h3>
            <span className="text-[10px] bg-[#E6FF00]/15 text-[#E6FF00] px-2 py-0.5 rounded-full font-bold">
              Beta
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#27272A] flex items-center justify-center text-[#A1A1AA] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {turns.length === 0 && (
            <div className="space-y-3 py-6 text-center">
              <span className="text-3xl">🤖</span>
              <p className="text-xs text-[#A1A1AA]">
                Ask about a mood, a topic, or a creator. Answers come only from memes on Seka.
              </p>
              <div className="space-y-2 pt-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => ask(suggestion)}
                    className="w-full px-3 py-2 rounded-2xl bg-[#0A0A0A] border border-[#27272A] text-xs font-semibold text-[#A1A1AA] hover:text-white hover:border-[#3F3F46] transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {turns.map((turn, index) => {
            const sources = turn.sourceIds ? resolveSources(turn.sourceIds) : [];
            return (
            <div
              key={index}
              className={turn.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
            >
              <div
                className={`max-w-[85%] space-y-2 ${
                  turn.role === 'user'
                    ? 'bg-[#E6FF00] text-[#0A0A0A] rounded-2xl rounded-br-sm px-3 py-2'
                    : 'bg-[#0A0A0A] border border-[#27272A] rounded-2xl rounded-bl-sm px-3 py-2'
                }`}
              >
                <p
                  className={`text-xs font-semibold leading-relaxed ${
                    turn.role === 'user'
                      ? 'text-[#0A0A0A]'
                      : turn.failed
                        ? 'text-[#FF3366]'
                        : 'text-white'
                  }`}
                >
                  {turn.content}
                </p>

                {turn.retrievalOnly && (
                  <p className="text-[10px] text-[#71717A] font-bold uppercase tracking-wider">
                    Retrieved matches
                  </p>
                )}

                {sources.length > 0 && (
                  <div className="flex space-x-2 overflow-x-auto no-scrollbar pt-1">
                    {sources.map((meme, sourceIndex) => (
                      <button
                        key={meme.id}
                        onClick={() => onSelectMeme(meme)}
                        className="flex-shrink-0 w-20 text-left group"
                      >
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-black border border-[#27272A] group-hover:border-[#E6FF00] transition-colors">
                          <img
                            src={meme.mediaUrl}
                            alt={meme.caption}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-1 left-1 bg-[#0A0A0A]/85 text-[#E6FF00] text-[9px] font-black px-1.5 rounded-full">
                            {sourceIndex + 1}
                          </span>
                        </div>
                        <p className="text-[9px] text-[#A1A1AA] mt-1 line-clamp-2 leading-tight">
                          {meme.caption}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            );
          })}

          {pending && (
            <div className="flex justify-start">
              <div className="bg-[#0A0A0A] border border-[#27272A] rounded-2xl rounded-bl-sm px-3 py-2">
                <p className="text-xs text-[#71717A] font-semibold">Searching the meme index...</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-[#27272A] flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') ask(input);
            }}
            placeholder="Ask about any meme..."
            className="flex-1 bg-[#0A0A0A] text-white text-xs px-4 py-3 rounded-full border border-[#27272A] focus:outline-none focus:border-[#E6FF00]"
          />
          <button
            onClick={() => ask(input)}
            disabled={pending || !input.trim()}
            className="w-10 h-10 rounded-full bg-[#E6FF00] text-[#0A0A0A] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
