// The only place the client talks to our serverless endpoints. It calls OUR
// /api/* functions (never api.anthropic.com); the API keys live server-side.

export class ApiError extends Error {
  constructor(kind, message, status) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind; // 'network' = couldn't reach the server | 'server' = HTTP error from a reachable server
    this.status = status;
  }
}

// POST JSON and throw a TYPED error: a genuine network failure (offline, server
// unreachable) vs. an HTTP error from a server we did reach. Callers pair this with
// errorMessage() so we only blame the connection when the connection is the problem.
async function postJSON(url, body) {
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // fetch only rejects for real network problems (offline, DNS, CORS, aborted)
    throw new ApiError('network', 'Could not reach the server');
  }
  if (!res.ok) {
    let serverMsg = '';
    try {
      serverMsg = (await res.json())?.error || '';
    } catch {
      // response body wasn't JSON
    }
    throw new ApiError('server', serverMsg || `Request failed (${res.status})`, res.status);
  }
  return res.json();
}

// Human-facing message. ONLY mentions the connection for a real network failure;
// a reachable server that returned an error gets the caller's fallback instead.
export function errorMessage(e, fallback) {
  if (e?.kind === 'network') {
    return typeof navigator !== 'undefined' && navigator.onLine === false
      ? "You're offline — check your Wi-Fi connection and try again."
      : 'Couldn’t reach the server. Check your connection and try again.';
  }
  return fallback;
}

export function generateRecap({ mode, sport, tone, athlete, transcript }) {
  return postJSON('/api/generate-recap', {
    mode,
    sport,
    tone,
    athlete: {
      firstName: athlete.name.split(' ')[0],
      age: athlete.age,
      history: athlete.recaps.slice(0, 2).map((r) => r.headline).join('; '),
    },
    transcript,
  });
}

export function translateRecap({ text, language }) {
  return postJSON('/api/translate', { text, language }); // { text }
}

export function summarizeAthlete({ mode, sport, athlete, recaps }) {
  return postJSON('/api/summarize', { mode, sport, athlete, recaps }); // { headline, summary }
}

// Emails a finished recap to a parent via our serverless function (Resend).
// On a reachable-server error the thrown message is the server's (e.g. "not set up yet").
export function sendRecapEmail({ to, subject, text }) {
  return postJSON('/api/send-recap', { to, subject, text }); // { ok, id }
}
