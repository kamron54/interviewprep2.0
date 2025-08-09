import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMediaStream } from '../mediaStore';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Button from '../components/Button';

function InterviewSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const config = location.state || {};
  const isVideo = config.mode === 'video';

  const [stream, setStream] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(true);
  const [count, setCount] = useState(5);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [status, setStatus] = useState('');
  const [showConfirmSkip, setShowConfirmSkip] = useState(false);

  const videoRecorderRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const videoChunksRef = useRef([]);
  const audioChunksRef = useRef([]);
  const videoRef = useRef(null); // ✅ for reliable preview

  const [timeLimitReached, setTimeLimitReached] = useState(false);
  const recordingTimerRef = useRef(null);

  const handleSkipClick = () => {
    // Consider it "has a recording" if this question already has a non-skipped entry
    const hasRecordingForThisQuestion =
      !!recordings[questionIndex] && recordings[questionIndex].skipped !== true;

    if (hasRecordingForThisQuestion) {
      setShowConfirmSkip(true);
    } else {
      // No recording yet — skip immediately (old behavior)
      handleSkip();
    }
  };

  const confirmDiscardAndSkip = () => {
    setShowConfirmSkip(false);
    handleSkip(); // this will overwrite the current slot with skipped
  };

  const cancelDiscard = () => {
    setShowConfirmSkip(false);
  };

