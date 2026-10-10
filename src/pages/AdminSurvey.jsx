import { useState } from 'react';
import { toast } from 'sonner';
import { auth } from '../../firebase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AdminLayout from '../components/AdminLayout';
import { useAdminSurvey } from '../lib/adminData';
import { getProgram } from '../professions/index.js';
import { PRICE_QUESTIONS, SURVEY_REASONS } from '../lib/survey';

export default function AdminSurvey() {
  return (
    <AdminLayout title="Survey">
      <SurveyAdmin />
    </AdminLayout>
  );
}

const shortDate = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—');

function median(values) {
  const v = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!v.length) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

function SurveyAdmin() {
  const { survey, reload } = useAdminSurvey();
  const [sendingTest, setSendingTest] = useState(false);

  if (!survey) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (survey.error) return <p className="text-sm text-muted-foreground">Couldn’t load the survey. Try refreshing.</p>;

  const sendTest = async () => {
    setSendingTest(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch('/api/survey-emails', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not send the test email.');
      toast.success(`Test email sent to ${data.sentTo}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSendingTest(false);
    }
  };

  const { responses } = survey;
  const stats = [
    ['Emails sent', survey.sentCount],
    ['Due now', survey.dueCount],
    ['Answered', responses.length],
    ['Unsubscribed', survey.unsubscribedCount],
  ];

  return (
    <>
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Survey emails</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {survey.live
                ? `Sending is on: up to ${survey.perRun} a day, around 9am Pacific.`
                : 'Sending is off, so nobody gets it yet. Still needed:'}
            </p>
            {!survey.live && (
              <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                {survey.missing.map((m) => <li key={m}>{m}</li>)}
              </ul>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={sendTest} disabled={sendingTest}>
            {sendingTest ? 'Sending…' : 'Send me a test email'}
          </Button>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-lg bg-gray-50 p-3">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 text-xl font-semibold text-gray-900">{value.toLocaleString()}</dd>
            </div>
          ))}
        </dl>

        <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {survey.live ? 'Next batch' : 'Would get it first'} ({survey.nextBatch.length} of {survey.dueCount})
        </h3>
        {survey.nextBatch.length ? (
          <ul className="mt-2 divide-y text-sm">
            {survey.nextBatch.map((u) => (
              <li key={u.email} className="flex flex-wrap justify-between gap-x-4 py-2">
                <span className="text-gray-900">{u.name || '—'} <span className="text-muted-foreground">{u.email}</span></span>
                <span className="text-muted-foreground">trial ended {shortDate(u.trialEndedAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Nobody is due right now.</p>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-gray-900">Answers ({responses.length})</h2>
          <Button variant="ghost" size="sm" onClick={reload}>Refresh</Button>
        </div>

        {responses.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No answers yet.</p>
        ) : (
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What stopped them</h3>
              <ul className="mt-2 space-y-1.5 text-sm">
                {SURVEY_REASONS
                  .map((r) => [r, responses.filter((x) => x.reasons.includes(r.id)).length])
                  .sort((a, b) => b[1] - a[1])
                  .map(([r, count]) => (
                    <li key={r.id} className="flex justify-between gap-4">
                      <span className="text-gray-700">{r.label}</span>
                      <span className="font-medium text-gray-900">{count}</span>
                    </li>
                  ))}
              </ul>
            </div>
            <div>
              {/* Van Westendorp: a chart comes once there are enough answers to read curves from */}
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Price for 12 months (median)</h3>
              <ul className="mt-2 space-y-1.5 text-sm">
                {PRICE_QUESTIONS.map((q) => {
                  const m = median(responses.map((x) => x.prices[q.id]));
                  return (
                    <li key={q.id} className="flex justify-between gap-4">
                      <span className="text-gray-700">{q.label}</span>
                      <span className="font-medium text-gray-900">{m == null ? '—' : `$${Number.isInteger(m) ? m : m.toFixed(2)}`}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {responses.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Student</th>
                  <th className="py-2 pr-4 font-medium">Reasons</th>
                  <th className="py-2 pr-4 text-right font-medium">Cheap · Bargain · Pricey · Too much</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {responses.map((r) => (
                  <tr key={`${r.email}-${r.submittedAt}`} className="align-top">
                    <td className="whitespace-nowrap py-2 pr-4 text-muted-foreground">{shortDate(r.submittedAt)}</td>
                    <td className="py-2 pr-4">
                      <div className="text-gray-900">{r.email}</div>
                      <div className="text-xs text-muted-foreground">
                        {getProgram(r.program)?.name || '—'} · {r.sessionsCompleted} session{r.sessionsCompleted === 1 ? '' : 's'}
                      </div>
                    </td>
                    <td className="py-2 pr-4 text-gray-700">
                      {r.reasons.map((id) => SURVEY_REASONS.find((x) => x.id === id)?.label).filter(Boolean).join('; ')}
                      {r.other && <div className="mt-1 italic text-muted-foreground">“{r.other}”</div>}
                    </td>
                    <td className="whitespace-nowrap py-2 pr-4 text-right text-gray-900">
                      {PRICE_QUESTIONS.map((q) => `$${r.prices[q.id] ?? '—'}`).join(' · ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
