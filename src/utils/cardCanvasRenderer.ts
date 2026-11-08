import { CropRegion, PhotoCardConfig } from '../types/tournament';
import { hasText } from './tournamentLogic';

const imageCache = new Map<string, HTMLImageElement>();

export function loadImageElement(url: string): Promise<HTMLImageElement | null> {
  if (!url) return Promise.resolve(null);
  if (imageCache.has(url)) {
    return Promise.resolve(imageCache.get(url)!);
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(url, img);
      resolve(img);
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = url;
  });
}

interface AestheticPalette {
  canvasLightTop: string;
  canvasLightBottom: string;
  waveSoft: string;
  waveMid: string;
  waveDeepStart: string;
  waveDeepMid: string;
  waveDeepEnd: string;
  circleInnerCenter: string;
  circleInnerEdge: string;
  primaryBannerStart: string;
  primaryBannerEnd: string;
  secondaryBanner: string;
  accentGold: string;
  accentGoldDark: string;
  inkDark: string;
  glow: string;
}

function getAestheticPalette(theme: PhotoCardConfig['colorTheme']): AestheticPalette {
  switch (theme) {
    case 'emerald_night':
      return {
        canvasLightTop: '#fafaf7',
        canvasLightBottom: '#ecfdf5',
        waveSoft: 'rgba(16, 185, 129, 0.14)',
        waveMid: 'rgba(5, 150, 105, 0.28)',
        waveDeepStart: '#064e3b',
        waveDeepMid: '#047857',
        waveDeepEnd: '#022c22',
        circleInnerCenter: '#34d399',
        circleInnerEdge: '#059669',
        primaryBannerStart: '#065f46',
        primaryBannerEnd: '#047857',
        secondaryBanner: '#991b1b',
        accentGold: '#fde047',
        accentGoldDark: '#d97706',
        inkDark: '#0f172a',
        glow: 'rgba(16, 185, 129, 0.32)',
      };
    case 'royal_gold':
      return {
        canvasLightTop: '#faf9f5',
        canvasLightBottom: '#eff6ff',
        waveSoft: 'rgba(59, 130, 246, 0.14)',
        waveMid: 'rgba(29, 78, 216, 0.26)',
        waveDeepStart: '#1e3a8a',
        waveDeepMid: '#1d4ed8',
        waveDeepEnd: '#0f172a',
        circleInnerCenter: '#22c55e',
        circleInnerEdge: '#15803d',
        primaryBannerStart: '#1e40af',
        primaryBannerEnd: '#1d4ed8',
        secondaryBanner: '#991b1b',
        accentGold: '#fde047',
        accentGoldDark: '#d97706',
        inkDark: '#0f172a',
        glow: 'rgba(59, 130, 246, 0.32)',
      };
    case 'cyan_stadium':
      return {
        canvasLightTop: '#f8fafc',
        canvasLightBottom: '#ecfeff',
        waveSoft: 'rgba(6, 182, 212, 0.15)',
        waveMid: 'rgba(14, 116, 144, 0.28)',
        waveDeepStart: '#164e63',
        waveDeepMid: '#0e7490',
        waveDeepEnd: '#083344',
        circleInnerCenter: '#2dd4bf',
        circleInnerEdge: '#0f766e',
        primaryBannerStart: '#0369a1',
        primaryBannerEnd: '#0284c7',
        secondaryBanner: '#b91c1c',
        accentGold: '#fde047',
        accentGoldDark: '#d97706',
        inkDark: '#0f172a',
        glow: 'rgba(6, 182, 212, 0.32)',
      };
    case 'crimson_silk':
    default:
      return {
        canvasLightTop: '#faf8f2',
        canvasLightBottom: '#f7efe8',
        waveSoft: 'rgba(244, 63, 94, 0.15)',
        waveMid: 'rgba(225, 29, 72, 0.32)',
        waveDeepStart: '#991b1b',
        waveDeepMid: '#dc2626',
        waveDeepEnd: '#881337',
        circleInnerCenter: '#2ecc71',
        circleInnerEdge: '#16a34a',
        primaryBannerStart: '#1e3a8a',
        primaryBannerEnd: '#2563eb',
        secondaryBanner: '#881337',
        accentGold: '#fde047',
        accentGoldDark: '#d97706',
        inkDark: '#111827',
        glow: 'rgba(225, 29, 72, 0.32)',
      };
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function fitTextSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  initialSize: number,
  minSize = 20,
  weight = 700
): number {
  let size = initialSize;
  while (size > minSize) {
    ctx.font = `${weight} ${size}px "Hind Siliguri", "Plus Jakarta Sans", sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) {
      return size;
    }
    size -= 2;
  }
  return minSize;
}

function drawCroppedOrFullImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  destX: number,
  destY: number,
  destW: number,
  destH: number,
  crop?: CropRegion,
  zoom = 1,
  offsetX = 0,
  offsetY = 0
) {
  if (!img || img.width === 0 || img.height === 0) {
    const grad = ctx.createLinearGradient(destX, destY, destX, destY + destH);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(destX, destY, destW, destH);

    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(destX + destW / 2, destY + destH * 0.36, destW * 0.16, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(destX + destW / 2, destY + destH * 0.85, destW * 0.34, Math.PI, 0);
    ctx.fill();
    return;
  }

  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;

  if (crop) {
    sx = img.width * crop.x;
    sy = img.height * crop.y;
    sw = img.width * crop.w;
    sh = img.height * crop.h;
  }

  const srcRatio = sw / sh;
  const destRatio = destW / destH;
  let finalSw = sw;
  let finalSh = sh;

  if (srcRatio > destRatio) {
    finalSw = sh * destRatio;
    sx += (sw - finalSw) / 2;
  } else {
    finalSh = sw / destRatio;
    sy += (sh - finalSh) / 2;
  }

  const safeZoom = Math.max(0.75, Math.min(2.5, zoom));
  const zoomedSw = finalSw / safeZoom;
  const zoomedSh = finalSh / safeZoom;
  const centerX = sx + finalSw / 2 - (offsetX / 100) * (finalSw * 0.4);
  const centerY = sy + finalSh / 2 - (offsetY / 100) * (finalSh * 0.4);

  const clampedSx = Math.max(0, Math.min(img.width - zoomedSw, centerX - zoomedSw / 2));
  const clampedSy = Math.max(0, Math.min(img.height - zoomedSh, centerY - zoomedSh / 2));

  ctx.drawImage(
    img,
    clampedSx,
    clampedSy,
    zoomedSw,
    zoomedSh,
    destX,
    destY,
    destW,
    destH
  );
}

/**
 * Draws the signature Aesthetic Ivory + Multi-Layered Silk Wave Backdrop
 * modeled directly after /assets/aistudio/image_57442804.png
 */
function drawAestheticSilkWaveBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: AestheticPalette,
  waveStartHeightRatio = 0.76
) {
  const bgGrad = ctx.createRadialGradient(w * 0.45, h * 0.3, 50, w * 0.5, h * 0.5, w * 0.9);
  bgGrad.addColorStop(0, palette.canvasLightTop);
  bgGrad.addColorStop(0.65, palette.canvasLightBottom);
  bgGrad.addColorStop(1, '#f1e7dc');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.fillStyle = palette.waveSoft;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.54);
  ctx.bezierCurveTo(w * 0.32, h * 0.44, w * 0.68, h * 0.64, w, h * 0.44);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = palette.waveMid;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.66);
  ctx.bezierCurveTo(w * 0.28, h * 0.52, w * 0.64, h * 0.74, w, h * 0.56);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = palette.waveSoft;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.74);
  ctx.bezierCurveTo(w * 0.45, h * 0.84, w * 0.75, h * 0.62, w, h * 0.68);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  const deepWave = ctx.createLinearGradient(0, h * waveStartHeightRatio, w, h);
  deepWave.addColorStop(0, palette.waveDeepStart);
  deepWave.addColorStop(0.5, palette.waveDeepMid);
  deepWave.addColorStop(1, palette.waveDeepEnd);
  ctx.fillStyle = deepWave;
  ctx.beginPath();
  ctx.moveTo(0, h * (waveStartHeightRatio + 0.03));
  ctx.bezierCurveTo(
    w * 0.3,
    h * (waveStartHeightRatio - 0.08),
    w * 0.66,
    h * (waveStartHeightRatio + 0.08),
    w,
    h * (waveStartHeightRatio + 0.01)
  );
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  const goldTrim = ctx.createLinearGradient(0, 0, w, 0);
  goldTrim.addColorStop(0, 'rgba(253, 224, 71, 0.2)');
  goldTrim.addColorStop(0.5, 'rgba(253, 224, 71, 0.75)');
  goldTrim.addColorStop(1, 'rgba(253, 224, 71, 0.2)');
  ctx.strokeStyle = goldTrim;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, h * (waveStartHeightRatio + 0.03));
  ctx.bezierCurveTo(
    w * 0.3,
    h * (waveStartHeightRatio - 0.08),
    w * 0.66,
    h * (waveStartHeightRatio + 0.08),
    w,
    h * (waveStartHeightRatio + 0.01)
  );
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws the Concentric Brushed-Gold Circular Frame with Green Studio Halo
 */
function drawConcentricGoldPortrait(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  img: HTMLImageElement | null,
  config: PhotoCardConfig,
  palette: AestheticPalette
) {
  ctx.save();

  const goldGrad = ctx.createLinearGradient(
    cx - radius,
    cy - radius,
    cx + radius,
    cy + radius
  );
  goldGrad.addColorStop(0, '#fef08a');
  goldGrad.addColorStop(0.28, '#d97706');
  goldGrad.addColorStop(0.55, '#fde047');
  goldGrad.addColorStop(0.82, '#b45309');
  goldGrad.addColorStop(1, '#fef08a');

  ctx.strokeStyle = goldGrad;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 32, -Math.PI * 0.78, -Math.PI * 0.08);
  ctx.stroke();

  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 26, Math.PI * 0.36, Math.PI * 0.74);
  ctx.stroke();

  ctx.strokeStyle = goldGrad;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 8, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  const innerGreen = ctx.createRadialGradient(cx, cy - radius * 0.2, 20, cx, cy, radius);
  innerGreen.addColorStop(0, palette.circleInnerCenter);
  innerGreen.addColorStop(1, palette.circleInnerEdge);
  ctx.fillStyle = innerGreen;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  drawCroppedOrFullImage(
    ctx,
    img,
    cx - radius,
    cy - radius,
    radius * 2,
    radius * 2,
    config.photoCrop,
    config.photoZoom,
    config.photoOffsetX,
    config.photoOffsetY
  );
  ctx.restore();
}

function drawFloodlightTower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  isLeft: boolean
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const beamGrad = ctx.createRadialGradient(0, 0, 10, isLeft ? 220 : -220, 260, 520);
  beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
  beamGrad.addColorStop(0.35, 'rgba(226, 232, 240, 0.14)');
  beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = beamGrad;
  ctx.beginPath();
  ctx.moveTo(-40, -25);
  ctx.lineTo(40, 25);
  ctx.lineTo(isLeft ? 540 : -540, 480);
  ctx.lineTo(isLeft ? 120 : -120, 540);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#1e293b';
  drawRoundedRect(ctx, -48, -32, 96, 64, 8);
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.stroke();

  for (let row = -1; row <= 1; row++) {
    for (let col = -1.5; col <= 1.5; col += 1) {
      const bx = col * 22;
      const by = row * 17;
      const bulbGlow = ctx.createRadialGradient(bx, by, 1, bx, by, 11);
      bulbGlow.addColorStop(0, '#ffffff');
      bulbGlow.addColorStop(0.5, 'rgba(254, 249, 195, 0.9)');
      bulbGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = bulbGlow;
      ctx.beginPath();
      ctx.arc(bx, by, 11, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawNightStadiumBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  themeGlow: string
) {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, '#060913');
  skyGrad.addColorStop(0.45, '#0f172a');
  skyGrad.addColorStop(0.75, '#111827');
  skyGrad.addColorStop(1, '#060911');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  const centerGlow = ctx.createRadialGradient(w / 2, h * 0.42, 40, w / 2, h * 0.42, w * 0.65);
  centerGlow.addColorStop(0, themeGlow);
  centerGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = centerGlow;
  ctx.fillRect(0, 0, w, h);

  drawFloodlightTower(ctx, 64, 275, -0.25, true);
  drawFloodlightTower(ctx, w - 64, 275, 0.25, false);

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 420);
  ctx.quadraticCurveTo(w / 2, 505, w, 420);
  ctx.stroke();

  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const lx = t * w;
    const ly = (1 - t) * (1 - t) * 420 + 2 * (1 - t) * t * 505 + t * t * 420;
    const dotGlow = ctx.createRadialGradient(lx, ly, 1, lx, ly, 7);
    dotGlow.addColorStop(0, '#fde68a');
    dotGlow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = dotGlow;
    ctx.beginPath();
    ctx.arc(lx, ly, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawGreenLeafEmblem(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const leafGrad1 = ctx.createLinearGradient(0, 80, 90, -40);
  leafGrad1.addColorStop(0, '#15803d');
  leafGrad1.addColorStop(0.5, '#22c55e');
  leafGrad1.addColorStop(1, '#86efac');
  ctx.fillStyle = leafGrad1;
  ctx.beginPath();
  ctx.moveTo(20, 95);
  ctx.quadraticCurveTo(15, 10, 98, -28);
  ctx.quadraticCurveTo(105, 55, 20, 95);
  ctx.fill();

  ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(22, 92);
  ctx.quadraticCurveTo(45, 40, 72, 2);
  ctx.stroke();

  const leafGrad2 = ctx.createLinearGradient(-40, 20, 20, 95);
  leafGrad2.addColorStop(0, '#4ade80');
  leafGrad2.addColorStop(1, '#166534');
  ctx.fillStyle = leafGrad2;
  ctx.beginPath();
  ctx.moveTo(14, 95);
  ctx.quadraticCurveTo(-42, 65, -35, 12);
  ctx.quadraticCurveTo(15, 28, 14, 95);
  ctx.fill();

  ctx.restore();
}

function drawCricketTournamentCrest(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number
) {
  ctx.save();
  ctx.translate(cx, cy);

  // Soft circular pearl badge backing with subtle gold ring
  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.96, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(217, 119, 6, 0.55)';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = radius * 0.085;
  ctx.beginPath();
  ctx.arc(0, -radius * 0.12, radius * 0.68, Math.PI * 0.85, Math.PI * 1.85);
  ctx.stroke();

  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = radius * 0.055;
  ctx.beginPath();
  ctx.arc(0, -radius * 0.12, radius * 0.58, Math.PI * 0.9, Math.PI * 1.75);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  const stumpW = radius * 0.038;
  const stumpH = radius * 0.34;
  for (let i = -1; i <= 1; i++) {
    ctx.fillRect(radius * 0.16 + i * (stumpW * 1.7), -radius * 0.36, stumpW, stumpH);
  }

  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(radius * 0.48, -radius * 0.25, radius * 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(-radius * 0.12, -radius * 0.32, radius * 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-radius * 0.26, -0.02 * radius);
  ctx.quadraticCurveTo(-radius * 0.14, -radius * 0.25, 0, -radius * 0.12);
  ctx.lineTo(radius * 0.05, -0.02 * radius);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = radius * 0.085;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-radius * 0.02, -radius * 0.18);
  ctx.lineTo(radius * 0.35, -radius * 0.58);
  ctx.stroke();

  ctx.fillStyle = '#064e3b';
  ctx.font = `700 ${Math.round(radius * 0.21)}px "Hind Siliguri", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('নূরিয়া হাজির হাট', 0, radius * 0.2);

  ctx.fillStyle = '#dc2626';
  drawRoundedRect(ctx, -radius * 0.62, radius * 0.25, radius * 1.24, radius * 0.21, 6);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${Math.round(radius * 0.135)}px "Hind Siliguri", sans-serif`;
  ctx.fillText('নাইট শর্টপিচ', 0, radius * 0.4);

  ctx.fillStyle = '#0f172a';
  ctx.font = `700 ${Math.round(radius * 0.14)}px "Hind Siliguri", sans-serif`;
  ctx.fillText('— ক্রিকেট টুর্নামেন্ট —', 0, radius * 0.6);

  ctx.fillStyle = '#047857';
  drawRoundedRect(ctx, -radius * 0.36, radius * 0.66, radius * 0.72, radius * 0.17, 8);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${Math.round(radius * 0.115)}px "Hind Siliguri", sans-serif`;
  ctx.fillText('২০২৬ ইং', 0, radius * 0.78);

  ctx.restore();
}

/**
 * Universal Custom Logo / Default Tournament Logo Renderer
 * Draws the user's saved custom logo (if uploaded/selected) or the built-in tournament crest
 * on EVERY photo card template.
 */
function drawTournamentOrCustomLogo(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  config: PhotoCardConfig,
  logoImg: HTMLImageElement | null
) {
  if (config.showLogo === false) return;

  if (logoImg && logoImg.width > 0 && logoImg.height > 0) {
    ctx.save();
    // Subtle gold outer ring & pearl studio circle backing
    const goldGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
    goldGrad.addColorStop(0, '#fef08a');
    goldGrad.addColorStop(0.5, '#d97706');
    goldGrad.addColorStop(1, '#fde047');

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, radius - 4, 0, Math.PI * 2);
    ctx.clip();

    if (config.customLogoCrop) {
      drawCroppedOrFullImage(
        ctx,
        logoImg,
        cx - radius + 4,
        cy - radius + 4,
        (radius - 4) * 2,
        (radius - 4) * 2,
        config.customLogoCrop,
        1,
        0,
        0
      );
    } else {
      // Fit custom uploaded logo cleanly inside the circular badge (contain)
      const boxSize = (radius - 8) * 2;
      const imgRatio = logoImg.width / logoImg.height;
      let drawW = boxSize;
      let drawH = boxSize;
      if (imgRatio > 1) {
        drawH = boxSize / imgRatio;
      } else {
        drawW = boxSize * imgRatio;
      }
      ctx.drawImage(logoImg, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
    }

    ctx.restore();
    return;
  }

  // Default fallback: Vector Tournament Crest
  drawCricketTournamentCrest(ctx, cx, cy, radius);
}

function drawTopRightSculpturalBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  badgeMain: string,
  badgeSub: string
) {
  if (!hasText(badgeMain) && !hasText(badgeSub)) return;

  ctx.save();
  const swooshGrad = ctx.createLinearGradient(x - 75, y - 95, x + 75, y + 65);
  swooshGrad.addColorStop(0, '#f59e0b');
  swooshGrad.addColorStop(0.5, '#dc2626');
  swooshGrad.addColorStop(1, '#991b1b');

  ctx.fillStyle = swooshGrad;
  ctx.beginPath();
  ctx.arc(x, y, 78, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(x, y, 88, -Math.PI * 0.85, -Math.PI * 0.15);
  ctx.stroke();

  ctx.textAlign = 'center';
  if (hasText(badgeMain)) {
    ctx.fillStyle = '#ffffff';
    const mainSz = fitTextSize(ctx, badgeMain, 128, 38, 20, 700);
    ctx.font = `700 ${mainSz}px "Hind Siliguri", sans-serif`;
    ctx.fillText(badgeMain, x, hasText(badgeSub) ? y - 4 : y + 12);
  }
  if (hasText(badgeSub)) {
    ctx.fillStyle = '#fde047';
    const subSz = fitTextSize(ctx, badgeSub, 126, 21, 13, 700);
    ctx.font = `700 ${subSz}px "Hind Siliguri", sans-serif`;
    ctx.fillText(badgeSub, x, y + 28);
  }
  ctx.restore();
}

/**
 * Draws a dynamic pill badge for Jersey Number that measures text width so it never overflows
 */
function drawDynamicJerseyPill(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  jerseyNumber: string
) {
  if (!hasText(jerseyNumber)) return;
  const label = `জার্সি #${jerseyNumber.trim()}`;
  ctx.save();
  ctx.font = '700 26px "Hind Siliguri", sans-serif';
  const textW = ctx.measureText(label).width;
  const pillW = Math.max(142, Math.ceil(textW + 48));
  const pillH = 52;
  const pillX = centerX - pillW / 2;
  const pillY = centerY - pillH / 2;

  drawRoundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#fde047';
  ctx.textAlign = 'center';
  ctx.fillText(label, centerX, pillY + 35);
  ctx.restore();
}

/**
 * TEMPLATE 1: Team & Captain Welcome Card
 */
function renderCaptainWelcomeCard(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: PhotoCardConfig,
  img: HTMLImageElement | null,
  logoImg: HTMLImageElement | null
) {
  const palette = getAestheticPalette(config.colorTheme);
  const isSilk = config.styleVariant === 'aesthetic_silk';

  if (isSilk) {
    drawAestheticSilkWaveBackdrop(ctx, w, h, palette, 0.75);

    // Top Header Banner
    if (hasText(config.tournamentTitle)) {
      const topGrad = ctx.createLinearGradient(44, 34, w - 44, 130);
      topGrad.addColorStop(0, palette.waveDeepStart);
      topGrad.addColorStop(0.5, palette.waveDeepMid);
      topGrad.addColorStop(1, palette.waveDeepEnd);
      ctx.fillStyle = topGrad;
      drawRoundedRect(ctx, 42, 34, w - 84, 102, 22);
      ctx.fill();

      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#fde047';
      const tSize = fitTextSize(ctx, config.tournamentTitle, w - 130, 44, 24, 700);
      ctx.font = `700 ${tSize}px "Hind Siliguri", sans-serif`;
      ctx.fillText(config.tournamentTitle, w / 2, 98);
    }

    // Single Custom / Tournament Logo on Top-Left
    drawTournamentOrCustomLogo(ctx, 132, 228, 74, config, logoImg);

    // Season Label Pill (Centered between Left Logo and Right Sculptural Badge)
    if (hasText(config.seasonLabel)) {
      ctx.save();
      const sBoxW = 430;
      const sBoxX = (w - sBoxW) / 2;
      drawRoundedRect(ctx, sBoxX, 162, sBoxW, 56, 28);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.textAlign = 'center';
      const sSize = fitTextSize(ctx, config.seasonLabel, sBoxW - 36, 28, 18, 700);
      ctx.font = `700 ${sSize}px "Hind Siliguri", sans-serif`;
      ctx.fillText(config.seasonLabel, w / 2, 199);
      ctx.restore();
    }

    // Top Right Sculptural Season Badge
    drawTopRightSculpturalBadge(
      ctx,
      w - 130,
      232,
      config.badgeTopRight,
      config.badgeSubtitle || 'অংশগ্রহণকারী দল'
    );

    // Concentric Gold Ring Captain Portrait
    drawConcentricGoldPortrait(ctx, 355, 500, 215, img, config, palette);

    // Right Side: Aesthetic Team Showcase & Captain Identity above the wave
    if (hasText(config.teamName)) {
      const teamBlockW = 470;
      const teamBlockX = w - teamBlockW - 48;
      const teamBlockY = 395;
      const tGrad = ctx.createLinearGradient(teamBlockX, teamBlockY, w - 48, teamBlockY + 115);
      tGrad.addColorStop(0, palette.primaryBannerStart);
      tGrad.addColorStop(1, palette.primaryBannerEnd);
      ctx.fillStyle = tGrad;
      drawRoundedRect(ctx, teamBlockX, teamBlockY, teamBlockW, 115, 20);
      ctx.fill();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.textAlign = 'center';
      ctx.font = '600 22px "Hind Siliguri", sans-serif';
      ctx.fillText('অংশগ্রহণকারী দল', teamBlockX + teamBlockW / 2, teamBlockY + 38);

      ctx.fillStyle = '#ffffff';
      const tmSize = fitTextSize(ctx, config.teamName, teamBlockW - 36, 40, 22, 700);
      ctx.font = `700 ${tmSize}px "Hind Siliguri", sans-serif`;
      ctx.fillText(config.teamName, teamBlockX + teamBlockW / 2, teamBlockY + 88);
    }

    ctx.textAlign = 'right';
    let capNameY = 748;
    if (hasText(config.personRoleLabel)) {
      ctx.fillStyle = palette.waveDeepStart;
      const roleText = hasText(config.jerseyNumber)
        ? `${config.personRoleLabel} · জার্সি #${config.jerseyNumber.trim()}`
        : config.personRoleLabel;
      const rlSize = fitTextSize(ctx, roleText, 480, 32, 20, 700);
      ctx.font = `700 ${rlSize}px "Hind Siliguri", sans-serif`;
      ctx.fillText(roleText, w - 54, 684);
    } else if (hasText(config.jerseyNumber)) {
      ctx.fillStyle = palette.waveDeepStart;
      ctx.font = '700 28px "Hind Siliguri", sans-serif';
      ctx.fillText(`জার্সি #${config.jerseyNumber.trim()}`, w - 54, 684);
    } else {
      capNameY = 735;
    }

    if (hasText(config.personName)) {
      ctx.fillStyle = palette.inkDark;
      const pSize = fitTextSize(ctx, config.personName, 540, 56, 30, 700);
      ctx.font = `700 ${pSize}px "Hind Siliguri", sans-serif`;
      ctx.fillText(config.personName, w - 54, capNameY);
    }

    drawGreenLeafEmblem(ctx, 64, 895, 1.15);

    ctx.textAlign = 'right';
    if (hasText(config.greetingOrSlogan)) {
      ctx.fillStyle = '#ffffff';
      const grSize = fitTextSize(ctx, config.greetingOrSlogan, w - 240, 29, 18, 600);
      ctx.font = `600 ${grSize}px "Hind Siliguri", sans-serif`;
      ctx.fillText(config.greetingOrSlogan, w - 54, 912);
    }

    if (hasText(config.footerSlogan)) {
      ctx.fillStyle = '#fde047';
      const ftSize = fitTextSize(ctx, config.footerSlogan, w - 240, 44, 24, 700);
      ctx.font = `700 ${ftSize}px "Hind Siliguri", sans-serif`;
      ctx.fillText(config.footerSlogan, w - 54, 988);
    }
    return;
  }

  // Broadcast Floodlight Pro Variant
  drawNightStadiumBackdrop(ctx, w, h, palette.glow);

  // Single Custom / Tournament Logo on Top-Left
  drawTournamentOrCustomLogo(ctx, 112, 148, 68, config, logoImg);

  if (hasText(config.tournamentTitle)) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 14;
    const titleParts = config.tournamentTitle.includes('ক্রিকেট')
      ? [
          config.tournamentTitle.split('ক্রিকেট')[0].trim(),
          'ক্রিকেট ' + config.tournamentTitle.split('ক্রিকেট')[1].trim(),
        ]
      : [config.tournamentTitle];

    const l1Size = fitTextSize(ctx, titleParts[0], w - 320, 62, 34, 700);
    ctx.font = `700 ${l1Size}px "Hind Siliguri", sans-serif`;
    ctx.fillStyle = '#fde047';
    ctx.fillText(titleParts[0], w / 2 + 40, 125);

    if (titleParts[1]) {
      const l2Size = fitTextSize(ctx, titleParts[1], w - 320, 66, 36, 700);
      ctx.font = `700 ${l2Size}px "Hind Siliguri", sans-serif`;
      ctx.fillText(titleParts[1], w / 2 + 40, 222);
    }
    ctx.restore();
  }

  if (hasText(config.seasonLabel)) {
    const b1Y = 318;
    const b1H = 82;
    drawRoundedRect(ctx, 56, b1Y, w - 112, b1H, 16);
    ctx.fillStyle = 'rgba(136, 19, 55, 0.92)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    const sSize = fitTextSize(ctx, config.seasonLabel, w - 150, 44, 24, 700);
    ctx.font = `700 ${sSize}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.seasonLabel, w / 2, b1Y + 56);
  }

  if (hasText(config.teamName)) {
    const b2Y = 468;
    const b2H = 114;
    const b2Grad = ctx.createLinearGradient(36, b2Y, w - 36, b2Y + b2H);
    b2Grad.addColorStop(0, palette.primaryBannerStart);
    b2Grad.addColorStop(1, palette.primaryBannerEnd);
    ctx.fillStyle = b2Grad;
    drawRoundedRect(ctx, 36, b2Y, w - 72, b2H, 20);
    ctx.fill();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    const tmSize = fitTextSize(ctx, config.teamName, w - 120, 66, 34, 700);
    ctx.font = `700 ${tmSize}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.teamName, w / 2, b2Y + 76);
  }

  if (hasText(config.greetingOrSlogan)) {
    const b3Y = 648;
    ctx.fillStyle = '#be123c';
    ctx.fillRect(0, b3Y, w, 50);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    const grSize = fitTextSize(ctx, config.greetingOrSlogan, w - 60, 28, 18, 700);
    ctx.font = `700 ${grSize}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.greetingOrSlogan, w / 2, b3Y + 34);
  }

  drawGreenLeafEmblem(ctx, 72, 915, 1.3);

  drawConcentricGoldPortrait(ctx, w - 180, h - 175, 128, img, config, palette);

  const textRightX = w - 340;
  ctx.textAlign = 'right';
  let textCursorY = 855;

  if (hasText(config.personRoleLabel)) {
    ctx.fillStyle = '#fde047';
    ctx.font = '700 36px "Hind Siliguri", sans-serif';
    ctx.fillText(config.personRoleLabel, textRightX, textCursorY);
    textCursorY += 58;
  }

  if (hasText(config.personName)) {
    const capNameSize = fitTextSize(ctx, config.personName, textRightX - 180, 48, 28, 700);
    ctx.fillStyle = '#34d399';
    ctx.font = `700 ${capNameSize}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.personName, textRightX, textCursorY);
    textCursorY += 52;
  }

  if (hasText(config.teamName)) {
    const subTeamSize = fitTextSize(ctx, config.teamName, textRightX - 180, 34, 22, 700);
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${subTeamSize}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.teamName, textRightX, textCursorY);
  }
}

