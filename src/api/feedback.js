export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, transcript, profession } = await req.json?.() || req.body;

  if (!question || !transcript || !profession) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

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
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await openaiRes.json();

    if (openaiRes.ok) {
      res.status(200).json({ feedback: data.choices[0].message.content });
    } else {
      console.error("❌ OpenAI GPT error:", data);
      res.status(500).json({ error: data.error?.message || "OpenAI error" });
    }
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
