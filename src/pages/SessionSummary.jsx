import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { transcribeAudio, getFeedback } from '../ai/aiService';
import { exportInterviewSession } from '../utils/exportZip';
import Button from '../components/Button';

const hallucinatedPhrases = [
  "thank you for watching",
  "share this video",
  "subscribe",
  "like and subscribe",
  "I'm still here. I'm still here. I'm still here.",
  "Shh.",
  "Thank you so much for watching",
  "follow me on",
];

function isMeaningfulTranscript(text) {
  if (!text || text.trim().length === 0) return false;
  const lower = text.trim().toLowerCase();
  return !hallucinatedPhrases.some(phrase => lower.includes(phrase));
}

function SessionSummary() {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionData = location.state || {};
  const { recordings = [], profession } = sessionData;

  const [results, setResults] = useState([]);
  const [loadingIndex, setLoadingIndex] = useState(null);

  useEffect(() => {
    const processResponses = async () => {
      const all = [];

      for (let i = 0; i < recordings.length; i++) {
        const item = recordings[i];

        if (item.skipped || !item.audioBlob) {
          all.push({ ...item, transcript: null, feedback: null });
          continue;
        }

        setLoadingIndex(i);

        try {
          const result = await transcribeAudio(item.audioBlob);

          if (result.limitReached) {
            alert(result.error || "You've reached your usage limit.");
            navigate('/dashboard'); // Or wherever you want to send them
            return;
          }

          const transcript = result.transcript;

          let feedback = null;

          let finalTranscript = transcript;

if (isMeaningfulTranscript(transcript)) {
  feedback = await getFeedback(item.question, transcript, profession);
} else {
  feedback = 'No meaningful response detected. Skipping feedback.';
  finalTranscript = ''; // clear the transcript for display
}

all.push({ ...item, transcript: finalTranscript, feedback });
        } catch (err) {
          console.error(`Error processing response ${i + 1}`, err);
          all.push({ ...item, transcript: 'Error', feedback: 'Error generating feedback' });
        }
      }

      setResults(all);
      setLoadingIndex(null);
    };

    processResponses();
  }, [recordings]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Session Summary</h1>

      {results.length > 0 && (
        <div className="space-y-4">
          <Button type="primary" onClick={() => exportInterviewSession(results)}>
            Download ZIP
          </Button>

          <div className="flex gap-4 flex-wrap">
            <Button type="warning" onClick={() => navigate('/setup')}>
              Restart Interview
            </Button>
            <Button type="secondary" onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      )}

      {results.length === 0 ? (
        <p className="text-gray-500">Processing your interview responses...</p>
      ) : (
        results.map((item, idx) => (
          <div
            key={idx}
            className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm space-y-4"
          >
            <p className="font-medium text-gray-800">Question {idx + 1}:</p>
            <p className="text-lg text-gray-900">{item.question}</p>
            {item.tip && (
              <p className="text-sm text-blue-700 italic mt-1">Tip: {item.tip}</p>
            )}

            {item.skipped ? (
              <p className="italic text-gray-500">Skipped</p>
            ) : (
              <>
                {item.videoUrl ? (
                  <video controls src={item.videoUrl} className="w-full rounded" />
                ) : (
                  <audio controls src={item.audioUrl} className="w-full rounded" />
                )}

                {loadingIndex === idx ? (
                  <p className="text-blue-500">Transcribing and analyzing...</p>
                ) : (
                  <>
                    <div className="bg-gray-50 p-4 rounded border border-gray-200">
                      <p className="font-semibold mb-1 text-gray-700">Transcript:</p>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">
                        {item.transcript}
                      </p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                      <p className="font-semibold mb-1 text-gray-700">AI Feedback:</p>
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                        {item.feedback}
                      </pre>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default SessionSummary;
