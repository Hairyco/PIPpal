export function TokenIcon({
  symbol,
  size = 'md',
  imageUrl,
}: {
  symbol: string;
  size?: 'sm' | 'md' | 'lg';
  imageUrl?: string | null;
}) {
  const hue = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  const sizeClass =
    size === 'lg' ? 'h-12 w-12 text-sm' : size === 'sm' ? 'h-8 w-8 text-[10px]' : 'h-10 w-10 text-xs';

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className={`shrink-0 rounded-full object-cover ${sizeClass}`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${sizeClass}`}
      style={{ backgroundColor: `hsl(${hue} 60% 45%)` }}
    >
      {symbol.slice(0, 2)}
    </div>
  );
}
