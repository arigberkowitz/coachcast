// The only place the client talks to the recap endpoint.
// It calls OUR serverless function (/api/generate-recap) — never api.anthropic.com.
// The API key lives server-side only.

export async function generateRecap({ sport, tone, athlete, transcript }) {
  const res = await fetch('/api/generate-recap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sport,
      tone,
      athlete: {
        firstName: athlete.name.split(' ')[0],
        age: athlete.age,
        history: athlete.recaps.slice(0, 2).map((r) => r.headline).join('; '),
      },
      transcript,
    }),
  });
  if (!res.ok) throw new Error('recap request failed');
  return res.json();
}

export async function translateRecap({ text, language }) {
  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language }),
  });
  if (!res.ok) throw new Error('translate request failed');
  return res.json(); // { text }
}

export async function summarizeAthlete({ sport, athlete, recaps }) {
  const res = await fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sport, athlete, recaps }),
  });
  if (!res.ok) throw new Error('summarize request failed');
  return res.json(); // { headline, summary }
}
