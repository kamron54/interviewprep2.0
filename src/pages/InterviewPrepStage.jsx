import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { setStoredMediaStream } from '../mediaStore';

function InterviewPrepStage() {
  const navigate = useNavigate();
  const location = useLocation();
  const config = location.state || {};
  const isVideo = config.mode === 'video';

  const [stream, setStream] = useState(null);
  const [status, setStatus] = useState('');
  const videoRef = useRef(null);

  const handleAllowAccess = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo,
      });
      setStream(mediaStream);
      setStoredMediaStream(mediaStream);

          if (isVideo) {
            const track = mediaStream.getVideoTracks()[0];
            const settings = track.getSettings();
            // Save aspect ratio in config
            config.videoAspectRatio = settings.width && settings.height
              ? settings.width / settings.height
              : 16 / 9; // fallback
          }

      setStatus('');
    } catch (err) {
      console.error('Permission denied', err);
      setStatus('❌ Please allow camera/microphone access to continue.');
    }
  };

  const handleStartInterview = () => {
    if (!stream) {
      setStatus('⚠️ Please allow access first.');
      return;
    }

    navigate('/interview', { state: { config } });
  };

  useEffect(() => {
    if (videoRef.current && stream && isVideo) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isVideo]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [stream]);

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6 text-center">
      <h1 className="text-3xl font-semibold text-gray-900">Ready to Begin?</h1>
      <p className="text-gray-600">
        We'll use your {isVideo ? 'camera and microphone' : 'microphone'} for this mock interview session.
      </p>

      {status && (
        <p className="text-red-600 font-medium">{status}</p>
      )}

      {isVideo && stream && (
        <div>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full border rounded mt-4 shadow-sm"
          />
        </div>
      )}

      <div className="flex justify-center gap-4">
        {!stream ? (
          <Button type="secondary" onClick={handleAllowAccess}>
            Allow {isVideo ? 'Camera & Mic' : 'Mic'} Access
          </Button>
        ) : (
          <Button type="primary" onClick={handleStartInterview}>
            Start Interview
          </Button>
        )}
      </div>
    </div>
  );
}

export default InterviewPrepStage;
