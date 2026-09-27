import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles } from 'lucide-react';

// Static example for the homepage hero. Mirrors the per-question card on SessionSummary.
// Overall = 30% impression + 30% clarity + 40% content, same as api/feedback.js.
const SECTIONS = [
  ['Overall Impression', 86],
  ['Clarity & Structure', 78],
  ['Content', 87],
];
const OVERALL = 84;

export default function SampleFeedbackCard({ question = 'Why do you want to become a dentist?' }) {
  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
            Sample feedback
          </span>
          <Badge>{OVERALL}%</Badge>
        </div>
        <p className="pt-1 text-base font-medium text-foreground">“{question}”</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2.5">
          {SECTIONS.map(([label, value]) => (
            <div key={label}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium text-foreground">{value}%</span>
              </div>
              <Progress value={value} className="h-2" />
            </div>
          ))}
        </div>
        <div className="rounded-lg border bg-yellow-50 p-3 text-sm">
          <p className="text-foreground/90">
            You opened with a specific patient moment, which makes your motivation feel genuine. The middle
            drifted into listing experiences. Tie each one back to why this career fits you.
          </p>
          <ul className="mt-2 list-disc list-inside text-foreground/90">
            <li>Close with one sentence on the kind of provider you want to become.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
