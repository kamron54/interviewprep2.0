import { Link } from 'react-router-dom';
import { useProfession } from '../../professions/ProfessionContext.jsx';
import GuideShell from '../../components/GuideShell';

export default function EthicsGuide() {
  const { slug } = useProfession() || {};
  const display = { dental: 'Dental', medical: 'Medical' }[slug] || 'Healthcare';
  const base = slug ? `/${slug}` : '/dental';

  return (
    <GuideShell
      title="Ethical Frameworks Cheat Sheet"
      subtitle="Apply consistent, patient-centered reasoning under pressure."
    >
      <h2>Why ethics matter in interviews</h2>
      <p>
        Ethical scenarios test judgment, empathy, and professionalism. Schools want to see that you can reason
        transparently, balance stakeholder interests, and uphold patient safety and dignity—especially in ambiguous situations.
      </p>

      <h2>Core principles (use as a compass)</h2>
      <ul>
        <li><strong>Autonomy:</strong> respect informed choices; check understanding and capacity.</li>
        <li><strong>Beneficence:</strong> act in the patient’s best interests; seek meaningful benefit.</li>
        <li><strong>Non-maleficence:</strong> avoid harm; consider risks and safer alternatives.</li>
        <li><strong>Justice:</strong> fairness in access, resources, and triage; avoid bias.</li>
        <li><strong>Accountability & fidelity:</strong> follow standards/policies; be honest about limits.</li>
        <li><strong>Confidentiality:</strong> protect privacy; know exceptions (imminent harm, legal duty).</li>
      </ul>

      <h2>A structured approach (how to answer)</h2>
      <ol>
        <li><strong>Clarify the scenario:</strong> stakeholders, facts, missing information, urgency.</li>
        <li><strong>Surface the conflict:</strong> which principles are in tension (e.g., autonomy vs safety)?</li>
        <li><strong>Generate options:</strong> list feasible paths (incl. watchful waiting) and likely outcomes.</li>
        <li><strong>Evaluate trade-offs:</strong> risks, benefits, fairness, feasibility, consent.</li>
        <li><strong>Decide & justify:</strong> choose an option and explain how it honors the principles.</li>
        <li><strong>Communicate next steps:</strong> document, involve team/supervisor, safety-net, follow-up.</li>
      </ol>

      <h2>Common ethical themes</h2>
      <ul>
        <li>Capacity & consent (language barriers, intoxication, cognitive impairment)</li>
        <li>Resource constraints & fairness (overbooking, emergency triage, rural access)</li>
        <li>Confidentiality vs duty to warn (harm to self/others, public health)</li>
        <li>Boundary issues, gifts, social media, conflicts of interest</li>
      </ul>

      {/* Profession-specific focus */}
      {display === 'Dental' && (
        <>
          <h2>{display}: frequent ethics scenarios</h2>
          <ul>
            <li><strong>Treatment necessity vs cosmetics:</strong> communicate risks, alternatives, and costs clearly; avoid upselling.</li>
            <li><strong>Infection control & disclosure:</strong> adhere to protocols; be transparent about exposure/incidents.</li>
            <li><strong>Anxious/minor patients:</strong> assent, parental consent, pain control, trauma-informed care.</li>
            <li><strong>Financial hardship:</strong> discuss staged care, referrals, or school/clinic resources without compromising safety.</li>
          </ul>
        </>
      )}

      {display === 'Medical' && (
        <>
          <h2>{display}: frequent ethics scenarios</h2>
          <ul>
            <li><strong>Refusal of care with capacity:</strong> verify understanding, document, and safety-net.</li>
            <li><strong>Disclosing errors:</strong> prompt, honest disclosure; apology; systems learning.</li>
            <li><strong>End-of-life goals:</strong> align care with values; weigh burdens vs benefits.</li>
            <li><strong>Dual obligations:</strong> advocate for patient while respecting team protocols and constraints.</li>
          </ul>
        </>
      )}

      <h2>Answer starter (use and adapt)</h2>
      <p>
        “I’d clarify the facts and stakeholders, then weigh <em>autonomy</em>, <em>beneficence</em>, <em>non-maleficence</em>,
        and <em>justice</em>. I’d outline options, compare risks/benefits, and choose the path that best protects safety and
        informed choice. I’d communicate transparently, document, and involve the team for follow-up.”
      </p>

      <div className="mt-8">
        <Link to={`${base}/setup`} className="inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          Practice an ethics scenario
        </Link>
      </div>
    </GuideShell>
  );
}
