import { useState } from 'react';
import { Plus, X, Circle, CircleCheck } from 'lucide-react';
import { T } from '../lib/sports';
import { fmtDate } from '../lib/format';
import { addGoal, toggleGoal, deleteGoal } from '../data/store';
import { Eyebrow } from './ui';

function GoalRow({ athleteId, goal }) {
  const done = !!goal.achievedAt;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 2px' }}>
      <button
        onClick={() => toggleGoal(athleteId, goal.id)}
        aria-label={done ? 'Mark not achieved' : 'Mark achieved'}
        style={{ display: 'grid', placeItems: 'center', flexShrink: 0, color: done ? T.accent : T.ink40 }}
      >
        {done ? <CircleCheck size={19} strokeWidth={2.25} /> : <Circle size={19} strokeWidth={2} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: done ? T.ink40 : T.ink, textDecoration: done ? 'line-through' : 'none' }}>
          {goal.text}
        </div>
        {done && <div style={{ fontSize: 11.5, color: T.ink40 }}>Achieved {fmtDate(goal.achievedAt)}</div>}
      </div>
      <button onClick={() => deleteGoal(athleteId, goal.id)} aria-label="Remove goal" style={{ color: T.ink40, display: 'grid', placeItems: 'center', padding: 2, flexShrink: 0 }}>
        <X size={15} />
      </button>
    </div>
  );
}

export default function Goals({ athlete }) {
  const goals = athlete.goals || [];
  const active = goals.filter((g) => !g.achievedAt);
  const achieved = goals.filter((g) => g.achievedAt);
  const [text, setText] = useState('');

  const add = () => {
    if (!text.trim()) return;
    addGoal(athlete.id, text);
    setText('');
  };

  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Eyebrow>Goals</Eyebrow>
        {achieved.length > 0 && (
          <span style={{ fontSize: 11.5, fontWeight: 600, color: T.accentText, background: T.accentSoft, borderRadius: 999, padding: '2px 9px' }}>
            {achieved.length} achieved
          </span>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: T.surface,
          border: `1.5px solid ${T.line}`,
          borderRadius: T.r,
          padding: '8px 8px 8px 12px',
          marginBottom: goals.length ? 8 : 0,
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Set a goal to work toward…"
          aria-label="New goal"
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: T.ink }}
        />
        <button
          onClick={add}
          disabled={!text.trim()}
          aria-label="Add goal"
          style={{ width: 32, height: 32, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 9, background: text.trim() ? T.accentSoft : 'transparent', color: text.trim() ? T.accentText : T.ink40 }}
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      </div>

      {(active.length > 0 || achieved.length > 0) && (
        <div>
          {active.map((g) => (
            <GoalRow key={g.id} athleteId={athlete.id} goal={g} />
          ))}
          {achieved.map((g) => (
            <GoalRow key={g.id} athleteId={athlete.id} goal={g} />
          ))}
        </div>
      )}
    </div>
  );
}
