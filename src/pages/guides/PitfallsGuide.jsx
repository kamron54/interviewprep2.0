import { Link } from 'react-router-dom';
import { useProfession } from '../../professions/ProfessionContext.jsx';
import GuideShell from '../../components/GuideShell';

export default function PitfallsGuide() {
  const { slug } = useProfession() || {};
  const display = { dental: 'Dental', medical: 'Medical' }[slug] || 'Healthcare';
  const base = slug ? `/${slug}` : '/dental';

  return (
    <GuideShell
      title="Common Pitfalls & How to Avoid Them"
      subtitle="Avoid traps that derail otherwise strong interviews."
    >
      <h2>Frequent general pitfalls</h2>
      <ul>
        <li><strong>Generic motivation:</strong> “I just want to help people.” Add a specific, personal why.</li>
        <li><strong>School flattery:</strong> praising rankings without fit. Tie your goals to concrete programs/resources.</li>
        <li><strong>Robotic delivery:</strong> over-memorized answers. Aim for structured but conversational.</li>
        <li><strong>Thin reflection:</strong> describing events without what you learned or changed.</li>
        <li><strong>Dodging weaknesses:</strong> lack of self-awareness. Share a real gap + mitigation plan.</li>
      </ul>

      <h2>How to avoid them</h2>
      <ul>
        <li>Use STAR to make your actions and reflection explicit.</li>
        <li>Swap clichés for specifics: people, projects, patient impact, measurable outcomes.</li>
        <li>Practice aloud with time limits; embrace natural language.</li>
        <li>Close with insight: what you’d do differently and why it matters.</li>
      </ul>

      {display === 'Dental' && (
        <>
          <h2>{display}-specific pitfalls</h2>
          <ul>
            <li><strong>No reflection on exposure:</strong> shadowing/assisting with no takeaways. Name skills, ethics, and patient experience lessons.</li>
            <li><strong>Overemphasizing cosmetics:</strong> balance esthetics with oral health and function.</li>
            <li><strong>Cost blind spots:</strong> ignore affordability. Discuss phased care, referrals, financial counseling.</li>
          </ul>
        </>
      )}

      {display === 'Medical' && (
        <>
          <h2>{display}-specific pitfalls</h2>
          <ul>
            <li><strong>Cliché altruism:</strong> generic “help people” answers. Ground in clinical/service stories with reflection.</li>
            <li><strong>Hierarchy missteps:</strong> dismissing team roles. Emphasize collaboration, curiosity, and safety culture.</li>
            <li><strong>Scope confusion:</strong> unclear about physician responsibilities vs other professions. Show understanding of interprofessional care.</li>
          </ul>
        </>
      )}

      <h2>Answer starter</h2>
      <p>
        “To avoid common traps, I prepare concise STAR stories tied to program fit and patient impact. I keep delivery
        natural and end with reflection—what changed and how I’ll apply it in training.”
      </p>

      <div className="mt-8">
        <Link to={`${base}/setup`} className="inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          Practice avoiding pitfalls
        </Link>
      </div>
    </GuideShell>
  );
}
