import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import FeedbackDetails, { ScoreBadge } from './FeedbackDetails';

// Static example for the homepage and program-page heroes. Uses the same FeedbackDetails as the
// session summary, so it always looks exactly like the feedback students get.
const SAMPLE_FEEDBACK = {
  // Same weights as api/feedback.js: 0.3 × 88 + 0.3 × 82 + 0.4 × 86 = 85.4
  overallScore: 85,
  sectionScores: { overallImpression: 88, clarityStructure: 82, content: 86 },
  summary: 'This is a strong answer that sounds personal rather than rehearsed. You don’t need to change much before interview day.',
  strengths: [
    'Opening with a specific patient moment makes your motivation feel real.',
    'You say what each experience taught you, not just what you did.',
  ],
  suggestions: ['Close with one sentence on the kind of provider you want to become.'],
};

export default function SampleFeedbackCard({ question = 'Why do you want to become a dentist?' }) {
  return (
    <Card className="rounded-2xl p-5 shadow-lg sm:p-6">
      {/* Laid out like an answer on the session summary */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
            Sample feedback
          </p>
          <p className="mt-1 text-base font-semibold text-gray-900">{question}</p>
        </div>
        <div className="shrink-0"><ScoreBadge score={SAMPLE_FEEDBACK.overallScore} /></div>
      </div>
      <div className="mt-4">
        <FeedbackDetails feedback={SAMPLE_FEEDBACK} />
      </div>
    </Card>
  );
}
