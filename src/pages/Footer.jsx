import { Link } from 'react-router-dom';
import { useProfession } from '../professions/ProfessionContext.jsx';

export default function Footer() {
  const { slug } = useProfession() || {};
  const base = slug ? `/${slug}` : '/dental';

  return (
    <footer className="border-t bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2 font-semibold text-gray-900">
            <span className="inline-block h-7 w-7 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600" aria-hidden="true" />
            InterviewPrep
          </div>
          <p className="mt-3 text-sm text-gray-600">Structured practice for healthcare interviews — scenarios, scoring, and instant feedback.</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900">Product</h4>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li><Link to={`${base}/features`} className="hover:text-gray-900">Features</Link></li>
            <li><Link to={`${base}/pricing`} className="hover:text-gray-900">Pricing</Link></li>
            <li><Link to={`${base}/resources`} className="hover:text-gray-900">Resources</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li><Link to={`${base}/about`} className="hover:text-gray-900">About</Link></li>
            <li><a href="mailto:kam.interviewprep@gmail.com" className="hover:text-gray-900">Contact</a></li>
            <li><Link to={`${base}/privacy`} className="hover:text-gray-900">Privacy Policy</Link></li>

          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900">Support</h4>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li><a href="mailto:kam.interviewprep@gmail.com" className="hover:text-gray-900">Email Support</a></li>
            <li><Link to={`${base}/terms`} className="hover:text-gray-900">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-6 text-xs text-gray-500 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} InterviewPrep. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
