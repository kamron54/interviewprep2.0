export default function PrivacyPolicy() {
  const EFFECTIVE_DATE = "September 7, 2025"; // Update as needed

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-600">Effective Date: {EFFECTIVE_DATE}</p>
      </header>

      <section className="prose prose-gray max-w-none">
        <p>
          InterviewPrep ("we," "our," "us") provides structured practice tools for
          interview preparation, including video/audio practice sessions, transcripts, and instant
          feedback. We respect your privacy and are committed to protecting your personal
          information.
        </p>
        <p>
          This Privacy Policy explains what data we collect, how we use it, and your rights. By
          using InterviewPrep, you agree to this Policy.
        </p>

        <h2>1. Information We Collect</h2>
        <h3>a. Account Information</h3>
        <ul>
          <li>Name and email address (when you sign up or log in).</li>
          <li>Authentication details via Firebase (including whether your email is verified).</li>
        </ul>

        <h3>b. Subscription &amp; Payment Information</h3>
        <ul>
          <li>
            Payment details are processed by our third-party provider (e.g., Stripe). We do not
            store your credit card number on our servers.
          </li>
          <li>Subscription status, trial periods, and renewal/cancellation history.</li>
        </ul>

        <h3>c. Interview Session Data</h3>
        <ul>
          <li>Transcripts generated from your recordings.</li>
          <li>AI feedback, scores, and performance analytics.</li>
          <li>Session metadata (e.g., number of questions, time spent, completion percentage).</li>
        </ul>

        <h3>d. Device &amp; Usage Information</h3>
        <ul>
          <li>Log data such as browser type, operating system, and IP address.</li>
          <li>Feature usage (e.g., number of sessions completed, questions practiced).</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>Provide and improve the InterviewPrep platform.</li>
          <li>Generate transcripts, feedback, and analytics from your responses.</li>
          <li>Track your practice history and performance over time.</li>
          <li>Manage subscriptions, payments, and free trial eligibility.</li>
          <li>Communicate with you about account issues, updates, or support.</li>
          <li>Monitor usage to maintain system security and prevent abuse.</li>
        </ul>

        <h2>3. How We Share Your Information</h2>
        <p>We do not sell your personal data. We may share limited information with:</p>
        <ul>
          <li>
            <strong>Service Providers</strong> (e.g., Firebase for authentication and storage, Stripe for
            payments).
          </li>
          <li>
            <strong>Legal Authorities</strong> if required by law, regulation, or legal process.
          </li>
          <li>
            <strong>Business Transfers</strong> if InterviewPrep is involved in a merger, acquisition, or sale of
            assets.
          </li>
        </ul>

        <h2>4. Data Retention</h2>
        <ul>
          <li>Account and session data are retained for as long as your account is active.</li>
          <li>You may request deletion of your account and data at any time (see Section 7).</li>
          <li>We may retain limited data as required by law (e.g., for billing records).</li>
        </ul>

        <h2>5. Data Security</h2>
        <ul>
          <li>Secure authentication via Firebase.</li>
          <li>Restricted access to personal data.</li>
        </ul>
        <p>
          However, no system is 100% secure. We cannot guarantee absolute security of your
          information.
        </p>

        <h2>6. Children’s Privacy</h2>
        <p>
          InterviewPrep is not intended for individuals under the age of 13 (or the minimum legal
          age in your jurisdiction). We do not knowingly collect personal data from children.
        </p>

        <h2>7. Your Rights</h2>
        <p>Depending on where you live, you may have the right to:</p>
        <ul>
          <li>Access, correct, or delete your personal data.</li>
          <li>Request a copy of your data.</li>
          <li>Opt out of marketing communications.</li>
          <li>Restrict or object to certain processing activities.</li>
        </ul>
        <p>
          To exercise these rights, contact us at{' '}
          <a className="text-blue-600 underline" href="mailto:kam.interviewprep@gmail.com">
            kam.interviewprep@gmail.com
          </a>
          .
        </p>

        <h2>8. International Users</h2>
        <p>
          If you access InterviewPrep from outside the United States, your information may be
          processed and stored in the U.S. or other countries where our service providers operate.
        </p>

        <h2>9. Changes to this Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. The updated version will be posted at
          <code className="bg-gray-100 rounded px-1">/privacy</code> with a new effective date.
        </p>

        <h2>10. Contact Us</h2>
        <address className="not-italic">
          <strong>InterviewPrep</strong>
          <br />
          Email:{' '}
          <a className="text-blue-600 underline" href="mailto:kam.interviewprep@gmail.com">
            kam.interviewprep@gmail.com
          </a>
        </address>
      </section>
    </main>
  );
}
