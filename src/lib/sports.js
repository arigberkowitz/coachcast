// Design tokens (T), font stacks (space), category lists, and tones.
// The accent is a CSS variable so the active brand (coach = coral, tutor = indigo)
// can reskin the whole app by swapping the variables at the root. Everything that
// reads T.accent* automatically follows the active brand.
import { Dribbble, Flag, Target, Circle, Hexagon } from 'lucide-react';
import { Calculator, BookOpen, FlaskConical, Landmark, GraduationCap, Languages, Code, Music } from 'lucide-react';

export const T = {
  // surfaces
  bg: '#F6F1EA',
  bgSunk: '#EFE7DB',
  surface: '#FFFFFF',
  surfaceAlt: '#FBF7F1',

  // ink
  ink: '#211C17',
  ink70: '#574E44',
  ink40: '#938979',

  // line
  line: '#EBE3D7',
  lineStrong: '#DED4C5',

  // accent — resolved from the active brand via CSS variables
  accent: 'var(--cc-accent)',
  accentText: 'var(--cc-accent-text)',
  accentSoft: 'var(--cc-accent-soft)',
  accentSoft2: 'var(--cc-accent-soft2)',
  accentGlow: 'var(--cc-accent-glow)', // rgba, for shadows/glows

  // radii + shadow
  r: 16,
  rSm: 10,
  rLg: 22,
  rPill: 999,
  shadow: '0 1px 2px rgba(33,28,23,.04), 0 10px 26px rgba(33,28,23,.07)',
  shadowSoft: '0 1px 2px rgba(33,28,23,.05)',
  shadowPhone: '0 40px 90px -28px rgba(33,28,23,.45), 0 12px 30px -12px rgba(33,28,23,.25)',
};

export const space = {
  display: "'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif",
  body: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
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
