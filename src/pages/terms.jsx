export default function TermsOfService() {
  const EFFECTIVE_DATE = "September 7, 2025"; // Update as needed

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-gray-600">Effective Date: {EFFECTIVE_DATE}</p>
      </header>

      <section className="prose prose-gray max-w-none">
        <p>
          Welcome to InterviewPrep ("we," "our," "us"). By using our website, services, and
          features, you agree to be bound by these Terms of Service ("Terms"). Please read them
          carefully. If you do not agree, you may not use InterviewPrep.
        </p>

        <h2>1. Eligibility</h2>
        <p>
          You must be at least 13 years old (or the minimum legal age in your jurisdiction) to use
          InterviewPrep. By creating an account, you represent that you meet this requirement.
        </p>

        <h2>2. Accounts</h2>
        <ul>
          <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
          <li>You are responsible for all activities that occur under your account.</li>
          <li>
            You must provide accurate and complete information when signing up and keep it
            up-to-date.
          </li>
        </ul>

        <h2>3. Use of Service</h2>
        <ul>
          <li>
            InterviewPrep provides practice interview sessions, transcripts, and AI-generated
            feedback for educational and preparation purposes only.
          </li>
          <li>
            You may not use the service for unlawful, abusive, or harmful activities, including
            sharing offensive or infringing content.
          </li>
          <li>
            You may not attempt to disrupt, reverse-engineer, or exploit the platform in
            unauthorized ways.
          </li>
        </ul>

        <h2>4. Payments & Access</h2>
        <ul>
            <li>
                Access to premium features is provided on a one-time purchase basis. A single payment grants you access for one year from the date of purchase.
            </li>
            <li>
                At the end of the one-year period, continued access requires purchasing a new plan. We do not automatically renew or charge your payment method.
            </li>
            <li>
                All fees are billed at the time of purchase. Refunds are only provided where required by law.
            </li>
        </ul>

        <h2>5. Content &amp; Data</h2>
        <ul>
          <li>
            During sessions, audio/video streams may be temporarily processed for analysis. We do
            not permanently store recordings. Only transcripts, feedback, and performance data are
            retained with your account.
          </li>
          <li>
            You retain ownership of your content but grant us a limited license to process it for
            providing the service.
          </li>
        </ul>

        <h2>6. Disclaimers</h2>
        <p>
          InterviewPrep is provided on an “as is” and “as available” basis. We do not guarantee that
          use of the service will improve interview performance or lead to admission or employment
          offers. We disclaim all warranties to the maximum extent permitted by law.
        </p>

        <h2>7. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, InterviewPrep and its affiliates will not be liable
          for any indirect, incidental, or consequential damages arising from your use of the
          service.
        </p>

        <h2>8. Termination</h2>
        <p>
          We may suspend or terminate your account if you violate these Terms or misuse the service.
          You may also delete your account at any time.
        </p>

        <h2>9. Changes to Terms</h2>
        <p>
          We may update these Terms occasionally. Updates will be posted at <code>/terms</code> with a
          new effective date. Continued use of InterviewPrep after changes means you accept the new
          Terms.
        </p>

        <h2>10. Governing Law</h2>
        <p>
          These Terms are governed by the laws of the United States and the state in which we are
          based, without regard to conflict of law provisions.
        </p>

        <h2>11. Contact Us</h2>
        <address className="not-italic">
          <strong>InterviewPrep</strong>
          <br />
          Email:{" "}
          <a className="text-blue-600 underline" href="mailto:kam.interviewprep@gmail.com">
            kam.interviewprep@gmail.com
          </a>
        </address>
      </section>
    </main>
  );
}
