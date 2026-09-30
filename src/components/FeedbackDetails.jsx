import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Red is reserved for answers that weren't a genuine attempt (the only ones that can score below 50)
export function ScoreBadge({ score }) {
  const s = Math.round(score || 0);
  const variant = s >= 80 ? 'default' : s >= 50 ? 'secondary' : 'destructive';
  return <Badge variant={variant}>{s}%</Badge>;
}

const SECTIONS = [
  ['Overall Impression', 'overallImpression'],
  ['Clarity & Structure', 'clarityStructure'],
  ['Content', 'content'],
];

function FeedbackList({ title, items, titleClass }) {
  if (!items?.length) return null;
  return (
    <>
      <p className={`mt-3 text-xs font-semibold uppercase tracking-wide ${titleClass}`}>{title}</p>
      <ul className="mt-1 list-disc list-inside space-y-0.5">
        {items.map((s, i) => <li key={i}>{s}</li>)}
      </ul>
    </>
  );
}

// One scored answer: section bars, the summary, what worked, and optional ideas.
// Shared by the session summary and the admin Feedback lab so both show exactly the same thing.
export default function FeedbackDetails({ feedback }) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-card p-3">
        <p className="font-medium text-sm mb-2">Section Scores</p>
        {SECTIONS.map(([label, key]) => {
          const val = Math.round(feedback.sectionScores?.[key] ?? 0);
          return (
            <div key={key} className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-foreground">{val}%</span>
              </div>
              <Progress value={val} className="h-2" />
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border bg-yellow-50 p-3 text-sm text-foreground/90">
        <p className="font-medium mb-1 text-foreground">Feedback</p>
        <p className="whitespace-pre-wrap">{feedback.summary}</p>
        <FeedbackList title="What worked" items={feedback.strengths} titleClass="text-teal-700" />
        {/* Only present when a change would make a real difference */}
        <FeedbackList title="To consider" items={feedback.suggestions} titleClass="text-gray-600" />
      </div>
    </div>
  );
}
