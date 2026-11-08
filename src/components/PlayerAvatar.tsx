import React, { useEffect, useRef } from 'react';
import { CropRegion } from '../types/tournament';
import { loadImageElement } from '../utils/cardCanvasRenderer';

interface PlayerAvatarProps {
  photoUrl: string;
  photoCrop?: CropRegion;
  alt: string;
  className?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  photoUrl,
  photoCrop,
  alt,
  className = 'w-20 h-20 rounded-lg',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let active = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    loadImageElement(photoUrl).then((img) => {
      if (!active) return;
      const size = 160;
      canvas.width = size;
      canvas.height = size;
      ctx.clearRect(0, 0, size, size);

      if (!img) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, size, size);
        return;
      }

      if (photoCrop) {
        const sx = img.width * photoCrop.x;
        const sy = img.height * photoCrop.y;
        const sw = img.width * photoCrop.w;
        const sh = img.height * photoCrop.h;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
      } else {
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
      }
    });

    return () => {
      active = false;
    };
  }, [photoUrl, photoCrop]);

  return (
    <div
      className={`overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-800 shrink-0 ${className}`}
    >
      <canvas
        ref={canvasRef}
        aria-label={alt}
        role="img"
        className="w-full h-full object-cover block"
      />
    </div>
  );
};
