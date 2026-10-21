// Trama decorativa de rombos (cuadrados girados 45°). Toma el color de `currentColor`.
export default function DiamondPattern({
  id,
  className = "",
  size = 28,
}: {
  id: string;
  className?: string;
  size?: number;
}) {
  const h = size / 2;
  return (
    <svg aria-hidden="true" className={`pointer-events-none ${className}`}>
      <defs>
        <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
          <path
            d={`M${h} 2 L${size - 2} ${h} L${h} ${size - 2} L2 ${h} Z`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

// Grupo de tres rombos sólidos, como acento junto a los títulos.
export function DiamondMark({
  className = "",
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <span aria-hidden="true" className={`inline-flex items-center gap-1 ${className}`}>
      <span className="h-2 w-2 rotate-45 bg-gold-400" />
      <span className={`h-2.5 w-2.5 rotate-45 ${light ? "bg-white" : "bg-brand-900"}`} />
      <span className="h-2 w-2 rotate-45 bg-gold-400" />
    </span>
  );
}
