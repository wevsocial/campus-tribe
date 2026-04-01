import { useEffect, useRef } from 'react';

export default function WevSocialLogo({ className = '' }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let gsapLoaded = false;
    const animate = async () => {
      try {
        const { gsap } = await import('gsap');
        if (!svgRef.current || gsapLoaded) return;
        gsapLoaded = true;
        const circle1 = svgRef.current.querySelector('.wev-circle1');
        const circle2 = svgRef.current.querySelector('.wev-circle2');
        const diamond = svgRef.current.querySelector('.wev-diamond');
        if (circle1) gsap.to(circle1, { rotation: 360, duration: 3, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
        if (circle2) gsap.to(circle2, { rotation: -360, duration: 5, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
        if (diamond) gsap.to(diamond, { scale: 1.2, duration: 1.5, repeat: -1, yoyo: true, ease: 'power2.inOut', transformOrigin: '50% 50%' });
      } catch {
        // GSAP not available, use CSS fallback (already applied via className)
      }
    };
    animate();
  }, []);

  return (
    <svg ref={svgRef} viewBox="0 0 32 32" className={`inline ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle className="wev-circle1 animate-[spin_3s_linear_infinite]" cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2" strokeDasharray="20 10" strokeLinecap="round"/>
      <circle className="wev-circle2" cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="12 6" strokeLinecap="round" opacity="0.6" style={{animation:'spin 5s linear infinite reverse'}}/>
      <path className="wev-diamond" d="M16 8 L24 16 L16 24 L8 16 Z" fill="currentColor" opacity="0.8"/>
      <circle cx="16" cy="16" r="3" fill="currentColor"/>
    </svg>
  );
}
