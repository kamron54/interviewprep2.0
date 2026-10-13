import { toDate } from './access';

// What happened in a student's latest practice session, saved on their account as `lastSession`
// by the summary page. The admin Users table shows it, so a session that wasn't scored explains
// itself (Vercel's logs only last an hour).
// status: analyzing | scored | no-speech | failed | not-scored | skipped | usage-limit

// results: the summary page's analyzed answers; scored: how many of them got a score
export function sessionOutcome(results, scored) {
  const answered = results.filter((r) => !r.skipped && r.audioUrl);
  const noSpeech = answered.filter((r) => r.noSpeech).length;
  const errors = answered.filter((r) => r.error).length;
  let status = 'not-scored';
  if (scored > 0) status = 'scored';
  else if (!answered.length) status = 'skipped';
  else if (noSpeech === answered.length) status = 'no-speech';
  else if (errors === answered.length) status = 'failed';
  return { answers: answered.length, scored, noSpeech, errors, status };
}

const STILL_ANALYZING_MS = 15 * 60 * 1000;

// One line for the admin Users table: { text, problem } (problem = worth a closer look)
export function describeSession(s, now = Date.now()) {
  if (!s) return null;
  switch (s.status) {
    case 'scored':
      return { text: `${s.scored} of ${s.answers} answer${s.answers === 1 ? '' : 's'} scored`, problem: false };
    case 'analyzing': {
      const started = toDate(s.at)?.getTime() ?? 0;
      return now - started < STILL_ANALYZING_MS
        ? { text: 'Analyzing now', problem: false }
        : { text: 'Left before analysis finished', problem: true };
    }
    case 'no-speech':
      return { text: 'Not scored: no speech detected', problem: true };
    case 'failed':
      return { text: 'Not scored: analysis failed', problem: true };
    case 'not-scored':
      return { text: `Not scored: ${s.noSpeech} no speech, ${s.errors} failed`, problem: true };
    case 'skipped':
      return { text: 'Skipped every question', problem: false };
    case 'usage-limit':
      return { text: 'Stopped by the usage limit', problem: true };
    default:
      return null;
  }
}
