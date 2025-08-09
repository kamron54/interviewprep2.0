let _stream = null;

export function setStoredMediaStream(stream) {
  _stream = stream;
}

export function getStoredMediaStream() {
  if (!_stream) return null;
  // Only return if at least one track is live
  const hasLive = _stream.getTracks().some(t => t.readyState === 'live');
  return hasLive ? _stream : null;
}

export function clearStoredMediaStream() {
  _stream = null;
}

// (optional) replace helper
export function replaceStoredMediaStream(stream) {
  _stream = stream;
}

export const getMediaStream = async () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Browser does not support getUserMedia.');
  }

  try {
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
  } catch (error) {
    console.error('Error accessing media devices:', error);
    if (error.name === 'NotAllowedError') {
      throw new Error('Camera and microphone access was denied.');
    } else if (error.name === 'NotFoundError') {
      throw new Error('No camera or microphone found.');
    } else {
      throw new Error('Unable to access media devices.');
    }
  }
};
