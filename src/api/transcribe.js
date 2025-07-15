export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const formData = await req.formData?.() || await (await import('next/dist/compiled/formdata-node')).FormDataParser.parse(req);

  const file = formData.get('file');
  if (!file) {
    return res.status(400).json({ error: 'Missing audio file' });
  }

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    });

    const data = await openaiRes.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Whisper API error:", err);
    res.status(500).json({ error: 'Failed to transcribe' });
  }
}
