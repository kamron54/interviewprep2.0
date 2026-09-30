import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Red is reserved for answers that weren't a genuine attempt (the only ones that can score below 50)
export function ScoreBadge({ score }) {
  const s = Math.round(score || 0);
  const variant = s >= 80 ? 'default' : s >= 50 ? 'secondary' : 'destructive';
  return <Badge variant={variant}>{s}%</Badge>;
}

const SECTIONS = [
  ['Impression', 'overallImpression'],
  ['Clarity', 'clarityStructure'],
  ['Content', 'content'],
];

function FeedbackList({ title, items, titleClass }) {
  if (!items?.length) return null;
  return (
    <div className="mt-4">
      <p className={`text-xs font-semibold uppercase tracking-wide ${titleClass}`}>{title}</p>
      <ul className="mt-1.5 list-disc space-y-1 pl-5">
        {items.map((s, i) => <li key={i}>{s}</li>)}
      </ul>
    </div>
  );
}

// One scored answer: the written feedback first, then a compact row of section scores.
// Shared by the session summary and the admin Feedback lab so both show exactly the same thing.
export default function FeedbackDetails({ feedback }) {
  return (
    <div>
      <div className="text-sm leading-6 text-gray-700">
        <p className="whitespace-pre-wrap">{feedback.summary}</p>
        <FeedbackList title="What worked" items={feedback.strengths} titleClass="text-teal-700" />
        {/* Only present when a change would make a real difference */}
        <FeedbackList title="To consider" items={feedback.suggestions} titleClass="text-gray-500" />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4 border-t pt-4">
        {SECTIONS.map(([label, key]) => {
          const val = Math.round(feedback.sectionScores?.[key] ?? 0);
          return (
            <div key={key}>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>{label}</span>
                <span className="font-medium text-foreground">{val}</span>
              </div>
              <Progress value={val} className="h-1.5" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
