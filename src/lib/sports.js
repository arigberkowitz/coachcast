// Design tokens (T), font stacks (space), and the sport/tone config.
// Warm light surfaces, one coral accent. Port — don't restyle.
import { Dribbble, Flag, Target, Circle, Hexagon } from 'lucide-react';

export const T = {
  // surfaces
  bg: '#F6F1EA',          // warm paper — the app background
  bgSunk: '#EFE7DB',      // slightly deeper warm (phone bezel, sunken wells)
  surface: '#FFFFFF',     // cards
  surfaceAlt: '#FBF7F1',  // subtle alt surface

  // ink
  ink: '#211C17',         // near-black, warm
  ink70: '#574E44',       // secondary text
  ink40: '#938979',       // muted / captions

  // line
  line: '#EBE3D7',        // hairline border
  lineStrong: '#DED4C5',

  // the one accent
  accent: '#FF5A2C',      // coral
  accentText: '#C5400F',  // darker coral for coral text on light
  accentSoft: '#FFEDE5',  // coral tint background
  accentSoft2: '#FFDDCF', // stronger coral tint

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

export const SPORTS = [
  { id: 'basketball', label: 'Basketball', Icon: Dribbble },
  { id: 'golf',       label: 'Golf',       Icon: Flag },
  { id: 'tennis',     label: 'Tennis',     Icon: Target },
  { id: 'baseball',   label: 'Baseball',   Icon: Circle },
  { id: 'soccer',     label: 'Soccer',     Icon: Hexagon },
];

export const sportById = (id) => SPORTS.find((s) => s.id === id) || SPORTS[0];

export const TONES = [
  { id: 'warm',      label: 'Warm',      hint: 'Personal and encouraging' },
  { id: 'straight',  label: 'Straight',  hint: 'Clear, no fluff' },
  { id: 'technical', label: 'Technical', hint: 'Skill-specific detail' },
];
