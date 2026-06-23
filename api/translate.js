// Vercel serverless function: translate the parent message into another language,
// keeping a real coach's warm tone. Key stays server-side.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { text, language } = req.body || {};
  if (!text?.trim() || !language) {
    return res.status(400).json({ error: "Missing text or language." });
  }

  const sys = `You are translating a short message that a youth sports coach is sending to a player's parent. Translate it into ${language}, keeping the warm, natural, human tone — it should read like a real coach wrote it in ${language}, not a literal machine translation. Keep the player's name exactly as written. Return ONLY the translated message: no preamble, no quotes, no notes.`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 700,
        system: sys,
        messages: [{ role: "user", content: text.trim() }],
      }),
    });
    const data = await r.json();
    const out = (data.content || []).filter((c) => c.type === "text").map((c) => c.text).join("").trim();
    if (!out) throw new Error("empty translation");
    return res.status(200).json({ text: out });
  } catch (e) {
    return res.status(502).json({ error: "Could not translate." });
  }
}