/**
 * TEMPLATE 2: Player Introduction Card (Redesigned — Single Logo + Elevated Luxury Layout)
 */
function renderPlayerIntroCard(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: PhotoCardConfig,
  img: HTMLImageElement | null,
  logoImg: HTMLImageElement | null
) {
  const palette = getAestheticPalette(config.colorTheme);
  const isSilk = config.styleVariant === 'aesthetic_silk';

  // 1. Warm Ivory & Layered Silk Ribbon Backdrop
  drawAestheticSilkWaveBackdrop(ctx, w, h, palette, 0.87);

  // 2. Top Royal/Crimson Header Bar with Brushed Gold Accent Line
  if (hasText(config.tournamentTitle)) {
    const topBarH = 84;
    const topGrad = ctx.createLinearGradient(0, 0, w, 0);
    topGrad.addColorStop(0, palette.primaryBannerStart);
    topGrad.addColorStop(0.5, palette.primaryBannerEnd);
    topGrad.addColorStop(1, palette.primaryBannerStart);
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, w, topBarH);

    // Metallic Gold Bottom Border on Header
    ctx.fillStyle = '#fde047';
    ctx.fillRect(0, topBarH - 4, w, 4);

    ctx.fillStyle = '#fde047';
    ctx.textAlign = 'center';
    const topTitleSize = fitTextSize(ctx, config.tournamentTitle, w - 50, 38, 24, 700);
    ctx.font = `700 ${topTitleSize}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.tournamentTitle, w / 2, 55);
  }

  // 3. Sculpted Luxury Center Header Pill ("সিজন ২ · খেলোয়াড় পরিচিতি")
  // Positioned cleanly at y=102..192 so it never collides with the concentric gold ring below!
  const badgeW = 420;
  const badgeH = 92;
  const badgeX = (w - badgeW) / 2;
  const badgeY = 102;

  ctx.save();
  const badgeGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH);
  badgeGrad.addColorStop(0, '#047857');
  badgeGrad.addColorStop(0.5, '#10b981');
  badgeGrad.addColorStop(1, '#065f46');
  ctx.fillStyle = badgeGrad;
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 46);
  ctx.fill();
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  ctx.textAlign = 'center';
  if (hasText(config.badgeTopRight)) {
    ctx.fillStyle = '#fde047';
    ctx.font = '700 24px "Hind Siliguri", sans-serif';
    ctx.fillText(config.badgeTopRight, w / 2, badgeY + 33);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 38px "Hind Siliguri", sans-serif';
    ctx.fillText('খেলোয়াড় পরিচিতি', w / 2, badgeY + 75);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 42px "Hind Siliguri", sans-serif';
    ctx.fillText('খেলোয়াড় পরিচিতি', w / 2, badgeY + 61);
  }
  ctx.restore();

  // 4. SINGLE Custom / Tournament Logo on Top-Right ONLY (Left duplicate logo removed!)
  drawTournamentOrCustomLogo(ctx, w - 134, 184, 84, config, logoImg);

  // 5. Player Portrait: Concentric Gold Ring in Aesthetic Silk mode, or Gold-Trimmed Rounded Frame
  const portraitCenterY = 444;
  const portraitRadius = 170;
  if (isSilk) {
    drawConcentricGoldPortrait(ctx, w / 2, portraitCenterY, portraitRadius, img, config, palette);
  } else {
    const frameW = 420;
    const frameH = 335;
    const frameX = (w - frameW) / 2;
    const frameY = 266;
    ctx.save();
    drawRoundedRect(ctx, frameX - 6, frameY - 6, frameW + 12, frameH + 12, 22);
    ctx.fillStyle = '#d97706';
    ctx.fill();
    drawRoundedRect(ctx, frameX, frameY, frameW, frameH, 18);
    ctx.clip();
    drawCroppedOrFullImage(
      ctx,
      img,
      frameX,
      frameY,
      frameW,
      frameH,
      config.photoCrop,
      config.photoZoom,
      config.photoOffsetX,
      config.photoOffsetY
    );
    ctx.restore();
  }

  // 6. Auto-Sized Jersey Number Pill (Only drawn when jerseyNumber is non-empty!)
  drawDynamicJerseyPill(ctx, w / 2 + 175, 315, config.jerseyNumber);

  // 7. Elevated Editorial Player Identity Card (Reflows dynamically & omits empty fields)
  const infoRows: Array<{ label: string; value: string; highlight?: boolean }> = [];
  if (hasText(config.personName)) {
    infoRows.push({ label: 'নাম', value: config.personName.trim(), highlight: true });
  }
  if (hasText(config.playerPosition)) {
    infoRows.push({ label: 'পজিশন', value: config.playerPosition.trim() });
  }
  if (hasText(config.teamName)) {
    infoRows.push({ label: 'দল', value: config.teamName.trim() });
  }

  if (infoRows.length > 0) {
    const cardBoxX = 88;
    const cardBoxY = 660;
    const cardBoxW = w - 176;
    const rowHeight = infoRows.length === 1 ? 84 : infoRows.length === 2 ? 76 : 70;
    const totalBoxH = infoRows.length * rowHeight + 28;

    ctx.save();
    // Subtle outer shadow for editorial depth
    ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;

    drawRoundedRect(ctx, cardBoxX, cardBoxY, cardBoxW, totalBoxH, 24);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // Gold border around the identity card
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Left vertical accent bar inside the card
    ctx.save();
    drawRoundedRect(ctx, cardBoxX, cardBoxY, cardBoxW, totalBoxH, 24);
    ctx.clip();
    const leftBarGrad = ctx.createLinearGradient(cardBoxX, cardBoxY, cardBoxX, cardBoxY + totalBoxH);
    leftBarGrad.addColorStop(0, palette.waveDeepStart);
    leftBarGrad.addColorStop(0.5, '#f59e0b');
    leftBarGrad.addColorStop(1, palette.primaryBannerStart);
    ctx.fillStyle = leftBarGrad;
    ctx.fillRect(cardBoxX, cardBoxY, 14, totalBoxH);
    ctx.restore();

    infoRows.forEach((row, idx) => {
      const rowCenterY = cardBoxY + 14 + idx * rowHeight + rowHeight / 2;

      // Subtle divider line between rows
      if (idx > 0) {
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cardBoxX + 34, cardBoxY + 14 + idx * rowHeight);
        ctx.lineTo(cardBoxX + cardBoxW - 34, cardBoxY + 14 + idx * rowHeight);
        ctx.stroke();
      }

      // Structured Label Badge on Left
      const labelPillX = cardBoxX + 36;
      const labelPillW = 148;
      const labelPillH = 46;
      const labelPillY = rowCenterY - labelPillH / 2;

      drawRoundedRect(ctx, labelPillX, labelPillY, labelPillW, labelPillH, 12);
      ctx.fillStyle = row.highlight ? palette.waveDeepStart : '#0f172a';
      ctx.fill();

      ctx.fillStyle = '#fde047';
      ctx.textAlign = 'center';
      ctx.font = '700 25px "Hind Siliguri", sans-serif';
      ctx.fillText(row.label, labelPillX + labelPillW / 2, labelPillY + 32);

      // Colon & Value Text
      ctx.textAlign = 'left';
      const valX = labelPillX + labelPillW + 22;
      const maxValW = cardBoxW - (valX - cardBoxX) - 32;
      const fontSz = fitTextSize(
        ctx,
        row.value,
        maxValW,
        row.highlight ? 44 : 38,
        24,
        700
      );
      ctx.font = `700 ${fontSz}px "Hind Siliguri", sans-serif`;
      ctx.fillStyle = row.highlight ? palette.waveDeepStart : '#0f172a';
      ctx.fillText(row.value, valX, rowCenterY + 13);
    });
    ctx.restore();
  }

  // 8. Bottom Slogan inside the Deep Silk Wave
  if (hasText(config.footerSlogan)) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde047';
    const sloganSize = fitTextSize(ctx, config.footerSlogan, w - 80, 42, 24, 700);
    ctx.font = `700 ${sloganSize}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.footerSlogan, w / 2, h - 32);
  }
}

