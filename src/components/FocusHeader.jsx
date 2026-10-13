import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Top bar for the interview screens (setup, session, summary), which hide the site header:
// a way back to the dashboard, plus whatever the screen needs on the right.
// className sets the width so the bar lines up with the page below it.
export default function FocusHeader({ className, children }) {
  const navigate = useNavigate();
  return (
    <header className="border-b border-line bg-white">
      <div className={cn('mx-auto flex min-h-14 flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6', className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="-ml-3 text-sm text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" /> Dashboard
        </Button>
        {children}
      </div>
    </header>
  );
}
