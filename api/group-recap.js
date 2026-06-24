// Vercel serverless function: the Group Recap fan-out. Takes ONE shared note about
// a group session and writes a personalized recap for each member. Key server-side.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { mode, sport, tone, note, members } = req.body || {};
  if (!note?.trim() || !Array.isArray(members) || members.length === 0) {
    return res.status(400).json({ error: "Missing note or members." });
  }

  const CATEGORY = {
    basketball: "basketball", golf: "golf", tennis: "tennis", baseball: "baseball", soccer: "soccer",
    math: "math", reading: "reading and writing", science: "science", history: "history",
    testprep: "test prep", spanish: "Spanish", coding: "coding", music: "music",
  };
  const cat = CATEGORY[sport] || String(sport).toLowerCase();
  const isTutor = mode === "tutor";
  const who = isTutor ? "student" : "player";
  const adult = isTutor ? "tutor" : "coach";
  const parentWord = isTutor ? "parent" : "parent";

  const toneGuide = {
    warm: "warm, encouraging and personal — like someone who genuinely cares, texting a parent they have a good relationship with",
    straight: "clear and direct, no fluff, respectful of the parent's time",
    technical: "more skill-specific detail, for the parent of a serious, older learner who wants substance",
  }[tone] || "warm and personal";

  const roster = members
    .slice(0, 16)
    .map((m, i) => `${i + 1}. id="${m.id}", ${m.firstName}, age ${m.age}`)
    .join("\n");

  const sys = `You write per-${who} progress recaps from ONE shared note about a GROUP ${cat} session. An independent ${adult} ran a session with several ${who}s and jotted a single rough note covering the whole group. For EACH ${who} in the roster, write a personalized recap for that ${who}'s ${parentWord}:
- Pull out anything the note says specifically about THAT ${who} by name.
- Include the shared focus of the session that applies to the whole group.
- If a ${who} is NOT mentioned individually in the note, base their recap on the shared group work only — do NOT invent individual details, scores, or behavior for them.
Voice: ${toneGuide}. Use the ${who}'s first name. Sound like a real human ${adult}, never like marketing. No buzzwords ("thrilled", "journey", "excited to share", "leverage"). Keep each parentMessage 3–5 sentences. Write every headline in sentence case — capitalize only the first word and proper nouns, never Title Case. "homework" is one concrete thing to practice before next time ("" if none) and must not be repeated inside parentMessage; "homeworkHow" is one short plain sentence on how to do that practice ("" if no homework).
Return ONLY valid JSON, no markdown, no preamble, matching exactly: {"recaps":[{"id": string (echo the ${who}'s id exactly), "headline": string (max 6 words), "workedOn": string[] (1-3), "improved": string[] (1-3), "nextFocus": string[] (1-2), "homework": string, "homeworkHow": string, "parentMessage": string}]} — exactly one object per ${who}, in the same order as the roster.`;

  const usr = `Subject/sport: ${cat}. Group of ${members.length} ${who}s:\n${roster}\n\n${adult}'s rough note from today's group session:\n"""${note.trim()}"""`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY, // server-side only
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: Math.min(4000, 400 * members.length + 400),
        system: sys,
        messages: [{ role: "user", content: usr }],
      }),
    });
    const data = await r.json();
    const text = (data.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean.slice(clean.indexOf("{"), clean.lastIndexOf("}") + 1));
    if (!parsed?.recaps?.length) throw new Error("no recaps");
    return res.status(200).json({ recaps: parsed.recaps });
  } catch (e) {
    return res.status(502).json({ error: "Could not generate group recaps." });
  }
}
