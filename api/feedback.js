import { getUserFromRequest } from '../firebase-admin';

// gpt-3.5-turbo shuts down Oct 23, 2026. Switching models is a one-line change here;
// current models and prices: https://developers.openai.com/api/docs/pricing
const FEEDBACK_MODEL = 'gpt-6-luna';

// Structured Outputs: the model must reply with exactly this shape, so there's nothing to repair.
// Field order matters: the model writes what works and what to change before it picks scores.
const FEEDBACK_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['genuineAttempt', 'strengths', 'suggestions', 'summary', 'sectionScores'],
  properties: {
    genuineAttempt: { type: 'boolean' },
    strengths: { type: 'array', items: { type: 'string' } },
    suggestions: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
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
  },
};

// Overall score = weighted average of the sections, computed here so it always matches the bars
const SECTION_WEIGHTS = { overallImpression: 0.3, clarityStructure: 0.3, content: 0.4 };

// Genuine attempts never score below this; only off-topic or nonsense answers can
const GENUINE_ATTEMPT_FLOOR = 50;

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
You are a supportive, experienced interview coach for ${profession} school admissions. A student recorded an answer to a practice interview question. You'll see the question and a transcript of what they said.

Interview answers are personal, and there is no single right answer. Judge whether the answer is genuine, relevant, specific, and clearly organized, not whether it matches a template. Don't nitpick or invent problems. It's a transcript of speech, so don't penalize filler words or small verbal slips.

Return:
- genuineAttempt: false only if the answer is off-topic, nonsensical, or doesn't try to answer the question. Otherwise true.
- strengths: 1-3 specific things that work well and are worth keeping.
- suggestions: 0-3 specific, optional ways to make the answer stronger. Include one only if it would make a real difference. If the answer is already strong, return an empty list or a single small refinement.
- summary: 2-3 sentences written to the student in the second person. Lead with what works. If the answer is strong, say so plainly and tell them they don't need to change it.
- sectionScores: overallImpression, clarityStructure, and content, each 0-100, on this scale:
  90-100 Excellent: genuine, specific, and well organized; ready for interview day, even if not perfect.
  80-89 Strong: works well; small optional polish at most.
  70-79 Solid: a good foundation with one or two clear ways to improve.
  60-69 Developing: relevant, but vague, rambling, or missing important pieces.
  50-59 Weak: only partly answers the question.
  Below 50: only when genuineAttempt is false.
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

    // Clamp values and coerce numbers just in case; genuine attempts never drop below the floor
    const clamp = (n) => Math.max(0, Math.min(100, Number.isFinite(+n) ? Math.round(+n) : 0));
    const floor = parsed.genuineAttempt === false ? 0 : GENUINE_ATTEMPT_FLOOR;
    const sectionScores = {};
    for (const key of Object.keys(SECTION_WEIGHTS)) {
      sectionScores[key] = Math.max(floor, clamp(parsed.sectionScores?.[key]));
    }
    const overallScore = Math.round(
      Object.entries(SECTION_WEIGHTS).reduce((sum, [key, weight]) => sum + sectionScores[key] * weight, 0)
    );
    const list = (items) =>
      Array.isArray(items) ? items.filter((s) => typeof s === "string" && s.trim()).slice(0, 3) : [];

    const feedback = {
      rubricVersion: "v2", // v1 = gpt-3.5-turbo scoring
      overallScore,
      sectionScores,
      summary: String(parsed.summary || ""),
      strengths: list(parsed.strengths),
      suggestions: list(parsed.suggestions), // may be empty: strong answers don't need changes
    };

    return res.status(200).json({ feedback });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
