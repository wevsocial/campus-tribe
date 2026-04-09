/**
 * CampusTribeLogo — SVG logo component for Campus Tribe.
 * Usage: <CampusTribeLogo className="w-8 h-8" />
 */
export default function CampusTribeLogo({ className = 'w-8 h-8', showText = false }: { className?: string; showText?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg
        className={className}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ct-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a56db" />
            <stop offset="100%" stopColor="#0e3fa3" />
          </linearGradient>
          <linearGradient id="ct-accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>
        {/* Background */}
        <rect width="64" height="64" rx="14" fill="url(#ct-bg)" />
        {/* C arc */}
        <path
          d="M40 14 C36 11 31 9.5 26 9.5 C14.5 9.5 7 17 7 26.5 C7 36 14.5 43.5 26 43.5 C31 43.5 36 42 40 39"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        {/* T vertical */}
        <line x1="50" y1="10" x2="50" y2="44" stroke="white" strokeWidth="5.5" strokeLinecap="round" />
        {/* T horizontal */}
        <line x1="42" y1="10" x2="58" y2="10" stroke="white" strokeWidth="5.5" strokeLinecap="round" />
        {/* Orange accent dot */}
        <circle cx="26.5" cy="54" r="4" fill="url(#ct-accent)" />
        <circle cx="38" cy="54" r="4" fill="white" opacity="0.45" />
        <circle cx="49.5" cy="54" r="4" fill="white" opacity="0.2" />
      </svg>
      {showText && (
        <span className="font-lexend font-black text-primary tracking-tight leading-none">
          Campus<span className="text-orange-500">Tribe</span>
        </span>
      )}
    </span>
  );
}
