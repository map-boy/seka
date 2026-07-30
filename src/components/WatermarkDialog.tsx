import React, { useEffect, useState } from 'react';
import { Zap, CheckCircle2, Download, X } from 'lucide-react';
import { MemePost } from '../types';
import { createWatermarkedCanvas, triggerFileDownload } from '../utils/watermark';

interface WatermarkDialogProps {
  meme: MemePost | null;
  onClose: () => void;
}

export const WatermarkDialog: React.FC<WatermarkDialogProps> = ({ meme, onClose }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [generatedDataUrl, setGeneratedDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!meme) return;
    setProgress(0);
    setIsComplete(false);
    setGeneratedDataUrl(null);

    // Prepare watermarked image composite using real HTML5 canvas
    createWatermarkedCanvas({
      sourceImageUrl: meme.mediaUrl,
      topText: meme.caption.length > 30 ? '' : meme.caption,
    }).then((dataUrl) => {
      setGeneratedDataUrl(dataUrl);
    });

    // Animate progress bar 0 -> 100%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          return 100;
        }
        return prev + 20;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [meme]);

  if (!meme) return null;

  const handleDownloadConfirm = () => {
    if (generatedDataUrl) {
      triggerFileDownload(generatedDataUrl, `seka-meme-${meme.id}.png`);
    } else {
      // Fallback
      triggerFileDownload(meme.mediaUrl, `seka-meme-${meme.id}.png`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#18181B] border border-[#27272A] rounded-2xl p-6 text-center shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#71717A] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {!isComplete ? (
          <div className="py-4 space-y-4">
            {/* Spinning/pulsing lime bolt */}
            <div className="w-16 h-16 rounded-full bg-[#E6FF00]/15 border-2 border-[#E6FF00] flex items-center justify-center mx-auto animate-pulse shadow-[0_0_20px_rgba(230,255,0,0.4)]">
              <Zap className="w-8 h-8 text-[#E6FF00] fill-current animate-spin" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-white">Watermarking with Seka...</h3>
              <p className="text-xs text-[#A1A1AA]">
                Stamping official Seka badge onto bottom-right corner
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#27272A] h-2.5 rounded-full overflow-hidden border border-[#27272A]">
              <div
                className="bg-[#E6FF00] h-full transition-all duration-200 shadow-[0_0_10px_#E6FF00]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-[#E6FF00] block">{progress}%</span>
          </div>
        ) : (
          <div className="py-2 space-y-4 animate-in zoom-in-95 duration-200">
            {/* Checkmark */}
            <div className="w-16 h-16 rounded-full bg-[#E6FF00] text-[#0A0A0A] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(230,255,0,0.6)]">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Export Complete!</h3>
              <p className="text-xs font-bold text-[#E6FF00]">
                Saved to Gallery with Seka Watermark! 🚀
              </p>
            </div>

            {/* Preview thumbnail with watermark */}
            {generatedDataUrl && (
              <div className="w-40 h-32 rounded-xl border border-[#27272A] overflow-hidden mx-auto bg-black relative shadow-inner">
                <img src={generatedDataUrl} alt="Watermarked preview" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Done & Download button */}
            <button
              onClick={handleDownloadConfirm}
              className="w-full py-3 rounded-full bg-[#E6FF00] hover:bg-[#d8f000] text-[#0A0A0A] font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(230,255,0,0.4)] transition-all"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Download PNG File Now</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
