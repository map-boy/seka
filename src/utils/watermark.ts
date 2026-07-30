/**
 * Sekaa Real Canvas Watermarking Engine & Export Utility
 * Handles client-side canvas compositing of text, stickers, and the official Sekaa watermark stamp.
 */

export interface CompositeOptions {
 sourceImageUrl: string;
 topText?: string;
 bottomText?: string;
 sticker?: string;
}

/**
 * Composites the canvas with meme text, stickers, and Sekaa's official watermark.
 * Returns a base64 PNG Data URL.
 */
export async function createWatermarkedCanvas(options: CompositeOptions): Promise<string> {
 const { sourceImageUrl, topText, bottomText, sticker } = options;

 return new Promise((resolve, reject) => {
 const img = new Image();
 img.crossOrigin = 'anonymous';
 img.onload = () => {
 const canvas = document.createElement('canvas');
 const ctx = canvas.getContext('2d');
 if (!ctx) {
 reject(new Error('Canvas context unavailable'));
 return;
 }

 // Set canvas size to match source image
 canvas.width = img.naturalWidth || 800;
 canvas.height = img.naturalHeight || 800;

 // 1. Draw base image
 ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

 // 2. Render Impact-style captions if present
 const fontSize = Math.max(28, Math.floor(canvas.width * 0.075));
 ctx.font = `900 ${fontSize}px "Impact", "Arial Black", sans-serif`;
 ctx.textAlign = 'center';
 ctx.fillStyle = '#FFFFFF';
 ctx.strokeStyle = '#000000';
 ctx.lineWidth = Math.max(3, Math.floor(fontSize * 0.12));

 // Top caption
 if (topText && topText.trim()) {
 const text = topText.trim().toUpperCase();
 const x = canvas.width / 2;
 const y = fontSize + 15;
 ctx.strokeText(text, x, y);
 ctx.fillText(text, x, y);
 }

 // Bottom caption
 if (bottomText && bottomText.trim()) {
 const text = bottomText.trim().toUpperCase();
 const x = canvas.width / 2;
 const y = canvas.height - 40;
 ctx.strokeText(text, x, y);
 ctx.fillText(text, x, y);
 }

 // 3. Render Sticker if present
 if (sticker) {
 const stickerSize = Math.floor(canvas.width * 0.2);
 ctx.font = `${stickerSize}px sans-serif`;
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText(sticker, canvas.width / 2, canvas.height / 2);
 }

 // 4. Stamp Official Sekaa Watermark Badge (bottom-right)
 stampSekaaWatermark(ctx, canvas.width, canvas.height);

 // Export as PNG
 resolve(canvas.toDataURL('image/png'));
 };

 img.onerror = (err) => {
 // Fallback: draw on black canvas if image load fails
 const canvas = document.createElement('canvas');
 canvas.width = 800;
 canvas.height = 800;
 const ctx = canvas.getContext('2d');
 if (ctx) {
 ctx.fillStyle = '#18181B';
 ctx.fillRect(0, 0, 800, 800);
 ctx.fillStyle = '#FFFFFF';
 ctx.font = '30px sans-serif';
 ctx.textAlign = 'center';
 ctx.fillText('SEKAA MEME', 400, 400);
 stampSekaaWatermark(ctx, 800, 800);
 resolve(canvas.toDataURL('image/png'));
 } else {
 reject(err);
 }
 };

 img.src = sourceImageUrl;
 });
}

/**
 * Stamps the exact official Sekaa badge onto canvas ctx at bottom right.
 */
export function stampSekaaWatermark(ctx: CanvasRenderingContext2D, width: number, height: number) {
 const badgeWidth = Math.max(120, Math.floor(width * 0.22));
 const badgeHeight = Math.max(36, Math.floor(height * 0.065));
 const margin = Math.max(12, Math.floor(width * 0.03));

 const x = width - badgeWidth - margin;
 const y = height - badgeHeight - margin;
 const radius = badgeHeight / 2;

 ctx.save();
 // Semi-transparent dark pill background (~75% opacity #0A0A0A)
 ctx.fillStyle = 'rgba(10, 10, 10, 0.85)';
 ctx.beginPath();
 ctx.roundRect(x, y, badgeWidth, badgeHeight, radius);
 ctx.fill();

 // Subtle border accent
 ctx.strokeStyle = 'rgba(230, 255, 0, 0.4)';
 ctx.lineWidth = 1.5;
 ctx.stroke();

 // Draw Coral Bolt
 const textX = x + margin * 0.8;
 const textY = y + badgeHeight / 2;

 ctx.font = `bold ${Math.floor(badgeHeight * 0.55)}px sans-serif`;
 ctx.textAlign = 'left';
 ctx.textBaseline = 'middle';

 // Coral Bolt Symbol
 ctx.fillStyle = '#FF3366';
 ctx.fillText('', textX, textY);

 // Sekaa Wordmark
 const boltWidth = Math.floor(badgeHeight * 0.45);
 ctx.fillStyle = '#FFFFFF';
 ctx.font = `800 ${Math.floor(badgeHeight * 0.48)}px sans-serif`;
 ctx.fillText('Sekaa', textX + boltWidth + 4, textY);

 ctx.restore();
}

/**
 * Triggers a real browser download of a Data URL.
 */
export function triggerFileDownload(dataUrl: string, filename = 'sekaa-meme.png') {
 const link = document.createElement('a');
 link.href = dataUrl;
 link.download = filename;
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
}