// 🎥 Initialise stream on mount so preview works on Q1
useEffect(() => {
  const initStream = async () => {
    try {
      const newStream = isVideo
        ? await getMediaStream()
        : await navigator.mediaDevices.getUserMedia({ audio: true });

      setStream(newStream);
    } catch (err) {
      console.error('Stream init error:', err);
      setStatus(err.message || 'Could not access media.');
    }
  };

  if (!stream) {
    initStream();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // run only once on mount

  useEffect(() => {
    if (isCountingDown && count > 0) {
      const timer = setTimeout(() => setCount(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (count === 0 && isCountingDown) {
      startRecording();
      setIsCountingDown(false);
    }
  }, [count, isCountingDown]);

  useEffect(() => {
    const prepareStream = async () => {
      // run during countdown for both modes
      if (!isCountingDown) return;

      try {
        const newStream = isVideo
          ? await getMediaStream() // your helper (likely audio+video)
          : await navigator.mediaDevices.getUserMedia({ audio: true }); // audio-only

        setStream(newStream);
      } catch (err) {
        console.error('Stream error:', err);
        setStatus(err.message || 'Could not access media.');
      }
    };

    prepareStream();
  }, [isCountingDown, isVideo]);

  // ✅ Bind stream to videoRef when ready
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // ✅ Cleanup stream and preview
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  useEffect(() => {
  // ✅ Use custom questions if provided (Custom Mode)
  if (config.questions && Array.isArray(config.questions)) {
    setQuestions(config.questions);
    return;
  }

  const fetchQuestions = async () => {
    const snapshot = await getDocs(
      query(collection(db, 'questions'), where('mainTags', 'array-contains', config.profession))
    );

    const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    let big3Questions = [];

    if (config.big3) {
      big3Questions = all
        .filter(q => q.big3 === true)
        .sort((a, b) => (a.big3Order || 0) - (b.big3Order || 0));
    }

    const big3Ids = new Set(big3Questions.map(q => q.id));
    const remaining = all.filter(q =>
      config.big3 ? !big3Ids.has(q.id) : !q.big3
    );

    const numAllowed = Math.max(config.questionCount - big3Questions.length, 0);
    const shuffled = [...remaining].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numAllowed);

    const totalQuestions = [...big3Questions, ...selected].slice(0, config.questionCount);

    setQuestions(totalQuestions);
  };

  fetchQuestions();
}, [config]);


  const startRecording = () => {
    if (!stream) {
      setStatus('⚠️ Media not available.');
      return;
    }

    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    videoChunksRef.current = [];
    const videoRecorder = new MediaRecorder(stream);
    videoRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) videoChunksRef.current.push(e.data);
    };
    videoRecorderRef.current = videoRecorder;
    videoRecorder.start();

    const audioTracks = stream.getAudioTracks();
    const audioStream = new MediaStream(audioTracks);
    audioChunksRef.current = [];
    const audioRecorder = new MediaRecorder(audioStream);
    audioRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    audioRecorderRef.current = audioRecorder;
    audioRecorder.start();

    // ⏱ Auto-stop recording after 3 minutes
    recordingTimerRef.current = setTimeout(() => {
      setTimeLimitReached(true);
      stopRecording(); // Triggers the full save + transition logic
    }, 3 * 60 * 1000); // 3 minutes

    setIsRecording(true);
  };

  const stopRecording = () => {
    if (!videoRecorderRef.current || !audioRecorderRef.current) return;

    return new Promise((resolve) => {
      let completed = 0;
      const checkDone = () => {
        completed += 1;
        if (completed === 2) resolve();
      };

      videoRecorderRef.current.onstop = checkDone;
      audioRecorderRef.current.onstop = checkDone;

      videoRecorderRef.current.stop();
      audioRecorderRef.current.stop();
    }).then(() => {
      const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

      const videoUrl = URL.createObjectURL(videoBlob);
      const audioUrl = URL.createObjectURL(audioBlob);

      const currentQuestion = questions[questionIndex];

      setRecordings(prev => {
        const next = [...prev];
        next[questionIndex] = {
          question: currentQuestion.text,
          tip: currentQuestion.tip || '',
          videoBlob,
          videoUrl,
          audioBlob,
          audioUrl,
          mode: config.mode,
          skipped: false,
        };
        return next;
      });

      setIsRecording(false);

      // ✅ Stop stream and clear preview
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    });
  };

  const handleNext = (recOverride) => {
    setTimeLimitReached(false); // 🔁 clear the message
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((i) => i + 1);
      setCount(5);
      setIsCountingDown(true);
    } else {
      const finalRecs = recOverride ?? recordings; // use freshest array if provided
      const serializableRecordings = finalRecs.map((r) => ({
        question: r.question,
        tip: r.tip || '',
        skipped: !!r.skipped,
        mode: r.mode,
        // only pass URLs/strings – no Blobs/functions/refs
        videoUrl: r.videoUrl || null,
        audioUrl: r.audioUrl || null,
      }));
      navigate('/summary', {
        state: { recordings: serializableRecordings, profession: config.profession },
      });
    }
  };

  const handleSkip = () => {
    const skippedEntry = {
      question: questions[questionIndex].text,
      skipped: true,
      videoBlob: null,
      audioBlob: null,
      videoUrl: null,
      mode: config.mode,
      tip: questions[questionIndex].tip || '',
    };

    // Build the next array synchronously so we can pass it to handleNext
    const next = [...recordings];
    next[questionIndex] = skippedEntry;

    setRecordings(next);
    handleNext(next); // ensures summary sees the skipped state on the last question
  };

  const showPreview = isVideo && (isCountingDown || isRecording);

  if (!questions.length) return <p className="p-6 text-center">Loading questions...</p>;

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Mock Interview</h1>
        <p className="text-sm text-gray-600">Question {questionIndex + 1} of {questions.length}</p>
        {status && <p className="text-red-500 font-medium">{status}</p>}
      </div>

      <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm space-y-4">
        <p className="text-lg font-medium text-gray-800">{questions[questionIndex].text}</p>

        {recordings[questionIndex]?.videoUrl && (
          <div>
            <label className="block font-medium mb-1">Your Answer</label>
            <video controls className="w-full rounded-lg" src={recordings[questionIndex].videoUrl} />
          </div>
        )}
      </div>

      {showPreview && (
        <div>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full border rounded"
          />
        </div>
      )}

      {isCountingDown && (
        <p className="text-orange-600 text-lg font-bold text-center">
          Recording starts in: {count}
        </p>
      )}

      {timeLimitReached && (
        <p className="text-sm text-red-600 text-center">
          You reached the 3-minute time limit. Your response was automatically saved.
        </p>
      )}

      <div className="flex gap-4 flex-wrap justify-center">
        {!isRecording && (
          <Button type="secondary" onClick={handleSkipClick}>Skip</Button>
        )}

        {isRecording && (
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <p className="text-green-700 font-semibold">🔴 Recording...</p>
            <Button type="danger" onClick={stopRecording}>Stop Recording</Button>
          </div>
        )}

        {!isRecording && !isCountingDown && (
          <Button type="primary" onClick={() => handleNext()}>Next Question</Button>
        )}
      </div>
      {showConfirmSkip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={cancelDiscard}
            aria-hidden="true"
          />

          {/* Modal panel */}
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900">Discard this answer?</h2>
            <p className="mt-2 text-sm text-gray-600">
              You’ve already recorded an answer for this question. Skipping will discard it and mark this question as skipped.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="secondary" onClick={cancelDiscard}>Cancel</Button>
              <Button type="danger" onClick={confirmDiscardAndSkip}>
                Discard &amp; Skip
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewSession;
