// Design tokens (T), font stacks (space), category lists, and tones.
// The accent is a CSS variable so the active brand (coach = coral, tutor = indigo)
// can reskin the whole app by swapping the variables at the root. Everything that
// reads T.accent* automatically follows the active brand.
import { Dribbble, Flag, Target, Circle, Hexagon } from 'lucide-react';
import { Calculator, BookOpen, FlaskConical, Landmark, GraduationCap, Languages, Code, Music } from 'lucide-react';

export const T = {
  // surfaces — Wyzant-style clean white with a warm beige accent surface
  bg: '#FBFAF9',
  bgSunk: '#EAE1D9',
  surface: '#FFFFFF',
  surfaceAlt: '#F4F1ED',

  // ink (Wyzant warm charcoal)
  ink: '#363232',
  ink70: '#5C5654',
  ink40: '#8E8886',

  // line
  line: '#E4E0DB',
  lineStrong: '#CFCBC6',

  // accent — resolved from the active brand via CSS variables
  accent: 'var(--cc-accent)',
  accentText: 'var(--cc-accent-text)',
  accentSoft: 'var(--cc-accent-soft)',
  accentSoft2: 'var(--cc-accent-soft2)',
  accentGlow: 'var(--cc-accent-glow)', // rgba, for shadows/glows

  // radii + shadow — tighter corners + flatter, like Wyzant
  r: 10,
  rSm: 7,
  rLg: 14,
  rPill: 999,
  shadow: '0 1px 2px rgba(54,50,50,.05), 0 6px 18px rgba(54,50,50,.06)',
  shadowSoft: '0 1px 2px rgba(54,50,50,.05)',
  shadowPhone: '0 30px 80px -30px rgba(54,50,50,.35), 0 10px 24px -12px rgba(54,50,50,.2)',
};

export const space = {
  display: "'Ubuntu', ui-sans-serif, system-ui, sans-serif",
  body: "'Open Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
};

// Coach categories (sports)
export const SPORTS = [
  { id: 'basketball', label: 'Basketball', Icon: Dribbble },
  { id: 'golf',       label: 'Golf',       Icon: Flag },
  { id: 'tennis',     label: 'Tennis',     Icon: Target },
  { id: 'baseball',   label: 'Baseball',   Icon: Circle },
  { id: 'soccer',     label: 'Soccer',     Icon: Hexagon },
];

// Tutor categories (subjects)
export const SUBJECTS = [
  { id: 'math',     label: 'Math',              Icon: Calculator },
  { id: 'reading',  label: 'Reading & Writing', Icon: BookOpen },
  { id: 'science',  label: 'Science',           Icon: FlaskConical },
  { id: 'history',  label: 'History',           Icon: Landmark },
  { id: 'testprep', label: 'Test prep',         Icon: GraduationCap },
  { id: 'spanish',  label: 'Spanish',           Icon: Languages },
  { id: 'coding',   label: 'Coding',            Icon: Code },
  { id: 'music',    label: 'Music',             Icon: Music },
];

// Brand-agnostic lookup: category ids are unique across sports + subjects, so a
// single resolver works regardless of which side is active.
const _catMap = Object.fromEntries([...SPORTS, ...SUBJECTS].map((c) => [c.id, c]));
export const catById = (id) => _catMap[id] || SPORTS[0];
export const sportById = catById; // back-compat alias

export const TONES = [
  { id: 'warm',      label: 'Warm',      hint: 'Personal and encouraging' },
  { id: 'straight',  label: 'Straight',  hint: 'Clear, no fluff' },
  { id: 'technical', label: 'Technical', hint: 'Skill-specific detail' },
];
