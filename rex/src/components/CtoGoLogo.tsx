/** Lime “GO” mark for CTOgo. */
export function CtoGoLogo({
  size = 36,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  const fontSize = Math.round(size * 0.38);
  return (
    <span
      className={`inline-grid place-items-center rounded-[28%] bg-[#c8ff3d] font-black leading-none tracking-tight text-[#090b14] ${className}`}
      style={{ width: size, height: size, fontSize }}
      aria-hidden
    >
      GO
    </span>
  );
}
