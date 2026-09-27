import { useEffect } from 'react';

const SITE_NAME = 'InterviewPrep';
const DEFAULT_TITLE = 'InterviewPrep | Mock interview practice for dental & medical school';

// Sets the browser tab title, e.g. "Pricing · InterviewPrep". No title → the homepage default.
export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE_NAME}` : DEFAULT_TITLE;
  }, [title]);
}
