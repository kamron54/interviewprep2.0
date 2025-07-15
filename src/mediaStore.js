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