/**
 * TEMPLATE 3: Player Hype Card ("আমি কোন দলে খেলছি")
 */
function renderPlayerHypeCard(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: PhotoCardConfig,
  img: HTMLImageElement | null,
  logoImg: HTMLImageElement | null
) {
  const palette = getAestheticPalette(config.colorTheme);

  drawAestheticSilkWaveBackdrop(ctx, w, h, palette, 0.76);

  // Top Left Organization / Season Tag
  if (hasText(config.organizationTag)) {
    ctx.save();
    drawRoundedRect(ctx, 48, 42, 185, 62, 14);
    ctx.fillStyle = palette.waveDeepMid;
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = '800 30px "Plus Jakarta Sans", "Hind Siliguri", sans-serif';
    ctx.fillText(config.organizationTag, 140, 84);
    ctx.restore();
  }

  // Top Tournament Title Pill
  if (hasText(config.tournamentTitle)) {
    const titleX = hasText(config.organizationTag) ? 250 : 48;
    const titleW = w - titleX - 48;
    ctx.save();
    drawRoundedRect(ctx, titleX, 42, titleW, 62, 14);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.textAlign = 'center';
    const tSz = fitTextSize(ctx, config.tournamentTitle, titleW - 36, 30, 18, 700);
    ctx.font = `700 ${tSz}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.tournamentTitle, titleX + titleW / 2, 83);
    ctx.restore();
  }

  // Single Custom / Tournament Logo on Top-Right above portrait
  drawTournamentOrCustomLogo(ctx, w - 122, 182, 68, config, logoImg);

  // Right Side: Concentric Gold Ring Portrait
  drawConcentricGoldPortrait(ctx, 735, 455, 215, img, config, palette);

  // Left Side: Aesthetic Editorial Typography & Team Announcement
  ctx.textAlign = 'left';
  if (hasText(config.seasonLabel)) {
    ctx.fillStyle = palette.waveDeepMid;
    const sSz = fitTextSize(ctx, config.seasonLabel, 430, 28, 18, 700);
    ctx.font = `700 ${sSz}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.seasonLabel, 54, 185);
  }

  ctx.fillStyle = '#0f172a';
  ctx.font = '700 48px "Hind Siliguri", sans-serif';
  ctx.fillText('এবারের আসরে', 54, 252);
  ctx.fillStyle = palette.waveDeepStart;
  ctx.font = '700 58px "Hind Siliguri", sans-serif';
  ctx.fillText('আমি খেলছি', 54, 324);

  let nextLeftY = 358;
  if (hasText(config.teamName)) {
    ctx.save();
    const tGrad = ctx.createLinearGradient(54, nextLeftY, 470, nextLeftY + 135);
    tGrad.addColorStop(0, palette.primaryBannerStart);
    tGrad.addColorStop(1, palette.primaryBannerEnd);
    ctx.fillStyle = tGrad;
    drawRoundedRect(ctx, 54, nextLeftY, 420, 132, 20);
    ctx.fill();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.font = '600 22px "Hind Siliguri", sans-serif';
    ctx.fillText('আমার দল', 80, nextLeftY + 40);

    ctx.fillStyle = '#ffffff';
    const tmSize = fitTextSize(ctx, config.teamName, 370, 38, 22, 700);
    ctx.font = `700 ${tmSize}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.teamName, 80, nextLeftY + 95);
    ctx.restore();
    nextLeftY += 154;
  }

  const hasPos = hasText(config.playerPosition);
  const hasJersey = hasText(config.jerseyNumber);

  if (hasPos || hasJersey) {
    ctx.save();
    if (hasPos && hasJersey) {
      drawRoundedRect(ctx, 54, nextLeftY, 245, 68, 14);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      const pSz = fitTextSize(ctx, `পজিশন: ${config.playerPosition}`, 215, 26, 18, 700);
      ctx.font = `700 ${pSz}px "Hind Siliguri", sans-serif`;
      ctx.fillText(`পজিশন: ${config.playerPosition}`, 74, nextLeftY + 44);

      const jLabel = `জার্সি: #${config.jerseyNumber.trim()}`;
      ctx.font = '700 25px "Hind Siliguri", sans-serif';
      const jBoxW = Math.max(165, Math.ceil(ctx.measureText(jLabel).width + 40));
      drawRoundedRect(ctx, 314, nextLeftY, jBoxW, 68, 14);
      ctx.fillStyle = palette.waveDeepStart;
      ctx.fill();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.fillText(jLabel, 334, nextLeftY + 44);
    } else if (hasPos) {
      drawRoundedRect(ctx, 54, nextLeftY, 320, 68, 14);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.font = '700 28px "Hind Siliguri", sans-serif';
      ctx.fillText(`পজিশন: ${config.playerPosition}`, 78, nextLeftY + 44);
    } else if (hasJersey) {
      const jLabel = `জার্সি: #${config.jerseyNumber.trim()}`;
      ctx.font = '700 28px "Hind Siliguri", sans-serif';
      const jBoxW = Math.max(220, Math.ceil(ctx.measureText(jLabel).width + 48));
      drawRoundedRect(ctx, 54, nextLeftY, jBoxW, 68, 14);
      ctx.fillStyle = palette.waveDeepStart;
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.fillText(jLabel, 78, nextLeftY + 44);
    }
    ctx.restore();
  }

  if (hasText(config.personName)) {
    ctx.textAlign = 'left';
    ctx.fillStyle = palette.inkDark;
    const nmSize = fitTextSize(ctx, config.personName, 580, 56, 30, 700);
    ctx.font = `700 ${nmSize}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.personName, 54, 735);
  }

  ctx.textAlign = 'right';
  if (hasText(config.greetingOrSlogan)) {
    ctx.fillStyle = '#ffffff';
    const grSz = fitTextSize(ctx, config.greetingOrSlogan, w - 120, 32, 18, 600);
    ctx.font = `600 ${grSz}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.greetingOrSlogan, w - 54, 912);
  }

  if (hasText(config.footerSlogan)) {
    ctx.fillStyle = '#fde047';
    const ftSz = fitTextSize(ctx, config.footerSlogan, w - 120, 44, 24, 700);
    ctx.font = `700 ${ftSz}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.footerSlogan, w - 54, 988);
  }
}

/**
 * TEMPLATE 4: Premium Gold Ring Frame (Tribute to /assets/aistudio/image_57442804.png)
 */
function renderPremiumGoldFrameCard(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: PhotoCardConfig,
  img: HTMLImageElement | null,
  logoImg: HTMLImageElement | null
) {
  const palette = getAestheticPalette(config.colorTheme);
  drawAestheticSilkWaveBackdrop(ctx, w, h, palette, 0.77);

  // Top-Left Custom Logo or Organization Badge
  if (config.showLogo !== false) {
    drawTournamentOrCustomLogo(ctx, 130, 134, 74, config, logoImg);
  } else if (hasText(config.organizationTag)) {
    ctx.save();
    drawRoundedRect(ctx, 54, 48, 195, 68, 14);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    const tagSz = fitTextSize(ctx, config.organizationTag, 170, 34, 20, 800);
    ctx.font = `800 ${tagSz}px "Plus Jakarta Sans", "Hind Siliguri", sans-serif`;
    ctx.fillText(config.organizationTag, 151, 94);
    ctx.restore();
  }

  // Top-Right Festive Emblem
  drawTopRightSculpturalBadge(
    ctx,
    w - 155,
    148,
    config.badgeTopRight,
    config.badgeSubtitle
  );

  // Concentric Gold Ring Portrait
  drawConcentricGoldPortrait(ctx, 415, 425, 275, img, config, palette);

  // Person Name & Optional Role/Team on Right above the wave
  ctx.textAlign = 'right';
  if (hasText(config.personName)) {
    ctx.fillStyle = '#0f172a';
    const nameFont = fitTextSize(ctx, config.personName, w - 260, 52, 30, 700);
    ctx.font = `700 ${nameFont}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.personName, w - 56, 765);
  }

  const roleParts = [config.personRoleLabel, config.teamName]
    .map((s) => (s || '').trim())
    .filter(Boolean);
  if (roleParts.length > 0) {
    ctx.fillStyle = palette.waveDeepStart;
    const roleTeamText = roleParts.join(' · ');
    const roleFont = fitTextSize(ctx, roleTeamText, w - 280, 28, 18, 700);
    ctx.font = `700 ${roleFont}px "Hind Siliguri", sans-serif`;
    ctx.fillText(roleTeamText, w - 56, 806);
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 32px "Hind Siliguri", sans-serif';
  ctx.fillText('তারুণ্য', 62, 912);
  ctx.fillText('ক্রীড়াচেতনা', 62, 956);
  ctx.fillStyle = '#fde047';
  ctx.fillText('সবার আগে', 62, 1000);

  ctx.textAlign = 'right';
  if (hasText(config.greetingOrSlogan)) {
    ctx.fillStyle = '#ffffff';
    const msgSize = fitTextSize(ctx, config.greetingOrSlogan, w - 320, 32, 18, 600);
    ctx.font = `600 ${msgSize}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.greetingOrSlogan, w - 56, 918);
  }

  if (hasText(config.footerSlogan)) {
    ctx.fillStyle = '#fde047';
    const bigSize = fitTextSize(ctx, config.footerSlogan, w - 320, 52, 26, 700);
    ctx.font = `700 ${bigSize}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.footerSlogan, w - 56, 995);
  }
}

