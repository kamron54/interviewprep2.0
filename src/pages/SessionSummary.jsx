import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Icons
import {
  ChevronLeft,
  Award,
  BarChart3,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Download,
  FileText,
  Copy as CopyIcon,
  Video as VideoIcon,
} from 'lucide-react';

// --- heuristics to ignore clear hallucinations/noise ---
const hallucinatedPhrases = [
  "thank you for watching",
  "share this video",
  "subscribe",
  "like and subscribe",
  "I'm still here. I'm still here. I'm still here.",
  "Shh.",
  "Thank you so much for watching",
  "Thank you.",
  "follow me on",
  "Thank you",
];

function isMeaningfulTranscript(text) {
  if (!text || text.trim().length === 0) return false;
  const lower = text.trim().toLowerCase();
  return !hallucinatedPhrases.some((p) => lower.includes(p));
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
  const { profession: slug } = useParams();
  const base = slug ? `/${slug}` : '/dental';

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


  const [expandedTips, setExpandedTips] = useState({});
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [results, setResults] = useState([]);
  const [loadingIndex, setLoadingIndex] = useState(null);

  const progressPercent = useMemo(() => {
    if (!recordings.length) return 0;
    const idx = loadingIndex ?? 0;
    return Math.round((idx / recordings.length) * 100);
  }, [loadingIndex, recordings.length]);

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

const [improvement, setImprovement] = useState(0);

useEffect(() => {
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
    setImprovement(prevSessionAvg == null ? 0 : Math.round(overallAvg - prevSessionAvg));

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
}, [overallAvg, sessionId, results.length]);

  // Copy transcript helper
  const copyTranscript = async (text) => {
    try {
      await navigator.clipboard.writeText(text || '');
    } catch { /* noop */ }
  };

  // Process responses sequentially (keeps your current behavior)
  // Normal (live) processing path — skip entirely in read-only mode
  useEffect(() => {
    if (isReadonly) return;
    let cancelled = false;

    const processResponses = async () => {
      const all = [];

      for (let i = 0; i < recordings.length; i++) {
        if (cancelled) return;
        const item = recordings[i];

        if (item.skipped || !item.audioUrl) {
          all.push({ ...item, originalIndex: i, transcript: null, feedback: null });
          continue;
        }

        setLoadingIndex(i);

        try {
          // fetch blob from in-memory object URL
          const res = await fetch(item.audioUrl);
          const audioBlob = await res.blob();
          const transcriptResult = await transcribeAudio(audioBlob);

          if (transcriptResult.limitReached) {
            alert(
              transcriptResult.error ||
                "We’ve noticed unusually heavy usage on your account. To ensure fair access for all users, we’ve temporarily paused usage. If you believe this is a mistake, please contact support."
            );
            navigate(`${base}/dashboard`);
            return;
          }

          let transcript = transcriptResult.transcript || '';
          let feedback = null;

          if (isMeaningfulTranscript(transcript)) {
            feedback = await getFeedback(item.question, transcript, profession);
          } else {
            feedback = 'No meaningful response detected. Skipping feedback.';
            transcript = '';
          }

          all.push({ ...item, originalIndex: i, transcript, feedback });
        } catch (err) {
          console.error(`Error processing response ${i + 1}`, err);
          all.push({ ...item, originalIndex: i, transcript: 'Error', feedback: 'Error generating feedback' });
        }
      }

      if (cancelled) return;
      setResults(all);
      setLoadingIndex(null);
    };

    processResponses();
    return () => {
      cancelled = true;
    };
  }, [recordings, profession, base, navigate, isReadonly]);

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
       transcript: r.skipped ? '' : (r.transcript || ''),
       feedback: fb && !fb.legacyHtml ? {
         overallScore: fb.overallScore ?? 0,
         sectionScores: {
           overallImpression: fb.sectionScores?.overallImpression ?? 0,
           clarityStructure: fb.sectionScores?.clarityStructure ?? 0,
           content: fb.sectionScores?.content ?? 0,
         },
         summary: fb.summary || '',
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
     navigate(`${base}/dashboard`);
   } catch (e) {
     console.error(e);
     toast?.error?.("Failed to save session. Please try again.");
   }
 };


  return (
    <div className="min-h-screen bg-background">
      {/* Local page header (global Header is hidden on /summary) */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`${base}/dashboard`)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
            <Badge variant="outline">Practice Session Complete</Badge>
          </div>
          <div className="flex items-center gap-2">
            {results.length > 0 && !isReadonly && (
              <AlertDialog open={saveOpen} onOpenChange={setSaveOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" /> Save Session
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
            <Button onClick={() => navigate(`${base}/setup`)}>Start New Session</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Overview */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Award className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Session Complete!</CardTitle>
            <p className="text-muted-foreground">Here's your detailed feedback and performance analysis</p>
          </CardHeader>

            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-foreground mb-2">
                {overallAvg}%
              </div>
              <p className="text-muted-foreground">Overall Score</p>
              <Progress value={overallAvg} className="mt-4 h-3" />
            </div>

          <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Time */}
            <div className="text-center p-4 bg-card rounded-lg border">
              <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-xl font-semibold">{totalTimeFormatted}</div>
              <div className="text-sm text-muted-foreground">Total Time</div>
            </div>

            {/* Answered Questions */}
            <div className="text-center p-4 bg-card rounded-lg border">
              <BarChart3 className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-xl font-semibold">{questionsCount}</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>

            {/* Improvement */}
            <div className="text-center p-4 bg-card rounded-lg border">
              <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-xl font-semibold">+{improvement}%</div>
              <div className="text-sm text-muted-foreground">Improvement</div>
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Loading state while transcribing/analyzing */}
        {results.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{isReadonly ? 'Loading saved session…' : 'Transcribing and analyzing your responses…'}</span>
                </div>
                {!isReadonly && <span className="text-sm text-muted-foreground">{progressPercent}%</span>}
              </div>
              {!isReadonly && <Progress value={progressPercent} className="h-2" />}
              {loadingIndex !== null && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Processing response {loadingIndex + 1} of {recordings.length}
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          // Question-by-question results
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orderedResults.map((item) => (
             <Card key={item.originalIndex ?? item.question} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                     Question {(item.originalIndex ?? 0) + 1}
                    </CardTitle>
                    {(() => {
  const fb = normalizeFeedback(item.feedback);
  if (item.skipped) return <Badge variant="destructive">Skipped</Badge>;
  if (!fb) return <Badge variant="secondary">No score</Badge>;
  if (fb.legacyHtml) return <Badge variant="secondary">Feedback</Badge>;
  const s = Math.round(fb.overallScore || 0);
  const variant = s >= 80 ? 'default' : s >= 70 ? 'secondary' : 'destructive';
  return <Badge variant={variant}>{s}%</Badge>;
})()}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.question}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Media */}
                  {!isReadonly && !item.skipped && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <VideoIcon className="h-4 w-4" /> Your Response
                      </p>
                      {item.videoUrl ? (
                        <div className="relative w-full rounded-lg border bg-black/5" style={{ aspectRatio: '16 / 9' }}>
                          <video
                            controls
                            className="absolute inset-0 h-full w-full rounded object-cover"
                            src={item.videoUrl}
                            preload="metadata"
                            onLoadedMetadata={(e) => {
                              const v = e.currentTarget;
                              if (!isFinite(v.duration) || isNaN(v.duration)) {
                                v.currentTime = Number.MAX_SAFE_INTEGER;
                                const snapBack = () => { v.removeEventListener('timeupdate', snapBack); v.currentTime = 0; };
                                v.addEventListener('timeupdate', snapBack);
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <audio controls src={item.audioUrl} className="w-full rounded" />
                      )}
                    </div>
                  )}

                  {/* Tip toggle */}
                  {item.tip && (
                    <div className="bg-card/50 border rounded-lg p-3">
                      <button
                        onClick={() =>
                          setExpandedTips((prev) => ({
                            ...prev,
                            [item.originalIndex]: !prev[item.originalIndex],
                          }))
                        }
                        className="text-sm text-primary underline"
                      >
                        {expandedTips[item.originalIndex] ? 'Hide Tip' : 'Show Tip'}
                      </button>
                      {expandedTips[item.originalIndex] && (
                        <p className="mt-2 text-sm italic text-muted-foreground">{item.tip}</p>
                      )}
                    </div>
                  )}

                  {/* Transcript & Feedback */}
                  {!item.skipped && (
                    <div className="space-y-3">
                      <div className="rounded-lg border bg-gray-50 p-3">
                        <p className="font-medium text-sm flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4" /> Transcript
                        </p>
                        <p className="text-sm whitespace-pre-wrap text-foreground/90">{item.transcript}</p>
                        {!!item.transcript && (
                          <div className="mt-2">
                            <Button variant="outline" size="sm" onClick={() => copyTranscript(item.transcript)}>
                              <CopyIcon className="h-4 w-4 mr-2" /> Copy transcript
                            </Button>
                          </div>
                        )}
                      </div>

                      {(() => {
  const fb = normalizeFeedback(item.feedback);
  if (!fb) return null;

  if (fb.legacyHtml) {
    return (
      <div className="rounded-lg border bg-yellow-50 p-3">
        <p className="font-medium text-sm mb-1">Feedback</p>
        <div className="text-sm text-foreground/90 whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: fb.legacyHtml }}
        />
      </div>
    );
  }

  const sections = [
    ['Overall Impression', fb.sectionScores?.overallImpression],
    ['Clarity & Structure', fb.sectionScores?.clarityStructure],
    ['Content', fb.sectionScores?.content],
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-card p-3">
        <p className="font-medium text-sm mb-2">Section Scores</p>
        {sections.map(([label, val]) => (
          <div key={label} className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">{label}</span>
              <span className="text-foreground">{Math.round(val ?? 0)}%</span>
            </div>
            <Progress value={Math.round(val ?? 0)} className="h-2" />
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-yellow-50 p-3">
        <p className="font-medium text-sm mb-1">Feedback Summary</p>
        <p className="text-sm text-foreground/90 whitespace-pre-wrap">{fb.summary}</p>
        {Array.isArray(fb.suggestions) && fb.suggestions.length > 0 && (
          <ul className="mt-2 list-disc list-inside text-sm text-foreground/90">
            {fb.suggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
})()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
