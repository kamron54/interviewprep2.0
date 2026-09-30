import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { doc, runTransaction, arrayUnion, collection, addDoc } from 'firebase/firestore';

// Existing app utilities
import { transcribeAudio, getFeedback } from '../ai/aiService';

// shadcn/ui (already used elsewhere in your app)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { toast } from "sonner"; // or your toast of choice
import usePageTitle from '../lib/usePageTitle';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from '@/lib/utils';
import FeedbackDetails, { ScoreBadge } from '../components/FeedbackDetails';

// Icons
import {
  ChevronDown,
  ChevronLeft,
  AlertCircle,
  Bookmark,
  FileText,
  Lightbulb,
  Loader2,
  MicOff,
  Copy as CopyIcon,
} from 'lucide-react';

// --- heuristics to ignore clear hallucinations/noise ---
// Whisper sometimes "hears" these phrases in silence. Longest first, so
// "thank you for watching" is removed before "thank you".
const hallucinatedPhrases = [
  "thank you so much for watching",
  "thank you for watching",
  "thanks for watching",
  "like and subscribe",
  "share this video",
  "follow me on",
  "i'm still here",
  "thank you",
  "subscribe",
  "shh",
];

// Only reject a transcript that is essentially nothing but those phrases —
// real answers often start with "Thank you for the question…".
function isMeaningfulTranscript(text) {
  let rest = (text || '').toLowerCase().replace(/’/g, "'").replace(/[^a-z'\s]/g, ' ');
  for (const p of hallucinatedPhrases) rest = rest.split(p).join(' ');
  return rest.split(/\s+/).filter(Boolean).length >= 3;
}

// Checklists for students reviewing their own recording, collapsed under the player by default
const SELF_REVIEW = {
  video: {
    title: 'What to watch for',
    items: [
      ['Eye contact', 'are you looking at the camera, like it’s the interviewer?'],
      ['Pace', 'steady, with natural pauses instead of rushing?'],
      ['Filler words', 'how often do “um,” “like,” and “you know” show up?'],
      ['Body language', 'upright posture, calm hands, a natural smile?'],
      ['Energy', 'do you sound genuinely interested in what you’re saying?'],
    ],
  },
  audio: {
    title: 'What to listen for',
    items: [
      ['Pace', 'steady, with natural pauses instead of rushing?'],
      ['Filler words', 'how often do “um,” “like,” and “you know” show up?'],
      ['Tone and energy', 'do you sound warm and genuinely interested?'],
      ['Clarity', 'are your main points easy to follow?'],
    ],
  },
};

// Runs fn over items with at most `limit` in flight, keeping results in order
async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

// --- scoring helpers -------------------------------------------------------
const clamp01 = (n) => Math.max(0, Math.min(100, Number.isFinite(+n) ? +n : 0));

/**
 * Accepts:
 *  - structured object from API ({ overallScore, sectionScores, summary, suggestions })
 *  - JSON string
 *  - legacy HTML/string (fallback)
 * Returns either a normalized object OR { legacyHtml: string }
 */
function normalizeFeedback(raw) {
  if (!raw) return null;

  if (typeof raw === 'object') {
    return {
      overallScore: clamp01(raw.overallScore),
      sectionScores: {
        overallImpression: clamp01(raw.sectionScores?.overallImpression),
        clarityStructure: clamp01(raw.sectionScores?.clarityStructure),
        content: clamp01(raw.sectionScores?.content),
      },
      summary: raw.summary || '',
      strengths: Array.isArray(raw.strengths) ? raw.strengths : [],
      suggestions: Array.isArray(raw.suggestions) ? raw.suggestions : [],
      rubricVersion: raw.rubricVersion || 'v1',
    };
  }

  if (typeof raw === 'string') {
    const match = raw.match(/\{[\s\S]*\}$/);
    if (match) {
      try {
        return normalizeFeedback(JSON.parse(match[0]));
      } catch { /* fall back */ }
    }
    return { legacyHtml: raw };
  }

  return null;
}

export default function SessionSummary() {
  usePageTitle('Session Summary');

  const location = useLocation();
  const navigate = useNavigate();
  const sessionData = location.state || {};
  const { recordings = [], profession } = sessionData;
  const isReadonly = !!sessionData.readonly && !!sessionData.savedSession;
  const saved = isReadonly ? sessionData.savedSession : null;
  const totalSessionTime = isReadonly ? (saved?.totalSessionTime ?? 0) : (sessionData.totalSessionTime ?? 0);
  const sessionId = sessionData?.sessionId || null;
  const totalTimeFormatted = useMemo(() => {
    const mins = Math.floor(totalSessionTime / 60);
    const secs = totalSessionTime % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, [totalSessionTime]);


  const [saveOpen, setSaveOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [results, setResults] = useState([]);
  // Recorded answers that have finished transcription + feedback (they're analyzed in parallel)
  const [doneCount, setDoneCount] = useState(0);
  const answersToAnalyze = useMemo(() => recordings.filter((r) => !r.skipped && r.audioUrl).length, [recordings]);
  const progressPercent = answersToAnalyze ? Math.round((doneCount / answersToAnalyze) * 100) : 0;

  const answeredCount = useMemo(() => results.filter((r) => !r?.skipped && (r?.audioUrl || r?.videoUrl)).length, [results]);
  const skippedCount = useMemo(() => results.filter((r) => r?.skipped).length, [results]);
  const completionPct = useMemo(() => (recordings.length ? Math.round((answeredCount / recordings.length) * 100) : 0), [answeredCount, recordings.length]);
  const answeredQuestionsCount = useMemo(
  () => recordings.filter(r => r && !r.skipped).length,
  [recordings]
);
const questionsCount = useMemo(
  () => isReadonly ? (saved?.counts?.totalQuestions ?? saved?.items?.length ?? 0) : answeredQuestionsCount,
  [isReadonly, saved, answeredQuestionsCount]
);
const scoredItems = useMemo(() => {
  return results
    .filter(r => !r?.skipped && r?.feedback)
    .map(r => ({ ...r, feedback: normalizeFeedback(r.feedback) }))
    .filter(r => r.feedback && Number.isFinite(+r.feedback.overallScore));
}, [results]);

const overallAvg = useMemo(() => {
  if (!scoredItems.length) return 0;
  const sum = scoredItems.reduce((acc, r) => acc + (+r.feedback.overallScore || 0), 0);
  return Math.round(sum / scoredItems.length);
}, [scoredItems]);

// undefined = not computed yet (or viewing a saved session); null = no previous session to compare against
const [improvement, setImprovement] = useState(undefined);
const isProcessing = !isReadonly && results.length === 0;
const hasScore = scoredItems.length > 0;

useEffect(() => {
  // Saved sessions are read-only: no stats writes, no comparison with the latest session
  if (isReadonly) return;
  // Only run after we've processed the whole session
  if (results.length === 0) return;                 // wait for processing to finish
  if (!Number.isFinite(overallAvg)) return;
  if (!scoredItems.length) return; // nothing scored → don't write stats

  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const userRef = doc(db, 'users', uid);

  runTransaction(db, async (tx) => {
    const snap = await tx.get(userRef);
    const data = snap.exists() ? snap.data() : {};

    // Improvement = current - previous session avg
    const prevSessionAvg = Number.isFinite(data.lastAverageScore) ? data.lastAverageScore : null;
    setImprovement(prevSessionAvg == null ? null : Math.round(overallAvg - prevSessionAvg));

    // If we don't have a sessionId, don't write aggregates (prevents double counts on refresh/deeplink)
    if (!sessionId) {
      return; 
    }

    // Idempotency guard
    if (sessionId && Array.isArray(data.processedSessionIds) && data.processedSessionIds.includes(sessionId)) {
      return;
    }

    const prevCount = Number.isFinite(data.sessionsCompleted) ? data.sessionsCompleted : 0;
    const newCount = prevCount + 1;

    const prevRolling = Number.isFinite(data.rollingAverageScore) ? data.rollingAverageScore : null;
    const newRolling = prevRolling == null ? overallAvg : ((prevRolling * prevCount) + overallAvg) / newCount;

    tx.update(userRef, {
      sessionsCompleted: newCount,
      lastAverageScore: overallAvg,
      rollingAverageScore: newRolling,
      ...(sessionId ? { processedSessionIds: arrayUnion(sessionId) } : {}),
    });
  }).catch(console.error);
}, [overallAvg, sessionId, results.length, isReadonly]);

  // Copy transcript helper
  const copyTranscript = async (text) => {
    try {
      await navigator.clipboard.writeText(text || '');
      toast.success('Transcript copied');
    } catch { /* noop */ }
  };

  // Opened directly or refreshed: recordings only live in memory, so there's nothing to show
  useEffect(() => {
    if (!isReadonly && recordings.length === 0) navigate('/dashboard', { replace: true });
  }, [isReadonly, recordings.length, navigate]);

  // Analyze all answers at once (up to 5 in flight) instead of one after another
  // Normal (live) processing path — skip entirely in read-only mode
  useEffect(() => {
    if (isReadonly) return;
    let cancelled = false;

    const analyzeAnswer = async (item, i) => {
      if (item.skipped || !item.audioUrl) {
        return { ...item, originalIndex: i, transcript: null, feedback: null };
      }

      try {
        // fetch blob from in-memory object URL
        const res = await fetch(item.audioUrl);
        const audioBlob = await res.blob();
        const transcriptResult = await transcribeAudio(audioBlob);

        if (transcriptResult.limitReached) {
          return { limitReached: true, limitError: transcriptResult.error };
        }

        const transcript = transcriptResult.transcript || '';

        if (isMeaningfulTranscript(transcript)) {
          const feedback = await getFeedback(item.question, transcript, profession);
          return { ...item, originalIndex: i, transcript, feedback };
        }
        return { ...item, originalIndex: i, transcript: '', feedback: null, noSpeech: true };
      } catch (err) {
        console.error(`Error processing response ${i + 1}`, err);
        return { ...item, originalIndex: i, transcript: '', feedback: null, error: true };
      } finally {
        if (!cancelled) setDoneCount((n) => n + 1);
      }
    };

    const processResponses = async () => {
      const all = await mapWithConcurrency(recordings, 5, analyzeAnswer);
      if (cancelled) return;

      const limited = all.find((r) => r.limitReached);
      if (limited) {
        toast.error(
          limited.limitError ||
            "We’ve noticed unusually heavy usage on your account. To ensure fair access for all users, we’ve temporarily paused usage. If you believe this is a mistake, please contact support.",
          { duration: 10000 }
        );
        navigate('/dashboard');
        return;
      }

      setResults(all);
    };

    processResponses();
    return () => {
      cancelled = true;
    };
  }, [recordings, profession, navigate, isReadonly]);

  // Read-only hydration: convert saved items to the shape used by the UI
  useEffect(() => {
    if (!isReadonly) return;
    if (!saved?.items?.length) {
      setResults([]);
      return;
    }
    const items = saved.items.map((it, idx) => ({
      originalIndex: idx,
      question: it.question,
      tip: it.tip,
      skipped: !!it.skipped,
      noSpeech: !!it.noSpeech,
      error: !!it.error,
      transcript: it.transcript || '',
      feedback: it.feedback || null,
      // no audioUrl/videoUrl in saved sessions (intentionally)
    }));
    setResults(items);
  }, [isReadonly, saved]);

  const orderedResults = useMemo(() => {
  return [...results].sort((a, b) => {
    if (a.skipped && !b.skipped) return 1;   // push a down
    if (!a.skipped && b.skipped) return -1;  // keep a up
    return 0; // preserve order otherwise
  });
}, [results]);

 // Create a compact, media-free payload to store
 const serializeForSave = () => {
   const items = orderedResults.map((r) => {
     const fb = normalizeFeedback(r.feedback);
     return {
       question: r.question,
       tip: r.tip || '',
       skipped: !!r.skipped,
       ...(r.noSpeech ? { noSpeech: true } : {}),
       ...(r.error ? { error: true } : {}),
       transcript: r.skipped ? '' : (r.transcript || ''),
       feedback: fb && !fb.legacyHtml ? {
         overallScore: fb.overallScore ?? 0,
         sectionScores: {
           overallImpression: fb.sectionScores?.overallImpression ?? 0,
           clarityStructure: fb.sectionScores?.clarityStructure ?? 0,
           content: fb.sectionScores?.content ?? 0,
         },
         summary: fb.summary || '',
         strengths: Array.isArray(fb.strengths) ? fb.strengths : [],
         suggestions: Array.isArray(fb.suggestions) ? fb.suggestions : [],
         rubricVersion: fb.rubricVersion || 'v1',
       } : null,
     };
   });
   return {
     title: saveTitle?.trim() || `Session ${new Date().toLocaleString()}`,
     profession: profession || 'General',
     createdAt: Date.now(),
     overallAvg,
     totalSessionTime,
     counts: {
       totalQuestions: recordings.length,
       answered: answeredQuestionsCount,
       skipped: skippedCount,
     },
     items,
   };
 };

   const handleSaveSession = async () => {
   const uid = auth.currentUser?.uid;
   if (!uid) {
     toast?.error?.("You must be signed in to save a session.");
     return;
   }
   try {
     const payload = serializeForSave();
     const colRef = collection(doc(db, 'users', uid), 'sessions');
     await addDoc(colRef, payload);
     setSaveOpen(false);
     toast?.success?.("Session saved to your dashboard.");
     navigate('/dashboard');
   } catch (e) {
     console.error(e);
     toast?.error?.("Failed to save session. Please try again.");
   }
 };

  // Live video sessions put each recording beside its feedback, so they get a wider page;
  // text-only views (saved sessions, audio-only) stay at a comfortable reading width
  const pageWidth = !isReadonly && recordings.some((r) => r.videoUrl) ? 'max-w-6xl' : 'max-w-3xl';

  // Change in overall score vs. the previous session (scores are out of 100)
  const improvementText =
    improvement === null ? 'First scored session'
    : improvement == null ? null
    : improvement === 0 ? 'Same as last session'
    : `${improvement > 0 ? '+' : '−'}${Math.abs(improvement)} from last session`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Local page header (global Header is hidden on /summary) */}
      <header className="border-b border-border bg-card">
        <div className={cn('mx-auto flex flex-wrap items-center justify-between gap-2 px-4 py-3', pageWidth)}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="-ml-3 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> Dashboard
          </Button>
          <div className="flex items-center gap-2">
            {results.length > 0 && !isReadonly && (
              <AlertDialog open={saveOpen} onOpenChange={setSaveOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">
                    <Bookmark className="h-4 w-4" /> Save session
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Save this session to your dashboard?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will save your scores, transcripts, tips, and feedback.
                      <br />
                      <span className="font-medium">Recordings (audio/video) are not saved</span> to conserve storage.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      placeholder="e.g., Behavioral practice — Sept 12"
                      value={saveTitle}
                      onChange={(e) => setSaveTitle(e.target.value)}
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSaveSession}>
                      Save
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button onClick={() => navigate('/setup')}>Start new session</Button>
          </div>
        </div>
      </header>

      <div className={cn('mx-auto px-4 py-8', pageWidth)}>
        {/* Summary strip */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              {isReadonly ? (saved?.title || 'Saved session') : 'Session complete'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {[
                `${questionsCount} question${questionsCount === 1 ? '' : 's'}`,
                totalTimeFormatted,
                improvementText,
              ].filter(Boolean).join(' · ')}
            </p>
          </div>
          {!isProcessing && results.length > 0 && (
            hasScore ? (
              <div className="text-right">
                <div className="text-3xl font-semibold tracking-tight text-gray-900">{overallAvg}%</div>
                <p className="text-xs text-muted-foreground">Overall</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No answers were scored</p>
            )
          )}
        </div>

        {/* The one loading indicator, while answers are transcribed and scored */}
        {isProcessing && (
          <div className="mt-6 rounded-xl border bg-white p-4">
            <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Analyzing your answers…
              </span>
              <span>{doneCount} of {answersToAnalyze}</span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        )}
        {isReadonly && results.length === 0 && (
          <p className="mt-6 text-sm text-muted-foreground">Loading saved session…</p>
        )}

        {/* One answer per row, feedback first */}
        {results.length > 0 && (
          <div className="mt-6 space-y-4">
            {orderedResults.map((item) => (
              <AnswerCard
                key={item.originalIndex ?? item.question}
                item={item}
                isReadonly={isReadonly}
                onCopyTranscript={copyTranscript}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Badge in an answer's header: its score, or why it has none
function AnswerStatus({ item, feedback }) {
  if (item.noSpeech) return <Badge variant="secondary">No answer detected</Badge>;
  if (!feedback) return <Badge variant="secondary">Not scored</Badge>;
  if (feedback.legacyHtml) return <Badge variant="secondary">Feedback</Badge>;
  return <ScoreBadge score={feedback.overallScore} />;
}

// Plays back a recording from this session (recordings aren't saved, so only live sessions have them)
function RecordingPlayer({ item }) {
  if (!item.videoUrl) {
    return <audio controls src={item.audioUrl} className="w-full" />;
  }
  return (
    <div className="relative w-full overflow-hidden rounded-lg border bg-black/5" style={{ aspectRatio: '16 / 9' }}>
      <video
        controls
        className="absolute inset-0 h-full w-full object-cover"
        src={item.videoUrl}
        preload="metadata"
        onLoadedMetadata={(e) => {
          // Recorded webm files report no duration until seeked to the end once
          const v = e.currentTarget;
          if (!isFinite(v.duration) || isNaN(v.duration)) {
            v.currentTime = Number.MAX_SAFE_INTEGER;
            const snapBack = () => { v.removeEventListener('timeupdate', snapBack); v.currentTime = 0; };
            v.addEventListener('timeupdate', snapBack);
          }
        }}
      />
    </div>
  );
}

// Collapsed checklist under the player, for students who want guidance reviewing themselves
function SelfReviewGuide({ kind }) {
  const [open, setOpen] = useState(false);
  const guide = SELF_REVIEW[kind];
  return (
    <div className="mt-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        {guide.title}
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
          {guide.items.map(([label, question]) => (
            <li key={label}><span className="font-medium text-gray-900">{label}:</span> {question}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// One answer: the question, the recording beside its feedback (live sessions), then transcript / tip toggles
function AnswerCard({ item, isReadonly, onCopyTranscript }) {
  const [panel, setPanel] = useState(null); // 'transcript' | 'tip' | null
  const feedback = normalizeFeedback(item.feedback);
  // Recordings only exist right after a session; saved sessions never have them
  const hasVideo = !isReadonly && !!item.videoUrl;
  const hasAudioOnly = !isReadonly && !item.videoUrl && !!item.audioUrl;

  const questionHeader = (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Question {(item.originalIndex ?? 0) + 1}
      </p>
      <h2 className="mt-1 text-base font-semibold text-gray-900">{item.question}</h2>
    </div>
  );

  if (item.skipped) {
    return (
      <Card className="flex items-start justify-between gap-4 p-5 sm:p-6">
        {questionHeader}
        <div className="shrink-0"><Badge variant="secondary">Skipped</Badge></div>
      </Card>
    );
  }

  const toggles = [
    item.transcript && { key: 'transcript', label: 'Transcript', Icon: FileText },
    item.tip && { key: 'tip', label: 'Interview tip', Icon: Lightbulb },
  ].filter(Boolean);

  const feedbackBlock = item.noSpeech || item.error ? (
    <div className="flex gap-3 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
      {item.noSpeech
        ? <MicOff className="mt-0.5 h-4 w-4 shrink-0" />
        : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
      <p>
        {item.noSpeech
          ? 'We couldn’t hear an answer in this recording. Check that your microphone is working and try this question again in your next session.'
          : 'Something went wrong while analyzing this answer, so it wasn’t scored. Your other answers weren’t affected.'}
      </p>
    </div>
  ) : feedback?.legacyHtml ? (
    <div
      className="whitespace-pre-wrap text-sm text-gray-700"
      dangerouslySetInnerHTML={{ __html: feedback.legacyHtml }}
    />
  ) : feedback ? (
    <FeedbackDetails feedback={feedback} />
  ) : null;

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        {questionHeader}
        {/* shrink-0 keeps badges on one line; the question wraps instead */}
        <div className="shrink-0"><AnswerStatus item={item} feedback={feedback} /></div>
      </div>

      {hasVideo ? (
        // Watching yourself back is the main event: video on the left, feedback beside it
        <div className="mt-4 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <RecordingPlayer item={item} />
            <SelfReviewGuide kind="video" />
          </div>
          <div className="lg:col-span-2">{feedbackBlock}</div>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {hasAudioOnly && (
            <div>
              <RecordingPlayer item={item} />
              <SelfReviewGuide kind="audio" />
            </div>
          )}
          {feedbackBlock}
        </div>
      )}

      {toggles.length > 0 && (
        <div className="mt-5 border-t pt-3">
          <div className="-mx-2 flex flex-wrap gap-1">
            {toggles.map(({ key, label, Icon }) => (
              <Button
                key={key}
                type="button"
                variant="ghost"
                size="sm"
                aria-expanded={panel === key}
                onClick={() => setPanel(panel === key ? null : key)}
                className={cn('text-muted-foreground', panel === key && 'bg-muted text-foreground')}
              >
                <Icon className="h-4 w-4" />
                {label}
                <ChevronDown className={cn('h-4 w-4 transition-transform', panel === key && 'rotate-180')} />
              </Button>
            ))}
          </div>
          {panel === 'transcript' && (
            <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm text-gray-700">
              <p className="whitespace-pre-wrap">{item.transcript}</p>
              <Button variant="outline" size="sm" className="mt-3 bg-white" onClick={() => onCopyTranscript(item.transcript)}>
                <CopyIcon className="h-4 w-4" /> Copy transcript
              </Button>
            </div>
          )}
          {panel === 'tip' && (
            <p className="mt-3 rounded-lg bg-teal-50 p-3 text-sm text-teal-900">{item.tip}</p>
          )}
        </div>
      )}
    </Card>
  );
}
