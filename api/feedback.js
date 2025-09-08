export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, transcript, profession } = await req.json?.() || req.body;
  if (!question || !transcript || !profession) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // --- JSON-only scoring prompt ------------------------------------------
  const prompt = `
You are an interview coach for ${profession} school admissions.
Score the candidate's answer STRICTLY as JSON that matches this schema:

{
  "rubricVersion": "v1",
  "overallScore": number,                // 0-100
  "sectionScores": {
    "overallImpression": number,         // 0-100
    "clarityStructure": number,          // 0-100
    "content": number                    // 0-100
  },
  "summary": string,                     // 2-4 sentence summary in 2nd person
  "suggestions": string[]                // 1-3 specific, actionable items
}

Scoring guidance:
- Calibrate to admissions bar; 70 = acceptable, 85 = strong, 95+ = outstanding.
- overallScore ≈ weighted average: overallImpression(30%), clarityStructure(30%), content(40%).
- Be concise and professional. No extra keys. No markdown. JSON ONLY.

Question: "${question}"

Transcript:
${transcript}
`.trim();

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // You can keep gpt-3.5-turbo; JSON conformance is better on newer models.
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2
      }),
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error("❌ OpenAI GPT error:", data);
      return res.status(500).json({ error: data.error?.message || "OpenAI error" });
    }

    const raw = data.choices?.[0]?.message?.content || "";

    // Best-effort: extract JSON block even if the model adds text.
    const jsonMatch = raw.match(/\{[\s\S]*\}$/);
    let parsed;
    try {
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      // Fallback: minimal safe object
      parsed = {
        rubricVersion: "v1",
        overallScore: 70,
        sectionScores: { overallImpression: 70, clarityStructure: 70, content: 70 },
        summary: "We couldn’t parse structured feedback. Treat this as a placeholder.",
        suggestions: ["Retry analysis to get structured scores."]
      };
    }

    // Clamp values and coerce numbers just in case
    const clamp = (n) => Math.max(0, Math.min(100, Number.isFinite(+n) ? +n : 0));
    parsed.overallScore = clamp(parsed.overallScore);
    parsed.sectionScores = {
      overallImpression: clamp(parsed.sectionScores?.overallImpression),
      clarityStructure: clamp(parsed.sectionScores?.clarityStructure),
      content: clamp(parsed.sectionScores?.content),
    };
    if (!Array.isArray(parsed.suggestions)) parsed.suggestions = [];

    return res.status(200).json({ feedback: parsed });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
