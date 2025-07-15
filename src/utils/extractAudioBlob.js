export async function extractAudioBlob(videoBlob) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const audioChunks = [];
    const mediaSource = new MediaSource();

    video.src = URL.createObjectURL(videoBlob);
    video.muted = true;
    video.play();

    video.onloadedmetadata = async () => {
      try {
        const stream = video.captureStream();
        const audioStream = new MediaStream(stream.getAudioTracks());

        const recorder = new MediaRecorder(audioStream);
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunks.push(e.data);
          }
        };
        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          resolve(audioBlob);
        };

        recorder.start();

        setTimeout(() => {
          recorder.stop();
          video.pause();
        }, video.duration * 1000);
      } catch (err) {
        reject(err);
      }
    };

    video.onerror = (err) => {
      reject('Failed to load video for audio extraction');
    };
  });
}
