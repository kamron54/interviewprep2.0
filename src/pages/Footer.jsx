import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { allPrograms } from '../professions/index.js';

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-5 lg:px-8">
        <div className="col-span-2">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-gray-600">Mock interview practice for health professions school applicants, with instant feedback on every answer.</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900">Programs</h4>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            {allPrograms().map((p) => (
              <li key={p.slug}>
                <Link to={`/${p.slug}`} className="hover:text-gray-900">{p.name}</Link>
                {p.status === 'soon' && <span className="ml-1.5 text-xs text-gray-400">Soon</span>}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900">Product</h4>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li><Link to="/pricing" className="hover:text-gray-900">Pricing</Link></li>
            <li><Link to="/resources" className="hover:text-gray-900">Resources</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li><Link to="/about" className="hover:text-gray-900">About</Link></li>
            <li><a href="mailto:kam.interviewprep@gmail.com" className="hover:text-gray-900">Contact</a></li>
            <li><Link to="/privacy" className="hover:text-gray-900">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-gray-900">Terms of Service</Link></li>
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
