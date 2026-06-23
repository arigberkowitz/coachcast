// Data seam. One coach, one device: athletes + recaps persisted to localStorage.
// Every read and write lives here, so swapping to a real per-coach database later
// (see Phase 2 — /api/* querying Postgres keyed by coach_id) touches only this file.
import { useSyncExternalStore } from 'react';

const KEY = 'coachcast.v1';

const uid = () =>
  (globalThis.crypto?.randomUUID?.() ??
    `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`);

const seedAthletes = [
  {
    id: 'a_maya',
    name: 'Maya Chen',
    age: 9,
    sport: 'basketball',
    recaps: [
      {
        id: 'r_maya_1',
        athleteId: 'a_maya',
        createdAt: '2026-06-09T17:40:00.000Z',
        sport: 'basketball',
        tone: 'warm',
        note: 'worked on layups off both feet, still rushing the second step. great energy today.',
        headline: 'Layups are getting smoother',
        workedOn: ['Layups off both feet', 'Slowing down the approach'],
        improved: ['Right-hand finish at the rim'],
        nextFocus: ['Left-hand layups under control'],
        parentMessage:
          "Maya had a great session. We spent most of it on layups, and her right-hand finish is really coming along — she's getting the footwork right more often than not. She still speeds up on the second step when she gets excited, so next time we'll slow that down and add her left hand. She works hard and it shows.",
        sent: true,
      },
      {
        id: 'r_maya_2',
        athleteId: 'a_maya',
        createdAt: '2026-06-02T17:30:00.000Z',
        sport: 'basketball',
        tone: 'warm',
        note: 'dribbling with head up, ball control drills. doing well keeping eyes up.',
        headline: 'Dribbling with her head up',
        workedOn: ['Ball control', 'Keeping eyes up while dribbling'],
        improved: ['Confidence with the left hand'],
        nextFocus: ['Changing speed off the dribble'],
        parentMessage:
          "Good session today. Maya is starting to keep her head up while she dribbles instead of staring at the ball, which is a big step. Her left hand is getting more comfortable too. Next week we'll work on changing speeds so defenders can't settle.",
        sent: true,
      },
    ],
  },
  {
    id: 'a_diego',
    name: 'Diego Ramirez',
    age: 13,
    sport: 'soccer',
    recaps: [
      {
        id: 'r_diego_1',
        athleteId: 'a_diego',
        createdAt: '2026-06-11T22:15:00.000Z',
        sport: 'soccer',
        tone: 'technical',
        note: 'first touch under pressure, receiving on the half turn. needs to check shoulder more.',
        headline: 'First touch under pressure',
        workedOn: ['Receiving on the half-turn', 'Scanning before the ball arrives'],
        improved: ['Cushioning the first touch'],
        nextFocus: ['Checking his shoulder before receiving'],
        parentMessage:
          "Diego put in a strong session focused on his first touch when a defender is close. He's getting better at opening his body to receive on the half-turn, which lets him play forward faster. The next thing is scanning — checking over his shoulder before the ball comes so he already knows his options. He's a thoughtful player and picks this up quickly.",
        sent: true,
      },
      {
        id: 'r_diego_2',
        athleteId: 'a_diego',
        createdAt: '2026-06-04T22:00:00.000Z',
        sport: 'soccer',
        tone: 'straight',
        note: 'passing range, weighting longer balls. accuracy good, weight inconsistent.',
        headline: 'Working the longer pass',
        workedOn: ['Passing range', 'Weighting longer balls'],
        improved: ['Accuracy over 20+ yards'],
        nextFocus: ['Consistent weight on the driven pass'],
        parentMessage:
          "We worked on Diego's longer passing today. His accuracy over distance is good — the thing to tighten up is the weight, so the ball arrives at a pace his teammate can actually use. We'll keep drilling it.",
        sent: true,
      },
    ],
  },
  {
    id: 'a_ava',
    name: 'Ava Thompson',
    age: 11,
    sport: 'tennis',
    recaps: [
      {
        id: 'r_ava_1',
        athleteId: 'a_ava',
        createdAt: '2026-06-10T20:00:00.000Z',
        sport: 'tennis',
        tone: 'warm',
        note: 'forehand topspin, low to high swing path. great improvement on follow through.',
        headline: 'Forehand has real topspin now',
        workedOn: ['Forehand topspin', 'Low-to-high swing path'],
        improved: ['Follow-through over the shoulder'],
        nextFocus: ['Recovering to the middle after the shot'],
        parentMessage:
          "Ava had a really good lesson. Her forehand is starting to have proper topspin — she's brushing up the back of the ball and finishing over her shoulder instead of pushing it. It's a noticeable change. Next time we'll add footwork so she recovers to the middle after she hits. She's a pleasure to coach.",
        sent: true,
      },
    ],
  },
  {
    id: 'a_liam',
    name: "Liam O'Brien",
    age: 8,
    sport: 'golf',
    recaps: [
      {
        id: 'r_liam_1',
        athleteId: 'a_liam',
        createdAt: '2026-06-08T15:30:00.000Z',
        sport: 'golf',
        tone: 'warm',
        note: 'grip and setup, putting from 6 feet. loves it, attention wanders a bit.',
        headline: 'Solid grip, fun on the greens',
        workedOn: ['Grip and setup', 'Putting from six feet'],
        improved: ['Keeping his head still over putts'],
        nextFocus: ['A steady, repeatable pre-putt routine'],
        parentMessage:
          "Liam had a fun session. We sorted out his grip and setup, which makes everything easier, and he sank a few six-footers by keeping his head still. He's full of energy — sometimes his focus wanders, so we'll build a little routine before each putt to help him settle. Great attitude.",
        sent: true,
      },
    ],
  },
  {
    id: 'a_noah',
    name: 'Noah Williams',
    age: 15,
    sport: 'baseball',
    recaps: [
      {
        id: 'r_noah_1',
        athleteId: 'a_noah',
        createdAt: '2026-06-12T23:10:00.000Z',
        sport: 'baseball',
        tone: 'technical',
        note: 'hitting, staying back on offspeed, hands inside the ball. pulling off some.',
        headline: 'Staying back on offspeed',
        workedOn: ['Staying back on offspeed pitches', 'Keeping hands inside the ball'],
        improved: ['Weight transfer timing'],
        nextFocus: ['Keeping his front shoulder closed'],
        parentMessage:
          "Noah had a productive hitting session. He's doing a better job staying back on offspeed pitches instead of lunging, and his hands are staying inside the ball. The next thing is keeping his front shoulder closed a beat longer so he doesn't pull off — when he does that, the contact is much harder. He's putting in the work.",
        sent: true,
      },
      {
        id: 'r_noah_2',
        athleteId: 'a_noah',
        createdAt: '2026-06-05T23:00:00.000Z',
        sport: 'baseball',
        tone: 'straight',
        note: 'infield, footwork on grounders, glove out front. clean transfers.',
        headline: 'Cleaner work in the infield',
        workedOn: ['Footwork on grounders', 'Fielding the ball out front'],
        improved: ['Glove-to-hand transfers'],
        nextFocus: ['Charging slow rollers'],
        parentMessage:
          "Good infield session. Noah is fielding the ball out front and his transfers are quick and clean. Next time we'll work on charging slow rollers so he has time to make the throw.",
        sent: true,
      },
    ],
  },
];

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore — fall through to seed
  }
  return { athletes: seedAthletes };
}

let state = load();
const listeners = new Set();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage unavailable (private mode etc.) — app still works in-memory this session
  }
}

function setState(next) {
  state = next;
  persist();
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

// ---- public API (the seam) ----

export function useStore() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function getAthlete(id) {
  return state.athletes.find((a) => a.id === id) || null;
}

export function saveRecap(athleteId, recap) {
  const full = {
    id: recap.id ?? uid(),
    athleteId,
    createdAt: recap.createdAt ?? new Date().toISOString(),
    sent: true,
    ...recap,
  };
  setState({
    ...state,
    athletes: state.athletes.map((a) =>
      a.id === athleteId ? { ...a, recaps: [full, ...a.recaps] } : a,
    ),
  });
  return full;
}

export function addAthlete({ name, age, sport }) {
  const a = { id: uid(), name: name.trim(), age: Number(age), sport, recaps: [] };
  setState({ ...state, athletes: [...state.athletes, a] });
  return a;
}

// Escape hatch for testing / a future "reset demo" affordance.
export function resetStore() {
  setState({ athletes: seedAthletes });
}
