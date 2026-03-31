export default function WevSocialBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 font-jakarta font-bold ${className}`}>
      Powered by{' '}
      <span className="text-primary font-black animate-pulse">W</span>
      <span className="text-primary font-black">ev</span>
      <span className="text-on-surface dark:text-slate-100 font-black">Social</span>
    </span>
  );
}
