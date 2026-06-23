// Vercel serverless function. Runs on the server: reads the API key from the
// environment, calls Anthropic, returns the parsed recap. The key never reaches
// the browser. Prompt wording is kept identical to the prototype's generate().
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { mode, sport, tone, athlete, transcript } = req.body || {};
  if (!transcript?.trim() || !athlete) {
    return res.status(400).json({ error: "Missing note or athlete." });
  }

  // readable category label for the prompt
  const CATEGORY = {
    basketball: "basketball", golf: "golf", tennis: "tennis", baseball: "baseball", soccer: "soccer",
    math: "math", reading: "reading and writing", science: "science", history: "history",
    testprep: "test prep", spanish: "Spanish", coding: "coding", music: "music",
  };
  const cat = CATEGORY[sport] || String(sport).toLowerCase();
  const isTutor = mode === "tutor";

  const toneGuide = {
    warm: "warm, encouraging and personal — like someone who genuinely cares, texting a parent they have a good relationship with",
    straight: "clear and direct, no fluff, respectful of the parent's time",
    technical: "more skill-specific detail, for the parent of a serious, older learner who wants substance",
  }[tone] || "warm and personal";

  const sys = isTutor
    ? `You write post-session progress recaps that an independent ${cat} tutor sends to a student's parent. Voice: ${toneGuide}. Use the student's first name. Sound like a real, caring tutor, never like marketing. Do not use words like "thrilled", "excited to share", "journey", "leverage", or any buzzwords. Keep the parent message 3–5 sentences. Return ONLY valid JSON, no markdown, no preamble, matching exactly: {"headline": string (max 6 words), "workedOn": string[] (1-3 items, what was covered today), "improved": string[] (1-3 items, strengths or progress), "nextFocus": string[] (1-2 items, what to focus on next, including any homework), "parentMessage": string}.`
    : `You write post-session progress recaps that a youth ${cat} skills coach sends to a player's parent. Voice: ${toneGuide}. Use the player's first name. Sound like a real human coach, never like marketing. Do not use words like "thrilled", "excited to share", "journey", "leverage", or any buzzwords. Keep the parent message 3–5 sentences. Return ONLY valid JSON, no markdown, no preamble, matching exactly: {"headline": string (max 6 words), "workedOn": string[] (1-3 items), "improved": string[] (1-3 items), "nextFocus": string[] (1-2 items), "parentMessage": string}.`;
  const usr = isTutor
    ? `Student: ${athlete.firstName}, age ${athlete.age}. Subject: ${cat}.${athlete.history ? ` Recent sessions: ${athlete.history}.` : ""}\nTutor's rough note from today's session:\n"""${transcript.trim()}"""`
    : `Player: ${athlete.firstName}, age ${athlete.age}. Sport: ${cat}.${athlete.history ? ` Recent sessions: ${athlete.history}.` : ""}\nCoach's rough note from today's session:\n"""${transcript.trim()}"""`;

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
