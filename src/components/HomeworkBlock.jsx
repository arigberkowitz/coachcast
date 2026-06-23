import { NotebookPen, PlayCircle } from 'lucide-react';
import { T } from '../lib/sports';

// Only allow real http(s) links the coach pasted (it's shown to families).
function safeUrl(u) {
  if (!u) return null;
  try {
    const url = new URL(u);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

// The homework chip: the assignment, an optional how-to-practice line, and an
// optional "Watch the drill" link. Shared by the coach timeline and family portal.
export default function HomeworkBlock({ recap, brand }) {
  if (!recap.homework) return null;
  const link = safeUrl(recap.homeworkLink);
  return (
    <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: T.rSm, background: T.accentSoft }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <NotebookPen size={14} color={T.accentText} style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 13, lineHeight: 1.5, color: T.accentText }}>
          <strong style={{ fontWeight: 700 }}>{brand.recap.homework}:</strong> {recap.homework}
        </p>
      </div>
      {recap.homeworkHow && (
        <p style={{ fontSize: 12.5, lineHeight: 1.5, color: T.accentText, opacity: 0.85, margin: '6px 0 0', paddingLeft: 22 }}>
          {recap.homeworkHow}
        </p>
      )}
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, marginLeft: 22, fontSize: 12.5, fontWeight: 700, color: T.accentText }}
        >
          <PlayCircle size={14} strokeWidth={2.25} /> Watch the drill
        </a>
      )}
    </div>
  );
}