/**
 * UNIFIED AESTHETIC AWARD & SPECIAL RECOGNITION RENDERER
 */
function renderAestheticAwardOrSpecialCard(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: PhotoCardConfig,
  img: HTMLImageElement | null,
  logoImg: HTMLImageElement | null,
  defaultAwardBanner: string,
  defaultSubLabel: string
) {
  const palette = getAestheticPalette(config.colorTheme);
  const isSilk = config.styleVariant === 'aesthetic_silk';

  if (isSilk) {
    drawAestheticSilkWaveBackdrop(ctx, w, h, palette, 0.74);
  } else {
    drawNightStadiumBackdrop(ctx, w, h, palette.glow);
  }

  // Top Tournament Title Bar
  if (hasText(config.tournamentTitle)) {
    ctx.save();
    drawRoundedRect(ctx, 44, 32, w - 88, 76, 18);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.textAlign = 'center';
    const topSize = fitTextSize(ctx, config.tournamentTitle, w - 130, 36, 22, 700);
    ctx.font = `700 ${topSize}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.tournamentTitle, w / 2, 82);
    ctx.restore();
  }

  // Single Custom / Tournament Logo on Top-Left
  drawTournamentOrCustomLogo(ctx, 118, 204, 68, config, logoImg);

  // Top-Right Sculptural Badge
  drawTopRightSculpturalBadge(
    ctx,
    w - 128,
    210,
    config.badgeTopRight,
    config.badgeSubtitle || defaultSubLabel
  );

  // Main Golden Ribbon Award Title Pill (Centered cleanly between Left Logo and Right Badge)
  const awardTitle = hasText(config.personRoleLabel)
    ? config.personRoleLabel
    : defaultAwardBanner;
  const pillX = 208;
  const pillW = w - 450;
  const awardGrad = ctx.createLinearGradient(pillX, 130, pillX + pillW, 204);
  awardGrad.addColorStop(0, '#b45309');
  awardGrad.addColorStop(0.5, '#fde047');
  awardGrad.addColorStop(1, '#d97706');
  ctx.fillStyle = awardGrad;
  drawRoundedRect(ctx, pillX, 134, pillW, 74, 37);
  ctx.fill();

  ctx.fillStyle = '#090d16';
  ctx.textAlign = 'center';
  const awSz = fitTextSize(ctx, awardTitle, pillW - 36, 38, 22, 800);
  ctx.font = `800 ${awSz}px "Hind Siliguri", sans-serif`;
  ctx.fillText(awardTitle, pillX + pillW / 2, 183);

  // Concentric Gold Ring Winner Portrait
  drawConcentricGoldPortrait(ctx, 345, 480, 210, img, config, palette);

  // Right Side Winner Name, Team/Affiliation & Jersey (only non-empty fields!)
  ctx.textAlign = 'right';
  let cursorY = 410;

  if (hasText(config.personName)) {
    ctx.fillStyle = isSilk ? '#0f172a' : '#ffffff';
    const nmSz = fitTextSize(ctx, config.personName, 460, 52, 28, 700);
    ctx.font = `700 ${nmSz}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.personName, w - 54, cursorY);
    cursorY += 52;
  }

  if (hasText(config.teamName)) {
    ctx.fillStyle = isSilk ? palette.waveDeepStart : '#34d399';
    const tmSz = fitTextSize(ctx, config.teamName, 460, 34, 20, 700);
    ctx.font = `700 ${tmSz}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.teamName, w - 54, cursorY);
    cursorY += 48;
  }

  const metaChips = [
    hasText(config.playerPosition) ? `পজিশন: ${config.playerPosition}` : '',
    hasText(config.jerseyNumber) ? `জার্সি #${config.jerseyNumber.trim()}` : '',
  ].filter(Boolean);

  if (metaChips.length > 0) {
    const chipStr = metaChips.join(' · ');
    ctx.fillStyle = isSilk ? '#334155' : '#cbd5e1';
    ctx.font = '700 26px "Hind Siliguri", sans-serif';
    ctx.fillText(chipStr, w - 54, cursorY);
    cursorY += 44;
  }

  if (hasText(config.performanceLine1)) {
    ctx.save();
    drawRoundedRect(ctx, 590, 550, w - 640, 88, 16);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.textAlign = 'center';
    const p1Sz = fitTextSize(ctx, config.performanceLine1, w - 670, 26, 16, 700);
    ctx.font = `700 ${p1Sz}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.performanceLine1, 590 + (w - 640) / 2, 604);
    ctx.restore();
  }

  if (hasText(config.performanceLine2)) {
    ctx.save();
    drawRoundedRect(ctx, 590, 652, w - 640, 82, 16);
    ctx.fillStyle = palette.primaryBannerStart;
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    const p2Sz = fitTextSize(ctx, config.performanceLine2, w - 670, 24, 15, 700);
    ctx.font = `700 ${p2Sz}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.performanceLine2, 590 + (w - 640) / 2, 702);
    ctx.restore();
  }

  drawGreenLeafEmblem(ctx, 64, 895, 1.15);

  ctx.textAlign = 'right';
  if (hasText(config.greetingOrSlogan)) {
    ctx.fillStyle = '#ffffff';
    const grSz = fitTextSize(ctx, config.greetingOrSlogan, w - 240, 30, 18, 600);
    ctx.font = `600 ${grSz}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.greetingOrSlogan, w - 54, 912);
  }

  if (hasText(config.footerSlogan)) {
    ctx.fillStyle = '#fde047';
    const ftSz = fitTextSize(ctx, config.footerSlogan, w - 240, 42, 22, 700);
    ctx.font = `700 ${ftSz}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.footerSlogan, w - 54, 988);
  }
}

