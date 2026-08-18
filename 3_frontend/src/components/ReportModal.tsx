import React, { useState } from 'react';
import { X, Flag, Loader2, Check } from 'lucide-react';

interface ReportModalProps {
  onSubmit: (reason: string) => Promise<void>;
  onClose: () => void;
  title?: string;
}

const REASONS = ['Spam', 'Harassment or bullying', 'Hate speech', 'Nudity or sexual content', 'Violence', 'Something else'];

export const ReportModal: React.FC<ReportModalProps> = ({ onSubmit, onClose, title = 'Report' }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await onSubmit(selected);
      setDone(true);
      setTimeout(onClose, 1200);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-sm bg-[#0A0A0A] border border-[#27272A] rounded-t-2xl sm:rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flag className="w-4 h-4 text-[#FF3366]" />
            <h3 className="text-base font-black text-white">{title}</h3>
          </div>
          <button onClick={onClose} className="text-[#A1A1AA] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="py-6 flex flex-col items-center space-y-2">
            <Check className="w-8 h-8 text-[#E6FF00]" />
            <p className="text-xs text-white font-bold">Thanks. Our team will review this.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-[#A1A1AA]">Why are you reporting this?</p>
            <div className="space-y-1.5">
              {REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelected(reason)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                    selected === reason
                      ? 'bg-[#E6FF00]/15 border-[#E6FF00] text-[#E6FF00]'
                      : 'bg-[#18181B] border-[#27272A] text-white hover:border-[#3F3F46]'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!selected || submitting}
              className="w-full py-3 rounded-full bg-[#FF3366] disabled:opacity-40 text-white text-sm font-black flex items-center justify-center space-x-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};