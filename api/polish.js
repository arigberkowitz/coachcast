// Vercel serverless function: clean a rough, spoken session note into polished
// written English — the way a great dictation app (Wispr-style) does. Key stays
// server-side. Uses a fast, cheap model since this is a light cleanup, not a recap.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { text } = req.body || {};
  if (!text?.trim()) return res.status(400).json({ error: "Missing text." });

  const sys = `You clean up a coach or tutor's rough, spoken session note into polished, natural written English — the way a great voice-dictation app does.
- Remove filler words ("um", "uh", "like", "you know"), false starts, stutters, and accidental repetition.
- Fix grammar, punctuation, capitalization, and run-on sentences. Break it into clean sentences (and short paragraphs if it's long).
- Keep it first person, in the speaker's own voice and meaning. It stays a short personal note — do NOT turn it into a formal report or a parent-facing message.
- Do NOT add, invent, or infer any facts, names, numbers, or details that aren't in the original.
- If the note is already clean, return it essentially unchanged.
Return ONLY the cleaned note text: no quotes, no preamble, no labels, no explanation.`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY, // server-side only
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001", // fast + cheap for light cleanup
        max_tokens: 700,
        system: sys,
        messages: [{ role: "user", content: text.trim() }],
      }),
    });
    const data = await r.json();
    const out = (data.content || []).filter((c) => c.type === "text").map((c) => c.text).join("").trim();
    if (!out) throw new Error("empty polish");
    return res.status(200).json({ text: out });
  } catch (e) {
    return res.status(502).json({ error: "Could not polish the note." });
  }
}
