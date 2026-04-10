/**
 * CampusTribeLogo — Official Campus Tribe brand mark.
 * White circle background with orange "Ct" monogram and orange border ring.
 * Supports Y-axis rotation animation via GSAP with CSS @keyframes fallback.
 */
import React, { useEffect, useRef } from 'react';

export default function CampusTribeLogo({
  className = 'w-8 h-8',
  showText = false,
  animated = false,
}: {
  className?: string;
  showText?: boolean;
  animated?: boolean;
}) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!animated || !spanRef.current) return;
    let tween: any;
    try {
      // Dynamic import to avoid SSR issues
      import('gsap').then(({ gsap }) => {
        if (!spanRef.current) return;
        tween = gsap.to(spanRef.current, {
          rotationY: 360,
          duration: 3,
          ease: 'power1.inOut',
          repeat: -1,
          transformPerspective: 300,
          transformOrigin: '50% 50%',
        });
      }).catch(() => {
        // GSAP not available, CSS fallback handles it
      });
    } catch {
      // GSAP not available, CSS fallback handles it
    }
    return () => {
      tween?.kill?.();
    };
  }, [animated]);

  return (
    <span className="inline-flex items-center gap-2.5">
      {animated && (
        <style>{`
          @keyframes ct-flipY {
            0%,30%  { transform: perspective(200px) rotateY(0deg); }
            50%     { transform: perspective(200px) rotateY(180deg); }
            70%,100%{ transform: perspective(200px) rotateY(360deg); }
          }
          .ct-logo-animated-fallback {
            animation: ct-flipY 3s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
            transform-origin: center center;
            display: inline-block;
          }
        `}</style>
      )}
      <span
        ref={spanRef}
        className={animated ? 'ct-logo-animated-fallback' : undefined}
        style={{ display: 'inline-flex' }}
      >
        <svg
          className={className}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Campus Tribe logo"
        >
          {/* White circle background */}
          <circle cx="50" cy="50" r="50" fill="#ffffff" />
          {/* Orange border ring */}
          <circle cx="50" cy="50" r="47" fill="none" stroke="#f97316" strokeWidth="5" />

          {/* C shape — arc open on right */}
          <path
            d="M50 18 A32 32 0 1 0 50 82 L50 71 A21 21 0 1 1 50 29 Z"
            fill="#f97316"
          />
          {/* White mask to cut the right opening of C */}
          <polygon
            points="50,18 84,40 84,60 50,82 50,71 76,60 76,40 50,29"
            fill="#ffffff"
          />

          {/* t — vertical stem */}
          <rect x="57" y="26" width="10" height="47" rx="3" fill="#f97316" />
          {/* t — crossbar */}
          <rect x="50" y="37" width="22" height="10" rx="3" fill="#f97316" />
        </svg>
      </span>
      {showText && (
        <span className="font-lexend font-black italic tracking-tight leading-none">
          <span style={{ color: '#1a56db' }}>Campus</span>
          <span style={{ color: '#f97316' }}> Tribe</span>
        </span>
      )}
    </span>
  );
}
