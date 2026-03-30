import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  size?: number;
  className?: string;
  animationType?: 'pulse' | 'bounce' | 'spin-on-hover';
  color?: string;
}

export function AnimatedIcon({ icon: Icon, size = 20, className = '', animationType = 'pulse', color }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      if (animationType === 'pulse') {
        gsap.fromTo(ref.current, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' });
      } else if (animationType === 'bounce') {
        gsap.fromTo(ref.current, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'bounce.out' });
      }
    }, ref);
    const el = ref.current;
    const handleEnter = () => gsap.to(el, { scale: 1.15, duration: 0.2, ease: 'power2.out' });
    const handleLeave = () => gsap.to(el, { scale: 1, duration: 0.2, ease: 'power2.in' });
    el?.addEventListener('mouseenter', handleEnter);
    el?.addEventListener('mouseleave', handleLeave);
    return () => {
      ctx.revert();
      el?.removeEventListener('mouseenter', handleEnter);
      el?.removeEventListener('mouseleave', handleLeave);
    };
  }, [animationType]);
  return (
    <span
      ref={ref}
      className={`inline-flex items-center justify-center ${className}`}
      style={{ display: 'inline-flex' }}
    >
      <Icon size={size} color={color} />
    </span>
  );
}

export default AnimatedIcon;
