import { Link } from 'react-router-dom';
import usePageTitle from '../lib/usePageTitle';

export default function Resources() {
  usePageTitle('Resources');

  const guides = [
    { title: 'Ethical Frameworks Cheat Sheet',        to: '/resources/ethics' },
    { title: 'STAR / SPIKES Communication',           to: '/resources/communication' },
    { title: 'Common Pitfalls & How to Avoid Them',   to: '/resources/pitfalls' },
  ];

  const downloads = [
    { title: 'Interview Tips (PDF)', href: '/resources/interview-tips.pdf' },
    { title: 'Interview Day Checklist (PDF)',  href: '/resources/checklist.pdf' },
    { title: 'Thank-You Email Samples (PDF)',  href: '/resources/thank-you.pdf' },
  ];

  return (
    <div>
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900">Resources</h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-600">
            Curated guides, templates, and tools for high-confidence interview prep.
          </p>
        </div>
      </section>

      <section className="bg-gray-50">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-16 sm:px-6 md:grid-cols-2 lg:px-8">
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-base font-semibold text-gray-900">Guides</h2>
            <ul className="mt-4 space-y-3 text-sm text-gray-700">
              {guides.map(g => (
                <li key={g.title}>
                  <Link to={g.to} className="hover:underline">{g.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-base font-semibold text-gray-900">Downloads</h2>
            <ul className="mt-4 space-y-3 text-sm text-gray-700">
              {downloads.map(d => (
                <li key={d.title}>
                  <a href={d.href} className="hover:underline" download>{d.title}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gray-50 p-6">
            <h2 className="text-base font-semibold text-gray-900">Office hours</h2>
            <p className="mt-2 text-sm text-gray-600">
              Have questions? We love helping applicants. Email{' '}
              <a className="underline" href="mailto:kam.interviewprep@gmail.com">kam.interviewprep@gmail.com</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
