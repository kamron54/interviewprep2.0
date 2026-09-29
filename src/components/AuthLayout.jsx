import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import Logo from './Logo';
import usePageTitle from '../lib/usePageTitle';

// Shared shell for /login and /signup (they live outside the main Layout)
export default function AuthLayout({ title, subtitle, children, footer }) {
  usePageTitle(title);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <Link to="/" aria-label="InterviewPrep home">
          <Logo />
        </Link>
      </div>
      <div className="flex flex-1 justify-center px-4 pb-16 pt-6 sm:pt-12">
        <div className="w-full max-w-sm">
          <Card className="rounded-2xl p-6 sm:p-8">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </Card>
          {footer && <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>}
        </div>
      </div>
    </div>
  );
}
