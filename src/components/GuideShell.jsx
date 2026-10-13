import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from './PageHeader';
import usePageTitle from '../lib/usePageTitle';

// Layout for the long-form guides under /resources: a readable single column
export default function GuideShell({ title, subtitle, children }) {
  usePageTitle(title);
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} narrow>
        <Link to="/resources" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All resources
        </Link>
      </PageHeader>

      <section>
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div
            className="
              [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-gray-900
              [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-900
              [&_p]:mt-3 [&_p]:text-lg [&_p]:leading-relaxed [&_p]:text-gray-700
              [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6 [&_ul]:text-lg [&_ul]:text-gray-700 [&_li]:marker:text-gray-400
              [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-6 [&_ol]:text-lg [&_ol]:text-gray-700
              [&_blockquote]:mt-4 [&_blockquote]:border-l-4 [&_blockquote]:border-brand/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-800
              [&_a]:text-teal-700 [&_a]:underline [&_a]:underline-offset-2
            "
          >
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}
