// src/pages/InterviewSession.jsx
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMediaStream, getStoredMediaStream, clearStoredMediaStream } from '../mediaStore';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

// Lovable / shadcn-ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, Clock, Mic, MicOff, SkipForward, CheckCircle2, Camera } from 'lucide-react';

export default function InterviewSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const { config = {} } = location.state || {};
  const isVideo = config.mode === 'video';

  // state
  const [stream, setStream] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [status, setStatus] = useState('');
  const [timeLimitReached, setTimeLimitReached] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [sessionId] = useState(() =>
    (globalThis.crypto?.randomUUID?.() || String(Date.now()))
  );


  // refs
  const videoRecorderRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const videoChunksRef = useRef([]);
  const audioChunksRef = useRef([]);
  const videoRef = useRef(null);
  const recordingTimerRef = useRef(null);

  // elapsed timer
  useEffect(() => {
    if (!isRecording) return;
    const id = setInterval(() => setElapsed(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  // session-wide elapsed timer (runs for the whole page/session)
  useEffect(() => {
    const id = setInterval(() => setSessionElapsed(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // QUESTIONS: Big-3 ordering + random (kept from your original)
  useEffect(() => {
    const fetchQuestions = async () => {
      if (config.questions && Array.isArray(config.questions)) {
        setQuestions(config.questions);
        return;
      }
      const snapshot = await getDocs(query(collection(db, 'questions'), where('mainTags', 'array-contains', config.profession)));
      const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      let big3 = [];
      if (config.big3) {
        big3 = all.filter(q => q.big3 === true).sort((a, b) => (a.big3Order || 0) - (b.big3Order || 0));
      }
      const big3Ids = new Set(big3.map(q => q.id));
      const remaining = all.filter(q => (config.big3 ? !big3Ids.has(q.id) : !q.big3));
      const numAllowed = Math.max((config.questionCount || 0) - big3.length, 0);
      const selected = [...remaining].sort(() => 0.5 - Math.random()).slice(0, numAllowed);

      setQuestions([...big3, ...selected].slice(0, config.questionCount));
    };
    fetchQuestions();
  }, [config]);

  // ======== PERSISTENT PREVIEW (VIDEO MODE) ========
  // On mount: reuse a stored live stream if available; otherwise request one.
  useEffect(() => {
    if (!isVideo) return; // audio-only: no preview box
    const existing = getStoredMediaStream();
    const attach = (s) => {
      setStream(s);
      if (videoRef.current) {
        const v = videoRef.current;
        v.srcObject = s;
        v.muted = true;
        v.playsInline = true;
        const tryPlay = () => v.play().catch(() => {});
        if (v.readyState >= 2) tryPlay(); else v.onloadedmetadata = tryPlay;
      }
    };

    if (existing && existing.getTracks().some(t => t.readyState === 'live')) {
      attach(existing);
    } else {
      (async () => {
        try {
          const s = await getMediaStream(); // your helper (camera+mic)
          attach(s);
        } catch (err) {
          console.error('Stream request error:', err);
          setStatus(err?.message || '⚠️ Unable to access microphone/camera.');
        }
      })();
    }

    // cleanup when unmounting page
    return () => {
      if (videoRef.current) videoRef.current.srcObject = null;
      // keep stream alive between questions/pages unless we’re leaving the app
      // (we won’t stop tracks here; your clear happens on app-level teardown)
    };
  }, [isVideo]);

    const hasAnswer = !!recordings[questionIndex] && !recordings[questionIndex].skipped;

  // SAFETY: if autoplay stalls, re-attach quickly
  useEffect(() => {
    const previewVisible = isVideo && (!hasAnswer || isRecording);

    if (!previewVisible) return;
    if (!stream || !videoRef.current) return;

    const v = videoRef.current;
    if (v.srcObject !== stream) v.srcObject = stream; 
    v.muted = true;
    v.playsInline = true;

    const play = () => v.play().catch(() => {});
    if (v.readyState >= 2) play(); else v.onloadedmetadata = play;
  }, [isVideo, stream, isRecording, hasAnswer, questionIndex]);

  // page-level cleanup (full teardown)
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
      if (videoRef.current) videoRef.current.srcObject = null;
      clearStoredMediaStream(); // mirror original cleanup
    };
  }, []);

  // ======== RECORDING ========
  const startRecording = async () => {
    try {
      setStatus('');
      setTimeLimitReached(false);

      // Ensure we have a stream (audio-only mode lazily requests mic)
      let s = stream;
      if (!s) {
        s = isVideo
          ? await getMediaStream()
          : await navigator.mediaDevices.getUserMedia({ audio: true });
        setStream(s);
        if (isVideo && videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play?.().catch(() => {});
        }
      }

      // VIDEO chunks (if video mode)
      const vChunks = [];
      const vRec = new MediaRecorder(s);
      vRec.ondataavailable = (e) => { if (e.data.size > 0) vChunks.push(e.data); };
      videoRecorderRef.current = vRec;
      videoChunksRef.current = vChunks;
      vRec.start();

      // AUDIO chunks
      const aTracks = s.getAudioTracks();
      const aStream = new MediaStream(aTracks);
      const aChunks = [];
      const aRec = new MediaRecorder(aStream);
      aRec.ondataavailable = (e) => { if (e.data.size > 0) aChunks.push(e.data); };
      audioRecorderRef.current = aRec;
      audioChunksRef.current = aChunks;
      aRec.start();

      // auto-stop after 3 minutes
      recordingTimerRef.current = setTimeout(() => {
        setTimeLimitReached(true);
        stopRecording();
      }, 3 * 60 * 1000);

      setElapsed(0);
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setStatus(err?.message || 'Unable to access microphone/camera.');
    }
  };

  const stopRecording = () => {
    if (!videoRecorderRef.current || !audioRecorderRef.current) return;

    return new Promise((resolve) => {
      let done = 0;
      const check = () => { done += 1; if (done === 2) resolve(); };
      videoRecorderRef.current.onstop = check;
      audioRecorderRef.current.onstop = check;
      videoRecorderRef.current.stop();
      audioRecorderRef.current.stop();
    }).then(() => {
      const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const videoUrl = isVideo ? URL.createObjectURL(videoBlob) : null;
      const audioUrl = URL.createObjectURL(audioBlob);

      const current = questions[questionIndex];
      setRecordings(prev => {
        const next = [...prev];
        next[questionIndex] = {
          question: current.text,
          tip: current.tip || '',
          videoBlob: isVideo ? videoBlob : null,
          videoUrl,
          audioBlob,
          audioUrl,
          mode: config.mode,
          skipped: false,
        };
        return next;
      });

      setIsRecording(false);

      // IMPORTANT: keep stream running in video mode so preview stays visible
      if (!isVideo) {
        // audio-only: stop mic now
        if (stream) {
          stream.getTracks().forEach(t => t.stop());
          setStream(null);
        }
      }

      // reset recorders
      videoRecorderRef.current = null;
      audioRecorderRef.current = null;
      if (recordingTimerRef.current) {
        clearTimeout(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    });
  };

  // NAV
  const handleNext = (recOverride) => {
    setTimeLimitReached(false);
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex(i => i + 1);
      return;
    }
    const finalRecs = recOverride ?? recordings;
    const serializable = finalRecs.map(r => ({
      question: r.question,
      tip: r.tip || '',
      skipped: !!r.skipped,
      mode: r.mode,
      videoUrl: r.videoUrl || null,
      audioUrl: r.audioUrl || null,
    }));
    navigate('../summary', { state: { recordings: serializable, profession: config.profession, totalSessionTime: sessionElapsed, sessionId,} });
  };

  const handleSkip = () => {
    const alreadyAnswered = !!recordings[questionIndex] && !recordings[questionIndex].skipped;
    if (alreadyAnswered) return; // no re-record/skip after answer

    const skipped = {
      question: questions[questionIndex].text,
      skipped: true,
      videoBlob: null,
      audioBlob: null,
      videoUrl: null,
      mode: config.mode,
      tip: questions[questionIndex].tip || '',
    };
    const next = [...recordings];
    next[questionIndex] = skipped;
    setRecordings(next);
    handleNext(next);
  };

  // Completed = recorded or explicitly skipped
  const completedCount = recordings.filter(
    r => !!r && (r.skipped || r.audioUrl || r.videoUrl)
  ).length;

  const pct = questions.length
    ? Math.round((completedCount / questions.length) * 100)
    : 0;

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </div>
        </header>
        <main className="container mx-auto px-4 py-10">
          <Card><CardContent className="p-6 text-center">Loading questions…</CardContent></Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="lg" onClick={() => navigate('../dashboard')} className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
            <Badge variant="outline">Question {questionIndex + 1} of {questions.length}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{String(Math.floor(sessionElapsed / 60))}:{String(sessionElapsed % 60).padStart(2, '0')}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">Session Progress</h2>
            <span className="text-sm text-muted-foreground">{pct}% Complete</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>

        {/* Question */}
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-xl">Question {questionIndex + 1}</CardTitle></CardHeader>
          <CardContent><p className="text-lg text-foreground leading-relaxed">{questions[questionIndex].text}</p></CardContent>
        </Card>

        {/* Media / Recording */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left: ALWAYS-ON Preview (video mode) + Playback section */}
              <div className="space-y-4">
                {isVideo && (!hasAnswer || isRecording) && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Camera Preview</p>
                    <div className="w-full rounded-lg border bg-black/5">
                      <div className="relative w-full" style={{ aspectRatio: config.videoAspectRatio || '16 / 9' }}>
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          playsInline
                          className="absolute inset-0 h-full w-full rounded object-cover"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {!isRecording && hasAnswer && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Your Answer</p>
                    {recordings[questionIndex].videoUrl ? (
                      <div className="relative w-full" style={{ aspectRatio: config.videoAspectRatio || '16 / 9' }}>
                        <video
                          controls
                          className="absolute inset-0 h-full w-full rounded object-cover"
                          src={recordings[questionIndex].videoUrl}
                          preload="metadata"
                          onLoadedMetadata={(e) => {
                            const v = e.currentTarget;
                            if (!isFinite(v.duration) || isNaN(v.duration)) return;
                            const snapBack = () => { v.removeEventListener('timeupdate', snapBack); v.currentTime = 0; };
                            v.currentTime = Number.MAX_SAFE_INTEGER;
                            v.addEventListener('timeupdate', snapBack);
                          }}
                        />
                      </div>
                    ) : (
                      <audio controls src={recordings[questionIndex].audioUrl} className="w-full rounded" />
                    )}
                  </div>
                )}
              </div>

              {/* Right: Controls */}
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                {status && <p className="text-sm text-red-600 font-medium">{status}</p>}

                {!isRecording && !hasAnswer && (
                  <>
                    <h3 className="text-lg font-medium">Ready to record your answer?</h3>
                    <p className="text-muted-foreground">Take your time to think, then click record when ready.</p>
                    <Button size="lg" className="w-24 h-24 rounded-full" onClick={startRecording}>
                      <Mic className="h-8 w-8" />
                    </Button>
                  </>
                )}

                {isRecording && (
                  <>
                    <h3 className="text-lg font-medium">Recording…</h3>
                    <div className="flex items-center gap-2 text-sm text-red-500">
                      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
                      <span>Live</span>
                    </div>
                    <Button size="lg" variant="destructive" className="w-24 h-24 rounded-full" onClick={stopRecording}>
                      <MicOff className="h-8 w-8" />
                    </Button>
                  </>
                )}

                {hasAnswer && !isRecording && (
                  <p className="text-lg text-muted-foreground">Answer saved. Continue to the next question when ready.</p>
                )}

                {timeLimitReached && (
                  <p className="text-lg text-red-600">3-minute limit reached. Your response was saved.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex flex-wrap justify-end gap-3">
          {/* Before recording: only Skip */}
          {!isRecording && !hasAnswer && (
            <Button variant="outline" onClick={handleSkip}>
              <SkipForward className="mr-2 h-4 w-4" /> Skip
            </Button>
          )}

          {/* After recording: only Next/Complete */}
          {!isRecording && hasAnswer && (
            <Button onClick={() => handleNext()}>
              {questionIndex === questions.length - 1 ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Complete Session
                </>
              ) : 'Next Question'}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
