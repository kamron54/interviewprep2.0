// api/transcribe.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    return res.end('Method Not Allowed');
  }

  try {
    // Forward the multipart/form-data request body directly to OpenAI
    const openaiRes = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': req.headers['content-type'],
        },
        body: req, // stream the raw request
      }
    );

    // Stream back OpenAI’s response
    const buffer = await openaiRes.arrayBuffer();
    res.statusCode = openaiRes.status;
    res.setHeader('Content-Type', openaiRes.headers.get('content-type') || 'application/json');
    res.end(Buffer.from(buffer));
  } catch (err) {
    console.error('🛑 Whisper proxy error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}
