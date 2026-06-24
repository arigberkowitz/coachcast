import { useState } from 'react';
import { Users, Plus, ArrowRight, Pencil, Check, Trash2 } from 'lucide-react';
import { T, space } from '../lib/sports';
import { useStore, addGroup, updateGroup, deleteGroup } from '../data/store';
import { useBrand } from '../auth/BrandContext';
import { Avatar, PrimaryButton, IconButton, Eyebrow } from './ui';
import Screen from './Screen';

export default function GroupPicker({ onBack, onStart }) {
  const store = useStore();
  const groups = store.groups || [];
  const athletes = store.athletes || [];
  const { brand } = useBrand();
  const [form, setForm] = useState(null); // null | { id?, name, members:Set }

  const openNew = () => setForm({ name: '', members: new Set() });
  const openEdit = (g) => setForm({ id: g.id, name: g.name, members: new Set(g.memberIds) });
  const toggleMember = (id) =>
    setForm((f) => {
      const s = new Set(f.members);
      s.has(id) ? s.delete(id) : s.add(id);
      return { ...f, members: s };
    });
  const save = () => {
    const name = form.name.trim() || `Group of ${form.members.size}`;
    const ids = [...form.members];
    if (form.id) updateGroup(form.id, { name, memberIds: ids });
    else addGroup(name, ids);
    setForm(null);
  };

  // ---- create / edit form ----
  if (form) {
    const valid = form.members.size >= 2;
    return (
      <Screen
        title={form.id ? 'Edit group' : 'New group'}
        onBack={() => setForm(null)}
        footer={
          <PrimaryButton disabled={!valid} onClick={save}>
            {form.id ? 'Save group' : 'Create group'}
          </PrimaryButton>
        }
      >
        <input
          autoFocus
          placeholder="Group name (e.g. Tuesday Clinic)"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          style={{ width: '100%', padding: '12px 14px', borderRadius: T.rSm, border: `1.5px solid ${T.line}`, background: T.surface, fontSize: 15, marginBottom: 16, outline: 'none' }}
        />
        <Eyebrow style={{ marginBottom: 10 }}>Members{form.members.size > 0 ? ` · ${form.members.size}` : ''}</Eyebrow>
        {athletes.length === 0 ? (
          <div style={{ color: T.ink40, fontSize: 14 }}>Add some {brand.personPlural.toLowerCase()} first.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {athletes.map((a) => {
              const on = form.members.has(a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => toggleMember(a.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 11, borderRadius: T.r, border: `1.5px solid ${on ? T.accent : T.line}`, background: on ? T.accentSoft : T.surface, textAlign: 'left', transition: 'all .12s ease' }}
                >
                  <Avatar name={a.name} size={36} />
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 14.5, color: on ? T.accentText : T.ink }}>{a.name}</span>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', display: 'grid', placeItems: 'center', border: `2px solid ${on ? T.accent : T.lineStrong}`, background: on ? T.accent : 'transparent', color: '#fff' }}>
                    {on && <Check size={13} strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {!valid && <div style={{ fontSize: 12.5, color: T.ink40, marginTop: 10 }}>Pick at least two {brand.personPlural.toLowerCase()}.</div>}
        {form.id && (
          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <button
              onClick={() => { deleteGroup(form.id); setForm(null); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#B23B2E', padding: '6px 10px' }}
            >
              <Trash2 size={14} strokeWidth={2.25} /> Delete group
            </button>
          </div>
        )}
      </Screen>
    );
  }

  // ---- group list ----
  return (
    <Screen
      title="Group recap"
      onBack={onBack}
      footer={
        <PrimaryButton onClick={openNew}>
          <Plus size={17} strokeWidth={2.5} />
          New group
        </PrimaryButton>
      }
    >
      <p style={{ fontSize: 14.5, color: T.ink70, lineHeight: 1.5, marginBottom: 18 }}>
        Pick a group, record one note about the session, and {brand.name} writes a personalized recap for every {brand.person}'s family.
      </p>

      {groups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '34px 20px', color: T.ink40, fontSize: 14, border: `1px dashed ${T.lineStrong}`, borderRadius: T.r }}>
          No groups yet. Create one to send a single note to a whole team or class.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {groups.map((g) => {
            const members = g.memberIds.map((id) => athletes.find((a) => a.id === id)).filter(Boolean);
            const tooSmall = members.length < 2;
            return (
              <div key={g.id} style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r, padding: 14, boxShadow: T.shadowSoft }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 40, height: 40, borderRadius: 12, background: T.accentSoft, color: T.accent, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Users size={20} strokeWidth={2.1} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: space.display, fontWeight: 700, fontSize: 16.5, letterSpacing: '-.01em' }}>{g.name}</div>
                    <div style={{ fontSize: 12.5, color: T.ink40 }}>
                      {members.length} {members.length === 1 ? brand.person : brand.personPlural.toLowerCase()}
                    </div>
                  </div>
                  <IconButton label="Edit group" onClick={() => openEdit(g)}>
                    <Pencil size={17} color={T.ink70} />
                  </IconButton>
                </div>
                {members.length > 0 && (
                  <div style={{ display: 'flex', marginTop: 10, marginLeft: 2 }}>
                    {members.slice(0, 6).map((m, i) => (
                      <span key={m.id} style={{ marginLeft: i ? -8 : 0, borderRadius: '50%', boxShadow: `0 0 0 2px ${T.surface}` }}>
                        <Avatar name={m.name} size={28} />
                      </span>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => onStart(g.id)}
                  disabled={tooSmall}
                  style={{ width: '100%', marginTop: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', borderRadius: T.rSm, background: tooSmall ? '#DAD5D0' : T.accent, color: '#fff', fontWeight: 600, fontSize: 14 }}
                >
                  {tooSmall ? 'Add 2+ members to record' : 'Record group recap'}
                  {!tooSmall && <ArrowRight size={16} strokeWidth={2.5} />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Screen>
  );
}
