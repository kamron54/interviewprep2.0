// api/debug.js
export default function handler(req, res) {
  res.status(200).json({
    OPENAI_API_KEY_defined: !!process.env.OPENAI_API_KEY,
    // don’t ever echo the real key—you can tell it’s set if this is true
  });
}
