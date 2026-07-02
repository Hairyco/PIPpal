/** Client-side demo image generation — production would call an AI API paid in REX. */

function hashSeed(input: string): number {
  return input.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

export function generateProjectImageDataUrl(input: {
  projectName: string;
  description: string;
  categoryLabel?: string;
}): string {
  const name = input.projectName.trim() || 'Rex Project';
  const seed = hashSeed(name + input.description);
  const hue = seed % 360;
  const hue2 = (hue + 40 + (seed % 80)) % 360;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, `hsl(${hue} 65% 42%)`);
  grad.addColorStop(0.5, `hsl(${hue2} 55% 28%)`);
  grad.addColorStop(1, '#030711');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 8; i++) {
    const x = ((seed * (i + 3)) % 400) + 56;
    const y = ((seed * (i + 7)) % 400) + 56;
    const r = 40 + ((seed + i * 17) % 80);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${(hue + i * 30) % 360} 70% 55%)`;
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const initials = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || 'RX';
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.arc(256, 256, 168, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 96px Poppins, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, 256, 248);

  ctx.font = '500 22px Poppins, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  const subtitle = input.categoryLabel ?? name.slice(0, 18);
  ctx.fillText(subtitle, 256, 340);

  ctx.font = '500 14px Poppins, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(14,165,233,0.9)';
  ctx.fillText('Generated with REX', 256, 480);

  return canvas.toDataURL('image/png');
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
