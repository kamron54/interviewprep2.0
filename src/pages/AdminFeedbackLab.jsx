import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import AdminLayout from '../components/AdminLayout';
import FormMessage from '../components/FormMessage';
import FeedbackDetails, { ScoreBadge } from '../components/FeedbackDetails';
import { getFeedback } from '../ai/aiService';
import { livePrograms } from '../professions/index.js';

export default function AdminFeedbackLab() {
  return (
    <AdminLayout title="Feedback lab">
      <FeedbackLab />
    </AdminLayout>
  );
}

// Admin tool: score a pasted answer exactly like a real session would (same API, same display),
// to tune the feedback instructions in api/feedback.js without recording answers.
function FeedbackLab() {
  const programs = livePrograms();
  const [tag, setTag] = useState(programs[0].tag);
  const [question, setQuestion] = useState('');
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');
  const [scoring, setScoring] = useState(false);

  const handleScore = async (e) => {
    e.preventDefault();
    setError('');
    setScoring(true);
    try {
      setFeedback(await getFeedback(question.trim(), transcript.trim(), tag));
    } catch (err) {
      setFeedback(null);
      setError(err.message || 'Scoring failed');
    } finally {
      setScoring(false);
    }
  };

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Paste an answer to see the exact score and feedback a student would get.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <form onSubmit={handleScore} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="lab-program" className="text-sm font-medium">Program</label>
              <select
                id="lab-program"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {programs.map((p) => <option key={p.slug} value={p.tag}>{p.displayName}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="lab-question" className="text-sm font-medium">Question</label>
              <Input
                id="lab-question"
                className="h-10"
                placeholder="Why do you want to become a dentist?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="lab-transcript" className="text-sm font-medium">Answer (as spoken)</label>
              <textarea
                id="lab-transcript"
                rows={12}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={scoring}>
              {scoring ? 'Scoring…' : 'Score answer'}
            </Button>
            {error && <FormMessage>{error}</FormMessage>}
          </form>
        </Card>

        <Card className="p-6">
          {feedback ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Result</h2>
                <ScoreBadge score={feedback.overallScore} />
              </div>
              <FeedbackDetails feedback={feedback} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">The score and feedback will appear here.</p>
          )}
        </Card>
      </div>
    </>
  );
}
