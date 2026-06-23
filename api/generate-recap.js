// Vercel serverless function. Runs on the server: reads the API key from the
// environment, calls Anthropic, returns the parsed recap. The key never reaches
// the browser. Prompt wording is kept identical to the prototype's generate().
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { sport, tone, athlete, transcript } = req.body || {};
  if (!transcript?.trim() || !athlete) {
    return res.status(400).json({ error: "Missing note or athlete." });
  }

  const toneGuide = {
    warm: "warm, encouraging and personal — like a coach who genuinely cares, texting a parent they have a good relationship with",
    straight: "clear and direct, no fluff, respectful of the parent's time",
    technical: "more skill-specific detail, for the parent of a serious, older athlete who wants substance",
  }[tone] || "warm and personal";

  const sys = `You write post-session progress recaps that a youth ${String(sport).toLowerCase()} skills coach sends to a player's parent. Voice: ${toneGuide}. Use the player's first name. Sound like a real human coach, never like marketing. Do not use words like "thrilled", "excited to share", "journey", "leverage", or any buzzwords. Keep the parent message 3–5 sentences. Return ONLY valid JSON, no markdown, no preamble, matching exactly: {"headline": string (max 6 words), "workedOn": string[] (1-3 items), "improved": string[] (1-3 items), "nextFocus": string[] (1-2 items), "parentMessage": string}.`;
  const usr = `Player: ${athlete.firstName}, age ${athlete.age}. Sport: ${sport}.${athlete.history ? ` Recent sessions: ${athlete.history}.` : ""}\nCoach's rough note from today's session:\n"""${transcript.trim()}"""`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,   // server-side only
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",   // or claude-haiku-4-5-20251001 to cut cost
        max_tokens: 1000,
        system: sys,
        messages: [{ role: "user", content: usr }],
      }),
    });
    const data = await r.json();
    const text = (data.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const recap = JSON.parse(clean.slice(clean.indexOf("{"), clean.lastIndexOf("}") + 1));
    return res.status(200).json(recap);
  } catch (e) {
    return res.status(502).json({ error: "Could not generate recap." });
  }
}
