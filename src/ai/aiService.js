import axios from 'axios';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function transcribeAudio(audioBlob) {
  console.log('🎧 Uploading audioBlob:', audioBlob);
  console.log('👉 Type:', audioBlob?.type);
  console.log('👉 Size:', audioBlob?.size);
  console.log('👉 Is instance of Blob:', audioBlob instanceof Blob);

  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.text;
  } catch (error) {
    console.error('❌ Whisper API error:', error?.response?.data || error.message);
    throw error;
  }
}

export async function getFeedback(question, transcript, profession) {
  const prompt = `You are an interview coach for ${profession} school admissions. Evaluate the following response to an interview question as if you were part of an admissions committee.

Provide clear, constructive feedback using the format below:

- Strengths
- Areas to Improve
- Suggestions

Be concise, supportive, and maintain a professional tone. If no improvement is needed, say so.

Question: "${question}"

Response Transcript:
${transcript}`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('❌ Feedback API error:', error?.response?.data || error.message);
    throw error;
  }
}
