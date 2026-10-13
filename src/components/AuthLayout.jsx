import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import Logo from './Logo';
import usePageTitle from '../lib/usePageTitle';

// Shared shell for /login and /signup (they live outside the main Layout).
// aside: optional content under the card, e.g. a real student's quote on sign-up.
export default function AuthLayout({ title, subtitle, children, footer, aside }) {
  usePageTitle(title);

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
        <Link to="/" aria-label="InterviewPrep home">
          <Logo />
        </Link>
      </div>
      <div className="flex flex-1 justify-center px-4 pb-16 pt-6 sm:pt-12">
        <div className="w-full max-w-sm">
          <Card className="rounded-2xl border-line p-6 shadow-md sm:p-8">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </Card>
          {footer && <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>}
          {aside && <div className="mt-10">{aside}</div>}
        </div>
      </div>
    </div>
  );
}
