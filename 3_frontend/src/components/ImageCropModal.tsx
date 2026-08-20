import React, { useRef, useState } from 'react';
import { Check, X, Move } from 'lucide-react';

interface ImageCropModalProps {
  imageUrl: string;
  onCancel: () => void;
  onConfirm: (croppedDataUrl: string, width: number, height: number) => void;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const MIN_SIZE = 10;

export const ImageCropModal: React.FC<ImageCropModalProps> = ({ imageUrl, onCancel, onConfirm }) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [box, setBox] = useState<Box>({ x: 10, y: 10, w: 80, h: 80 });
  const dragState = useRef<{ mode: 'move' | 'nw' | 'ne' | 'sw' | 'se'; startX: number; startY: number; startBox: Box } | null>(null);

  const handleImgLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
  };

  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

  const onPointerDown = (mode: 'move' | 'nw' | 'ne' | 'sw' | 'se') => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    dragState.current = { mode, startX: e.clientX, startY: e.clientY, startBox: box };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragState.current;
    const container = containerRef.current;
    if (!drag || !container) return;

    const rect = container.getBoundingClientRect();
    const dxPct = ((e.clientX - drag.startX) / rect.width) * 100;
    const dyPct = ((e.clientY - drag.startY) / rect.height) * 100;
    let next = { ...drag.startBox };

    if (drag.mode === 'move') {
      next.x = clamp(drag.startBox.x + dxPct, 0, 100 - drag.startBox.w);
      next.y = clamp(drag.startBox.y + dyPct, 0, 100 - drag.startBox.h);
    } else {
      let { x, y, w, h } = drag.startBox;
      if (drag.mode === 'se') {
        w = clamp(w + dxPct, MIN_SIZE, 100 - x);
        h = clamp(h + dyPct, MIN_SIZE, 100 - y);
      } else if (drag.mode === 'sw') {
        const newX = clamp(x + dxPct, 0, x + w - MIN_SIZE);
        w = x + w - newX;
        x = newX;
        h = clamp(h + dyPct, MIN_SIZE, 100 - y);
      } else if (drag.mode === 'ne') {
        w = clamp(w + dxPct, MIN_SIZE, 100 - x);
        const newY = clamp(y + dyPct, 0, y + h - MIN_SIZE);
        h = y + h - newY;
        y = newY;
      } else if (drag.mode === 'nw') {
        const newX = clamp(x + dxPct, 0, x + w - MIN_SIZE);
        w = x + w - newX;
        x = newX;
        const newY = clamp(y + dyPct, 0, y + h - MIN_SIZE);
        h = y + h - newY;
        y = newY;
      }
      next = { x, y, w, h };
    }

    setBox(next);
  };

  const onPointerUp = () => {
    dragState.current = null;
  };

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img || !naturalSize) return;

    const sx = Math.round((box.x / 100) * naturalSize.width);
    const sy = Math.round((box.y / 100) * naturalSize.height);
    const sw = Math.round((box.w / 100) * naturalSize.width);
    const sh = Math.round((box.h / 100) * naturalSize.height);

    const canvas = document.createElement('canvas');
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    const dataUrl = canvas.toDataURL('image/png');
    onConfirm(dataUrl, sw, sh);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Crop Your Photo</h3>
          <button onClick={onCancel} className="text-[#71717A] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          ref={containerRef}
          className="relative w-full select-none touch-none bg-black rounded-xl overflow-hidden border border-[#27272A]"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <img
            ref={imgRef}
            src={imageUrl}
            onLoad={handleImgLoad}
            alt="Crop source"
            className="w-full h-auto block max-h-[60vh] object-contain mx-auto pointer-events-none"
            draggable={false}
          />

          <div className="absolute pointer-events-none" style={{ left: 0, top: 0, width: '100%', height: `${box.y}%`, background: 'rgba(0,0,0,0.75)' }} />
          <div className="absolute pointer-events-none" style={{ left: 0, top: `${box.y + box.h}%`, width: '100%', height: `${100 - box.y - box.h}%`, background: 'rgba(0,0,0,0.75)' }} />
          <div className="absolute pointer-events-none" style={{ left: 0, top: `${box.y}%`, width: `${box.x}%`, height: `${box.h}%`, background: 'rgba(0,0,0,0.75)' }} />
          <div className="absolute pointer-events-none" style={{ left: `${box.x + box.w}%`, top: `${box.y}%`, width: `${100 - box.x - box.w}%`, height: `${box.h}%`, background: 'rgba(0,0,0,0.75)' }} />

          <div
            onPointerDown={onPointerDown('move')}
            className="absolute border-2 border-[#E6FF00] cursor-move"
            style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%` }}
          >
            <Move className="w-4 h-4 text-[#E6FF00] absolute top-1 left-1 opacity-60" />
            {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => (
              <div
                key={corner}
                onPointerDown={onPointerDown(corner)}
                className={`absolute w-5 h-5 bg-[#E6FF00] border-2 border-black rounded-full ${
                  corner === 'nw' ? '-top-2.5 -left-2.5 cursor-nwse-resize' :
                  corner === 'ne' ? '-top-2.5 -right-2.5 cursor-nesw-resize' :
                  corner === 'sw' ? '-bottom-2.5 -left-2.5 cursor-nesw-resize' :
                  '-bottom-2.5 -right-2.5 cursor-nwse-resize'
                }`}
              />
            ))}
          </div>
        </div>

        <p className="text-[11px] text-[#A1A1AA] text-center">
          Drag corners to resize, drag inside the box to move. Full resolution is preserved - nothing gets compressed.
        </p>

        <div className="flex items-center space-x-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-full bg-[#27272A] text-white font-black text-xs uppercase tracking-wider">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!naturalSize}
            className="flex-1 py-3 rounded-full bg-[#E6FF00] hover:bg-[#d8f000] disabled:opacity-50 text-[#0A0A0A] font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Use This Crop</span>
          </button>
        </div>
      </div>
    </div>
  );
};
