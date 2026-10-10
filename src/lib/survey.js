// The survey sent to students who didn't upgrade. Plain data only: the survey page, api/survey.js
// and the admin Survey tab all read it, so the questions and the checks never drift apart.

export const SURVEY_REASONS = [
  { id: 'price', label: 'It’s too expensive' },
  { id: 'done', label: 'My interviews are over (or I already got in)' },
  { id: 'enough', label: 'The free sessions were enough' },
  { id: 'feedback', label: 'The feedback wasn’t helpful enough' },
  { id: 'technical', label: 'Technical problems' },
  { id: 'later', label: 'I haven’t gotten around to it' },
  { id: 'elsewhere', label: 'I’m using something else to prepare' },
];

// Van Westendorp's four price questions, all about 12 months of access
export const PRICE_QUESTIONS = [
  { id: 'tooCheap', label: 'So cheap you’d doubt the quality?' },
  { id: 'bargain', label: 'A bargain?' },
  { id: 'expensive', label: 'Getting expensive, but you’d still consider it?' },
  { id: 'tooExpensive', label: 'Too expensive to consider?' },
];

export const MAX_OTHER_LENGTH = 500;

// Checks a submitted survey: { answers } when it's usable, otherwise { error } to show the student
export function cleanSurvey(body) {
  const known = new Set(SURVEY_REASONS.map((r) => r.id));
  const reasons = Array.isArray(body?.reasons) ? [...new Set(body.reasons)].filter((r) => known.has(r)) : [];
  const other = String(body?.other ?? '').trim().slice(0, MAX_OTHER_LENGTH);
  if (!reasons.length && !other) return { error: 'Pick at least one reason, or write your own.' };

  const prices = {};
  for (const q of PRICE_QUESTIONS) {
    const raw = body?.prices?.[q.id];
    const n = raw === '' || raw == null ? NaN : Number(raw);
    if (!Number.isFinite(n) || n < 1 || n > 1000) {
      return { error: 'Enter a price between $1 and $1,000 for each price question.' };
    }
    prices[q.id] = Math.round(n * 100) / 100;
  }
  return { answers: { reasons, other, prices } };
}
