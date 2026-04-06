import WevSocialLogo from './WevSocialLogo';

export default function WevSocialBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 font-jakarta font-bold ${className}`}>
      Powered by{' '}
      <WevSocialLogo className="w-5 h-5 text-primary" />
      <span className="text-primary font-black">Wev</span>
      <span className="text-on-surface dark:text-slate-100 font-black">Social</span>
    </span>
  );
}
