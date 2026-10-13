import { cn } from '@/lib/utils';

// Wordmark: a camera's recording light, then the name in Fraunces (practice on camera, then watch
// yourself back). Keep in sync with public/favicon.svg.
export default function Logo({ className }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
        <span className="absolute inset-0 rounded-full bg-brand/30 motion-safe:animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
        <span className="relative h-2.5 w-2.5 rounded-full bg-brand" />
      </span>
      <span className="font-display text-[22px] font-semibold leading-none tracking-tight text-ink">InterviewPrep</span>
    </span>
  );
}
