/** Client-side collateral generators — swap for AI APIs later without changing the launch UX. */

function hashSeed(input: string): number {
  return input.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

function initialsFrom(name: string, ticker: string): string {
  const fromTicker = ticker.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase();
  if (fromTicker) return fromTicker.slice(0, 2);
  return name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || 'GO';
}

function palette(seed: number) {
  const hue = seed % 360;
  const hue2 = (hue + 48 + (seed % 70)) % 360;
  return { hue, hue2 };
}

/** Square coin mark — full-bleed tile like discovery board logos (no hollow ring). */
export function generateCtoLogoDataUrl(input: {
  projectName: string;
  ticker: string;
  salt?: number;
}): string {
  const name = input.projectName.trim() || 'CTOgo Coin';
  const ticker = input.ticker.trim().replace(/^\$/, '') || 'CTO';
  const seed = hashSeed(name + ticker) + (input.salt ?? 0) * 97;
  const { hue, hue2 } = palette(seed);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Edge-to-edge fill — discovery logos are square art cropped by the UI radius.
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, `hsl(${hue} 72% 48%)`);
  grad.addColorStop(0.5, `hsl(${hue2} 58% 32%)`);
  grad.addColorStop(1, `hsl(${hue} 50% 16%)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Soft character-like blob so it reads as a meme mark, not a text badge.
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 4; i++) {
    const x = 140 + ((seed * (i + 3)) % 240);
    const y = 120 + ((seed * (i + 7)) % 220);
    const r = 90 + ((seed + i * 23) % 80);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${(hue + 40 + i * 25) % 360} 70% 55%)`;
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const initials = initialsFrom(name, ticker);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 180px ui-sans-serif, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, 256, 250);

  ctx.font = '700 36px ui-sans-serif, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText(`$${ticker.toUpperCase().slice(0, 10)}`, 256, 380);

  return canvas.toDataURL('image/png');
}

/** Wide social / page banner. Instant, offline, always works. */
export function generateCtoBannerDataUrl(input: {
  projectName: string;
  ticker: string;
  logoDataUrl?: string | null;
  tagline?: string;
  salt?: number;
}): string {
  const name = input.projectName.trim() || 'Community Takeover';
  const ticker = input.ticker.trim().replace(/^\$/, '') || 'CTO';
  const tagline = input.tagline?.trim() || 'New mint. Same community.';
  const seed = hashSeed(name + ticker + tagline) + (input.salt ?? 0) * 17;
  const { hue, hue2 } = palette(seed);

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const grad = ctx.createLinearGradient(0, 0, 1200, 630);
  grad.addColorStop(0, `hsl(${hue} 60% 22%)`);
  grad.addColorStop(0.45, '#090b14');
  grad.addColorStop(1, `hsl(${hue2} 50% 16%)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1200, 630);

  ctx.fillStyle = 'rgba(200,255,61,0.08)';
  ctx.beginPath();
  ctx.arc(980, 140, 220, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(180, 520, 180, 0, Math.PI * 2);
  ctx.fill();

  const drawText = () => {
    ctx.fillStyle = '#c8ff3d';
    ctx.font = '700 22px ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('CTOgo', 80, 90);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px ui-serif, Georgia, serif';
    ctx.fillText(name.slice(0, 28), 80, 220);

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '600 36px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText(`$${ticker.toUpperCase().slice(0, 12)}`, 80, 280);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '500 26px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText(tagline.slice(0, 48), 80, 360);

    ctx.fillStyle = '#c8ff3d';
    ctx.font = '700 20px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText('Marketing wallet · Community owned', 80, 540);
  };

  drawText();

  return canvas.toDataURL('image/png');
}

/** Banner that composites logo when the image can be decoded. */
export async function generateCtoBannerWithLogo(input: {
  projectName: string;
  ticker: string;
  logoDataUrl?: string | null;
  tagline?: string;
  salt?: number;
}): Promise<string> {
  const base = generateCtoBannerDataUrl(input);
  if (!input.logoDataUrl) return base;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) return base;

    const bg = new Image();
    await new Promise<void>((resolve, reject) => {
      bg.onload = () => resolve();
      bg.onerror = () => reject(new Error('bg'));
      bg.src = base;
    });
    ctx.drawImage(bg, 0, 0);

    const logo = new Image();
    await new Promise<void>((resolve, reject) => {
      logo.onload = () => resolve();
      logo.onerror = () => reject(new Error('logo'));
      logo.src = input.logoDataUrl!;
    });

    const size = 200;
    const x = 920;
    const y = 215;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2 + 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(9,11,20,0.65)';
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logo, x, y, size, size);
    ctx.restore();
    ctx.strokeStyle = 'rgba(200,255,61,0.7)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.stroke();

    return canvas.toDataURL('image/png');
  } catch {
    return base;
  }
}

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

export function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      reject(new Error('Use PNG, JPG, WebP, or GIF'));
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      reject(new Error('Image must be under 2 MB'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}
