// Global <Style> block: web fonts, base reset, keyframes, focus + reduced-motion.
// Everything else is styled inline via the `T` design tokens (see lib/sports.js),
// matching the prototype's single-file approach.

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Inter:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; }

html, body, #root { height: 100%; }

body {
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
  color: #211C17;
  background: #F6F1EA;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  line-height: 1.5;
}

button, input, textarea, select { font: inherit; color: inherit; }
button { cursor: pointer; border: none; background: none; }
button:disabled { cursor: not-allowed; }
textarea { resize: none; }
a { color: inherit; }

::selection { background: #FF5A2C; color: #fff; }

input::placeholder, textarea::placeholder { color: #B4AA9B; }

/* Focus: visible only for keyboard users, in the coral accent. */
:focus { outline: none; }
:focus-visible { outline: 2.5px solid #FF5A2C; outline-offset: 2px; border-radius: 6px; }

/* Quiet warm scrollbars inside the phone. */
.cc-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
.cc-scroll::-webkit-scrollbar-thumb { background: #DCD3C5; border-radius: 99px; }
.cc-scroll::-webkit-scrollbar-track { background: transparent; }
.cc-scroll { scrollbar-width: thin; scrollbar-color: #DCD3C5 transparent; }

@keyframes cc-fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes cc-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes cc-pop { 0% { transform: scale(.4); opacity: 0; } 60% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
@keyframes cc-spin { to { transform: rotate(360deg); } }
@keyframes cc-pulse-ring { 0% { transform: scale(.85); opacity: .55; } 80%, 100% { transform: scale(1.7); opacity: 0; } }
@keyframes cc-bar { 0%, 100% { transform: scaleY(.35); } 50% { transform: scaleY(1); } }
@keyframes cc-shimmer { 0% { background-position: -360px 0; } 100% { background-position: 360px 0; } }
@keyframes cc-rise { from { opacity: 0; transform: translateY(16px) scale(.99); } to { opacity: 1; transform: none; } }

/* Fill mode "backwards" (not "both"): the entrance plays from a hidden start, but
   the resting state is always the element's natural opacity — content can never get
   stuck invisible if the animation timeline is throttled or paused. */
.cc-anim-up { animation: cc-fade-up .42s cubic-bezier(.22,.8,.3,1) backwards; }
.cc-anim-in { animation: cc-fade-in .3s ease backwards; }
.cc-anim-rise { animation: cc-rise .5s cubic-bezier(.22,.8,.3,1) backwards; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
}
`;

export default function Style() {
  return <style dangerouslySetInnerHTML={{ __html: CSS }} />;
}
