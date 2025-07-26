import admin from '../firebase-admin';
// api/transcribe.js
export default async function handler(req, res) {

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // ✅ Verify Firebase ID token
  const idToken = req.headers.authorization?.split('Bearer ')[1];

  if (!idToken) {
    return res.status(401).json({ error: 'No token provided' });
  }

  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(idToken);
  } catch (err) {
    console.error('Invalid Firebase ID token', err);
    return res.status(401).json({ error: 'Invalid token' });
  }

  const userId = decoded.uid;
  const userRef = admin.firestore().collection('users').doc(userId);
  const userDoc = await userRef.get();

  const currentUsage = userDoc.exists ? userDoc.data().usageCount || 0 : 0;

  if (currentUsage >= 555) {
    return res.status(403).json({ error: 'Usage limit reached. You’ve hit your free limit of 555 transcriptions.' });
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
      await userRef.update({
        usageCount: admin.firestore.FieldValue.increment(1)
      });
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
