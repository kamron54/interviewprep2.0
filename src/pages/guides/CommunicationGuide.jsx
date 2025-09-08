import { Link } from 'react-router-dom';
import { useProfession } from '../../professions/ProfessionContext.jsx';
import GuideShell from '../../components/GuideShell';

export default function CommunicationGuide() {
  const { slug } = useProfession() || {};
  const display = { dental: 'Dental', medical: 'Medical' }[slug] || 'Healthcare';
  const base = slug ? `/${slug}` : '/dental';

  return (
    <GuideShell
      title="STAR / SPIKES Communication"
      subtitle="Structure answers clearly and deliver difficult messages with empathy."
    >
      <h2>Why communication wins interviews</h2>
      <p>
        Strong communication shows clarity, empathy, and teamwork. Interviewers listen for organization,
        audience awareness, and how you translate knowledge into patient-centered language.
      </p>

      <h2>STAR: structure for behavioral questions</h2>
      <ul>
        <li><strong>Situation:</strong> one-line context (who, where, why it mattered).</li>
        <li><strong>Task:</strong> your responsibility or target.</li>
        <li><strong>Action:</strong> specific steps you took (collaboration, rationale, alternatives).</li>
        <li><strong>Result + reflection:</strong> outcome, learning, and how you’d improve.</li>
      </ul>
      <p><em>Tip:</em> be concise on context, specific on actions, explicit on reflection.</p>

      <h2>SPIKES: delivering difficult news</h2>
      <ol>
        <li><strong>Setting:</strong> privacy, time, support present.</li>
        <li><strong>Perception:</strong> ask what they understand.</li>
        <li><strong>Invitation:</strong> ask how much detail they want.</li>
        <li><strong>Knowledge:</strong> clear, non-jargon explanation; pause for questions.</li>
        <li><strong>Empathy:</strong> validate emotion; silence; check in.</li>
        <li><strong>Strategy & Summary:</strong> plan next steps, follow-up, resources.</li>
      </ol>

      <h2>Active listening & plain language</h2>
      <ul>
        <li>Open questions → listen → summarize → confirm understanding.</li>
        <li>Translate jargon into everyday terms; use teach-back.</li>
        <li>Attend to tone, pace, and non-verbals; invite concerns early.</li>
      </ul>

      {display === 'Dental' && (
        <>
          <h2>{display}: common communication challenges</h2>
          <ul>
            <li><strong>Anxiety management:</strong> normalize fears; explain steps, options, and pain control.</li>
            <li><strong>Treatment planning:</strong> present phased plans and costs transparently; avoid pressure.</li>
            <li><strong>Informed consent:</strong> visuals/diagrams; check understanding; document questions.</li>
          </ul>
        </>
      )}

      {display === 'Medical' && (
        <>
          <h2>{display}: common communication challenges</h2>
          <ul>
            <li><strong>Time-limited settings:</strong> prioritize concerns; safety-net with clear return precautions.</li>
            <li><strong>Team communication:</strong> SBAR for handoffs; closed-loop; clarify roles.</li>
            <li><strong>Shared decisions:</strong> align plan with goals/values; acknowledge uncertainty.</li>
          </ul>
        </>
      )}

      <h2>Answer starter</h2>
      <p>
        “I’d use STAR to keep the response organized and highlight my actions and learning. For sensitive updates,
        I’d use SPIKES: check understanding, share information clearly, respond to emotion, and agree on next steps.”
      </p>

      <div className="mt-8">
        <Link to={`${base}/setup`} className="inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          Practice a communication scenario
        </Link>
      </div>
    </GuideShell>
  );
}
