// Vercel serverless function: email a finished recap to a parent via Resend.
// The Resend key stays server-side only — never shipped to the client.
//
// Setup (one-time, by the coach):
//   1. Create a free account at resend.com and add an API key.
//   2. In Vercel → Project → Settings → Environment Variables, add:
//        RESEND_API_KEY  = re_...            (required)
//        RECAP_FROM      = CoachCast <you@yourdomain.com>   (optional)
//   3. To email arbitrary parents you must verify a sending domain in Resend.
//      Until then Resend's test sender only delivers to your own account email.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { to, subject, text } = req.body || {};
  if (!to?.trim() || !subject?.trim() || !text?.trim()) {
    return res.status(400).json({ error: "Missing recipient, subject, or message." });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return res.status(503).json({ error: "Email isn't set up yet. Add RESEND_API_KEY to send directly." });
  }

  const from = process.env.RECAP_FROM || "CoachCast <onboarding@resend.dev>";
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.6;color:#363232;white-space:pre-wrap">${escapeHtml(text.trim())}</div>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({ from, to: to.trim(), subject: subject.trim(), text: text.trim(), html }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(502).json({ error: data?.message || "Could not send the email." });
    }
    return res.status(200).json({ ok: true, id: data?.id });
  } catch (e) {
    return res.status(502).json({ error: "Could not send the email." });
  }
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
