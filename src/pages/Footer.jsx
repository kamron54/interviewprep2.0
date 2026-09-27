import { Link } from 'react-router-dom';
import { useProfession } from '../professions/ProfessionContext.jsx';
import { HashLink } from 'react-router-hash-link';
import Logo from '../components/Logo';

export default function Footer() {
  const { slug } = useProfession() || {};
  const base = slug ? `/${slug}` : '/dental';

  return (
    <footer className="border-t bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-gray-600">Mock interview practice for dental and medical school applicants, with AI feedback on every answer.</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900">Product</h4>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li><HashLink smooth to={`${base}#features`} className="hover:text-gray-900">Features</HashLink></li>
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
