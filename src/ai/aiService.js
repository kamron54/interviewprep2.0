import { auth } from '../../firebase';
export async function transcribeAudio(audioBlob) {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');  // ← ensure the model is specified

  try {
    const token = await auth.currentUser.getIdToken();
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData,
    });

    if (response.status === 403) {
      const { error } = await response.json();
      return { limitReached: true, error };
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Whisper API (backend) error:', errorData);
      throw new Error(errorData.error || 'Failed to transcribe');
    }

    const data = await response.json();
    return { transcript: data.text, limitReached: false };
  } catch (error) {
    console.error('❌ Whisper API fetch error:', error.message);
    throw error;
  }
}

export async function getFeedback(question, transcript, profession) {
  try {
    const token = await auth.currentUser.getIdToken();
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ question, transcript, profession }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('❌ Feedback API error:', data);
      throw new Error(data.error || 'Error generating feedback');
    }

    // data.feedback is now a structured object
    return data.feedback;
  } catch (error) {
    console.error('❌ Feedback fetch error:', error.message);
    throw error;
  }
}
