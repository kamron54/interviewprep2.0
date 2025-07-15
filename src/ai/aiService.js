export async function transcribeAudio(audioBlob) {
  console.log('🎧 Uploading audioBlob:', audioBlob);
  console.log('👉 Type:', audioBlob?.type);
  console.log('👉 Size:', audioBlob?.size);
  console.log('👉 Is instance of Blob:', audioBlob instanceof Blob);

  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');

  try {
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Whisper API (backend) error:', errorData);
      throw new Error(errorData.error || 'Failed to transcribe');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('❌ Whisper API fetch error:', error.message);
    throw error;
  }
}

export async function getFeedback(question, transcript, profession) {
  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, transcript, profession }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Feedback API error:', data);
      throw new Error(data.error || 'Error generating feedback');
    }

    return data.feedback;
  } catch (error) {
    console.error('❌ Feedback fetch error:', error.message);
    throw error;
  }
}
