// Vercel serverless function: a parent-facing progress summary across several
// recent recaps for one athlete. Key stays server-side.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { mode, sport, athlete, recaps } = req.body || {};
  if (!athlete || !Array.isArray(recaps) || recaps.length === 0) {
    return res.status(400).json({ error: "Missing athlete or recaps." });
  }

  const CATEGORY = {
    basketball: "basketball", golf: "golf", tennis: "tennis", baseball: "baseball", soccer: "soccer",
    math: "math", reading: "reading and writing", science: "science", history: "history",
    testprep: "test prep", spanish: "Spanish", coding: "coding", music: "music",
  };
  const cat = CATEGORY[sport] || String(sport).toLowerCase();
  const isTutor = mode === "tutor";

  const lines = recaps
    .map((r) => `- ${r.date ? r.date + ": " : ""}${r.headline}${r.parentMessage ? " — " + r.parentMessage : ""}`)
    .join("\n");

  const sys = isTutor
    ? `You write a short progress summary that an independent ${cat} tutor sends to a student's parent, covering several recent sessions at once. Warm, specific, and human — never marketing. Use the student's first name. Do not use words like "thrilled", "excited to share", "journey", "leverage", or any buzzwords. Find the throughline across sessions: what they've covered, what has clearly improved, and what's next. Keep it 4–6 sentences. Write the headline in sentence case — capitalize only the first word and proper nouns, never Title Case. Return ONLY valid JSON, no markdown, no preamble: {"headline": string (max 6 words), "summary": string}.`
    : `You write a short progress summary that a youth ${cat} coach sends to a player's parent, covering several recent sessions at once. Warm, specific, and human — never marketing. Use the player's first name. Do not use words like "thrilled", "excited to share", "journey", "leverage", or any buzzwords. Find the throughline across sessions: what they've worked on, what has clearly improved, and what's next. Keep it 4–6 sentences. Write the headline in sentence case — capitalize only the first word and proper nouns, never Title Case. Return ONLY valid JSON, no markdown, no preamble: {"headline": string (max 6 words), "summary": string}.`;
  const usr = isTutor
    ? `Student: ${athlete.firstName}, age ${athlete.age}. Subject: ${cat}.\nRecent session recaps (newest first):\n${lines}`
    : `Player: ${athlete.firstName}, age ${athlete.age}. Sport: ${cat}.\nRecent session recaps (newest first):\n${lines}`;

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
        max_tokens: 800,
        system: sys,
        messages: [{ role: "user", content: usr }],
      }),
    });
    const data = await r.json();
    const text = (data.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const out = JSON.parse(clean.slice(clean.indexOf("{"), clean.lastIndexOf("}") + 1));
    return res.status(200).json(out);
  } catch (e) {
    return res.status(502).json({ error: "Could not summarize." });
  }
}