/**
 * TEMPLATE 10: Live Score & Key Match Moment Card
 */
function renderLiveScoreMomentCard(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: PhotoCardConfig,
  img: HTMLImageElement | null,
  logoImg: HTMLImageElement | null
) {
  const palette = getAestheticPalette(config.colorTheme);
  drawNightStadiumBackdrop(ctx, w, h, palette.glow);

  // Single Custom / Tournament Logo on Top-Left
  drawTournamentOrCustomLogo(ctx, 108, 122, 62, config, logoImg);

  if (hasText(config.tournamentTitle)) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde047';
    const titleSize = fitTextSize(ctx, config.tournamentTitle, w - 260, 38, 22, 700);
    ctx.font = `700 ${titleSize}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.tournamentTitle, w / 2 + 30, 74);
  }

  if (hasText(config.matchStatusBadge)) {
    ctx.fillStyle = '#dc2626';
    drawRoundedRect(ctx, (w - 360) / 2 + 30, 100, 360, 56, 28);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = '700 30px "Hind Siliguri", sans-serif';
    ctx.fillText(config.matchStatusBadge, w / 2 + 30, 138);
  }

  if (hasText(config.matchTitle)) {
    ctx.fillStyle = '#cbd5e1';
    ctx.textAlign = 'center';
    ctx.font = '600 26px "Hind Siliguri", sans-serif';
    ctx.fillText(config.matchTitle, w / 2, 198);
  }

  const boxY = 224;
  const boxH = 210;
  const boxW = (w - 130) / 2;

  if (hasText(config.team1Name) || hasText(config.team1Score)) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    drawRoundedRect(ctx, 48, boxY, boxW, boxH, 20);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 22px "Hind Siliguri", sans-serif';
    ctx.fillText('ব্যাটিং দল', 48 + boxW / 2, boxY + 42);

    if (hasText(config.team1Name)) {
      ctx.fillStyle = '#ffffff';
      const t1NameSize = fitTextSize(ctx, config.team1Name, boxW - 36, 34, 20, 700);
      ctx.font = `700 ${t1NameSize}px "Hind Siliguri", sans-serif`;
      ctx.fillText(config.team1Name, 48 + boxW / 2, boxY + 95);
    }

    if (hasText(config.team1Score)) {
      ctx.fillStyle = '#fde047';
      const t1ScoreSize = fitTextSize(ctx, config.team1Score, boxW - 36, 48, 26, 700);
      ctx.font = `700 ${t1ScoreSize}px "Hind Siliguri", sans-serif`;
      ctx.fillText(config.team1Score, 48 + boxW / 2, boxY + 168);
    }
  }

  if (hasText(config.team2Name) || hasText(config.team2Score)) {
    const box2X = w - 48 - boxW;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    drawRoundedRect(ctx, box2X, boxY, boxW, boxH, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 22px "Hind Siliguri", sans-serif';
    ctx.fillText('প্রতিপক্ষ দল', box2X + boxW / 2, boxY + 42);

    if (hasText(config.team2Name)) {
      ctx.fillStyle = '#ffffff';
      const t2NameSize = fitTextSize(ctx, config.team2Name, boxW - 36, 34, 20, 700);
      ctx.font = `700 ${t2NameSize}px "Hind Siliguri", sans-serif`;
      ctx.fillText(config.team2Name, box2X + boxW / 2, boxY + 95);
    }

    if (hasText(config.team2Score)) {
      ctx.fillStyle = '#34d399';
      const t2ScoreSize = fitTextSize(ctx, config.team2Score, boxW - 36, 44, 24, 700);
      ctx.font = `700 ${t2ScoreSize}px "Hind Siliguri", sans-serif`;
      ctx.fillText(config.team2Score, box2X + boxW / 2, boxY + 168);
    }
  }

  if (hasText(config.keyMomentHeadline)) {
    const momentY = 466;
    const momentGrad = ctx.createLinearGradient(48, momentY, w - 48, momentY);
    momentGrad.addColorStop(0, '#991b1b');
    momentGrad.addColorStop(0.5, '#dc2626');
    momentGrad.addColorStop(1, '#991b1b');
    ctx.fillStyle = momentGrad;
    drawRoundedRect(ctx, 48, momentY, w - 96, 86, 16);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    const hmSize = fitTextSize(ctx, config.keyMomentHeadline, w - 140, 36, 20, 700);
    ctx.font = `700 ${hmSize}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.keyMomentHeadline, w / 2, momentY + 55);
  }

  drawConcentricGoldPortrait(ctx, 195, 730, 128, img, config, palette);

  const statX = 368;
  const statW = w - statX - 48;
  const pY = 588;
  const pH = 276;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  drawRoundedRect(ctx, statX, pY, statW, pH, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#fde047';
  ctx.font = '700 28px "Hind Siliguri", sans-serif';
  ctx.fillText('ম্যাচের গুরুত্বপূর্ণ পারফরম্যান্স', statX + 32, pY + 56);

  if (hasText(config.performanceLine1)) {
    ctx.fillStyle = '#ffffff';
    const s1Size = fitTextSize(ctx, config.performanceLine1, statW - 64, 34, 20, 700);
    ctx.font = `700 ${s1Size}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.performanceLine1, statX + 32, pY + 124);
  }

  if (hasText(config.performanceLine2)) {
    ctx.fillStyle = '#38bdf8';
    const s2Size = fitTextSize(ctx, config.performanceLine2, statW - 64, 32, 20, 700);
    ctx.font = `700 ${s2Size}px "Hind Siliguri", sans-serif`;
    ctx.fillText(config.performanceLine2, statX + 32, pY + 188);
  }

  if (hasText(config.personName)) {
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 24px "Hind Siliguri", sans-serif';
    ctx.fillText(`ফোকাস খেলোয়াড়: ${config.personName}`, statX + 32, pY + 244);
  }

  if (hasText(config.footerSlogan)) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, h - 76, w, 76);
    ctx.fillStyle = '#fde047';
    ctx.font = '700 32px "Hind Siliguri", sans-serif';
    ctx.fillText(config.footerSlogan, w / 2, h - 28);
  }
}

export async function renderPhotoCardToCanvas(
  canvas: HTMLCanvasElement,
  config: PhotoCardConfig
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const WIDTH = 1080;
  const HEIGHT = 1080;
  if (canvas.width !== WIDTH) canvas.width = WIDTH;
  if (canvas.height !== HEIGHT) canvas.height = HEIGHT;

  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Fallback
    }
  }

  const [img, logoImg] = await Promise.all([
    loadImageElement(config.photoUrl),
    config.customLogoUrl ? loadImageElement(config.customLogoUrl) : Promise.resolve(null),
  ]);

  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  switch (config.templateId) {
    case 'captain_welcome':
      renderCaptainWelcomeCard(ctx, WIDTH, HEIGHT, config, img, logoImg);
      break;
    case 'player_intro':
      renderPlayerIntroCard(ctx, WIDTH, HEIGHT, config, img, logoImg);
      break;
    case 'player_hype':
      renderPlayerHypeCard(ctx, WIDTH, HEIGHT, config, img, logoImg);
      break;
    case 'premium_gold_frame':
      renderPremiumGoldFrameCard(ctx, WIDTH, HEIGHT, config, img, logoImg);
      break;
    case 'man_of_the_match':
      renderAestheticAwardOrSpecialCard(
        ctx,
        WIDTH,
        HEIGHT,
        config,
        img,
        logoImg,
        'ম্যান অব দ্য ম্যাচ',
        'ম্যাচ সেরা'
      );
      break;
    case 'player_of_the_match':
      renderAestheticAwardOrSpecialCard(
        ctx,
        WIDTH,
        HEIGHT,
        config,
        img,
        logoImg,
        'প্লেয়ার অব দ্য ম্যাচ',
        'সেরা পারফর্মার'
      );
      break;
    case 'player_of_the_tournament':
      renderAestheticAwardOrSpecialCard(
        ctx,
        WIDTH,
        HEIGHT,
        config,
        img,
        logoImg,
        'প্লেয়ার অব দ্য টুর্নামেন্ট',
        'সিজন ২ MVP'
      );
      break;
    case 'best_spectator':
      renderAestheticAwardOrSpecialCard(
        ctx,
        WIDTH,
        HEIGHT,
        config,
        img,
        logoImg,
        'আজকের সেরা দর্শক',
        'সেরা দর্শক'
      );
      break;
    case 'top_lottery_buyer':
      renderAestheticAwardOrSpecialCard(
        ctx,
        WIDTH,
        HEIGHT,
        config,
        img,
        logoImg,
        'আজকের সর্বোচ্চ লটারি ক্রেতা',
        'র‍্যাফেল ড্র'
      );
      break;
    case 'live_score_moment':
      renderLiveScoreMomentCard(ctx, WIDTH, HEIGHT, config, img, logoImg);
      break;
  }
}
