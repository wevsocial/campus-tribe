/**
 * CampusTribeLogo — The official Campus Tribe Ct mark in a circular frame.
 * Matches the actual brand logo: orange Ct monogram on blue circle.
 * Includes Y-axis flip animation when used as favicon (controlled by CSS).
 */
export default function CampusTribeLogo({
  className = 'w-8 h-8',
  showText = false,
  animated = false,
}: {
  className?: string;
  showText?: boolean;
  animated?: boolean;
}) {
  const animStyle = animated
    ? {
        animation: 'ct-flipY 3s ease-in-out infinite',
        transformOrigin: '50px 50px',
        transformBox: 'fill-box' as const,
      }
    : {};

  return (
    <span className="inline-flex items-center gap-2.5">
      {animated && (
        <style>{`
          @keyframes ct-flipY {
            0%,32%  { transform: rotateY(0deg); }
            52%     { transform: rotateY(180deg); }
            88%,100%{ transform: rotateY(360deg); }
          }
        `}</style>
      )}
      <svg
        className={className}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="ct-logo-clip">
            <circle cx="50" cy="50" r="49" />
          </clipPath>
        </defs>

        {/* Blue circular background */}
        <circle cx="50" cy="50" r="50" fill="#1a56db" />

        <g clipPath="url(#ct-logo-clip)">
          <g style={animStyle}>
            {/* C ring arc — opens on right side */}
            <path
              d="M50 14 A36 36 0 1 0 50 86 L50 76 A26 26 0 1 1 50 24 Z"
              fill="#f97316"
            />
            {/* Blue mask cutting right opening of C */}
            <polygon
              points="50,14 86,38 86,62 50,86 50,76 78,62 78,38 50,24"
              fill="#1a56db"
            />
            {/* t vertical stem */}
            <rect x="56" y="25" width="10" height="48" rx="2.5" fill="#f97316" />
            {/* t crossbar */}
            <rect x="49" y="37" width="22" height="10" rx="2.5" fill="#f97316" />
          </g>
        </g>
      </svg>
      {showText && (
        <span className="font-lexend font-black tracking-tight leading-none">
          <span className="text-primary">Campus</span>
          <span className="text-orange-500">Tribe</span>
        </span>
      )}
    </span>
  );
}
