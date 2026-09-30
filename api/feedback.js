import { getUserFromRequest } from '../firebase-admin';

// gpt-3.5-turbo shuts down Oct 23, 2026. Switching models is a one-line change here;
// current models and prices: https://developers.openai.com/api/docs/pricing
const FEEDBACK_MODEL = 'gpt-6-luna';

// Structured Outputs: the model must reply with exactly this shape, so there's nothing to repair
const FEEDBACK_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['overallScore', 'sectionScores', 'summary', 'suggestions'],
  properties: {
    overallScore: { type: 'integer' },
    sectionScores: {
      type: 'object',
      additionalProperties: false,
      required: ['overallImpression', 'clarityStructure', 'content'],
      properties: {
        overallImpression: { type: 'integer' },
        clarityStructure: { type: 'integer' },
        content: { type: 'integer' },
      },
    },
    summary: { type: 'string' },
    suggestions: { type: 'array', items: { type: 'string' } },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Not signed in' });
  }

  const { question, transcript, profession } = await req.json?.() || req.body;
  if (!question || !transcript || !profession) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // --- Scoring instructions (the reply shape is enforced by FEEDBACK_SCHEMA) ---
  const instructions = `
You are an interview coach for ${profession} school admissions. Score the candidate's answer to the interview question.

Return:
- overallScore: 0-100, the weighted average of the section scores: overallImpression 30%, clarityStructure 30%, content 40%.
- sectionScores: overallImpression, clarityStructure, and content, each 0-100.
- summary: 2-4 sentences of feedback, written to the candidate in the second person.
- suggestions: 1-3 specific, actionable ways to improve this answer.

Calibrate to the admissions bar: 70 = acceptable, 85 = strong, 95+ = outstanding. Be concise and professional.
`.trim();

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: FEEDBACK_MODEL,
        reasoning_effort: "none", // skip the "thinking" pass: much faster, and plenty for scoring one answer
        messages: [
          { role: "system", content: instructions },
          { role: "user", content: `Question: "${question}"\n\nTranscript:\n${transcript}` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: "interview_feedback", strict: true, schema: FEEDBACK_SCHEMA },
        },
      }),
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error("❌ OpenAI GPT error:", data);
      return res.status(500).json({ error: data.error?.message || "OpenAI error" });
    }

    const message = data.choices?.[0]?.message;
    let parsed;
    try {
      parsed = JSON.parse(message?.content || "");
    } catch {
      // A refusal or empty reply: report an error so the answer shows as "not scored",
      // never a made-up score
      console.error("❌ Unusable feedback reply:", message?.refusal || message?.content);
      return res.status(502).json({ error: "Could not generate feedback" });
    }

    // Clamp values and coerce numbers just in case
    const clamp = (n) => Math.max(0, Math.min(100, Number.isFinite(+n) ? +n : 0));
    const feedback = {
      rubricVersion: "v2", // v1 = gpt-3.5-turbo scoring
      overallScore: clamp(parsed.overallScore),
      sectionScores: {
        overallImpression: clamp(parsed.sectionScores?.overallImpression),
        clarityStructure: clamp(parsed.sectionScores?.clarityStructure),
        content: clamp(parsed.sectionScores?.content),
      },
      summary: String(parsed.summary || ""),
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 3) : [],
    };

    return res.status(200).json({ feedback });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
