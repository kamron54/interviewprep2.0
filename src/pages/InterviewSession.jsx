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

  const videoRecorderRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const videoChunksRef = useRef([]);
  const audioChunksRef = useRef([]);
  const videoRef = useRef(null); // ✅ for reliable preview

  const [timeLimitReached, setTimeLimitReached] = useState(false);
  const recordingTimerRef = useRef(null);


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
      if (!isVideo || !isCountingDown) return;

      try {
        const newStream = await getMediaStream();
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
  }, [stream, videoRef.current]);

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

      const currentQuestion = questions[questionIndex];

      setRecordings((prev) => [
        ...prev,
        {
          question: questions[questionIndex].text,
          tip: currentQuestion.tip || '',
          videoBlob,
          videoUrl,
          audioBlob,
          mode: config.mode,
        },
      ]);

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

  const handleNext = () => {
    setTimeLimitReached(false); // 🔁 clear the message
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((i) => i + 1);
      setCount(5);
      setIsCountingDown(true);
    } else {
      navigate('/summary', { state: { recordings, profession: config.profession } });
    }
  };

  const handleSkip = () => {
    setRecordings((prev) => [
      ...prev,
      {
        question: questions[questionIndex].text,
        skipped: true,
        videoBlob: null,
        audioBlob: null,
        mode: config.mode,
      },
    ]);
    handleNext();
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
          <Button type="secondary" onClick={handleSkip}>Skip</Button>
        )}

        {isRecording && (
          <>
            <p className="text-green-700 font-semibold">🔴 Recording...</p>
            <Button type="danger" onClick={stopRecording}>Stop Recording</Button>
          </>
        )}

        {!isRecording && !isCountingDown && (
          <Button type="primary" onClick={handleNext}>Next Question</Button>
        )}
      </div>
    </div>
  );
}

export default InterviewSession;
