import { MessagesSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

// Brand mark + wordmark. Keep in sync with public/favicon.svg.
export default function Logo({ className }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-semibold tracking-tight text-gray-900', className)}>
      <span
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 shadow-sm"
        aria-hidden="true"
      >
        <MessagesSquare className="h-[18px] w-[18px] text-white" />
      </span>
      InterviewPrep
    </span>
  );
}
