// api/transcribe.js
export default async function handler(req, res) {
  // DEBUG: check if Vercel injected the key
  console.log('🔐 OPENAI_API_KEY defined?', !!process.env.OPENAI_API_KEY);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // 1. Collect the raw request body into a single Buffer
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const bodyBuffer = Buffer.concat(chunks);

    // 2. Proxy to OpenAI, preserving content‑type
    const openaiRes = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': req.headers['content-type'] || 'multipart/form-data',
        },
        body: bodyBuffer,
      }
    );

    // 3. Read back as text and try to parse JSON
    const text = await openaiRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error('🛑 Whisper API returned non-JSON:', text);
      return res
        .status(500)
        .json({ error: 'Unexpected response from Whisper API' });
    }

    // 4. Forward status + parsed JSON
    res.status(openaiRes.status).json(data);
  } catch (err) {
    console.error('🛑 Whisper proxy error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
