import { useState } from 'react';
import { useStore, saveRecap, updateRecap } from '../data/store';
import TabBar from './TabBar';
import Today from './Today';
import Home from './Home';
import AthletePage from './AthletePage';
import Capture from './Capture';
import Review from './Review';
import Sent from './Sent';
import GroupPicker from './GroupPicker';
import GroupCapture from './GroupCapture';
import GroupReview from './GroupReview';

// Two root tabs (Today, Athletes) with push routes layered on top
// (Athlete → Capture → Review → Sent). The tab bar shows only at root;
// pushed screens are full-focus.
export default function PhoneApp() {
  const { athletes, groups: groupsRaw } = useStore();
  const groups = groupsRaw || [];
  const [tab, setTab] = useState('today');
  const [route, setRoute] = useState(null); // null = at root tab
  const [draft, setDraft] = useState(null);
  const [sentRecap, setSentRecap] = useState(null);
  const [groupDraft, setGroupDraft] = useState(null);

  const openAthlete = (id) => setRoute({ name: 'athlete', athleteId: id });
  const newRecap = (id) => {
    setDraft(null);
    setRoute({ name: 'capture', athleteId: id });
  };
  const newGroupRecap = () => setRoute({ name: 'groupPicker' });

  // A pushed athlete route needs a valid athlete; group routes carry a groupId.
  const athlete = route && route.athleteId ? athletes.find((a) => a.id === route.athleteId) : null;
  const isGroupRoute = route && ['groupPicker', 'groupCapture', 'groupReview'].includes(route.name);

  // ---- Root tabs ----
  if (!route || (!athlete && !isGroupRoute)) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div key={tab} style={{ flex: 1, minHeight: 0 }}>
          {tab === 'today' ? (
            <Today onNewRecap={newRecap} onOpenAthlete={openAthlete} onNewGroupRecap={newGroupRecap} />
          ) : (
            <Home onOpenAthlete={openAthlete} onNewRecap={newRecap} />
          )}
        </div>
        <TabBar active={tab} onChange={setTab} />
      </div>
    );
  }

  // ---- Group Recap routes ----
  if (isGroupRoute) {
    const group = route.groupId ? groups.find((g) => g.id === route.groupId) : null;
    const members = group ? group.memberIds.map((id) => athletes.find((a) => a.id === id)).filter(Boolean) : [];
    const toPicker = () => setRoute({ name: 'groupPicker' });
    let gscreen;
    if (route.name === 'groupCapture' && group) {
      gscreen = (
        <GroupCapture
          group={group}
          members={members}
          initialNote={groupDraft?.note || ''}
          onBack={toPicker}
          onGenerated={(recaps, meta) => {
            setGroupDraft({ recaps, ...meta });
            setRoute({ name: 'groupReview', groupId: group.id });
          }}
        />
      );
    } else if (route.name === 'groupReview' && group && groupDraft) {
      gscreen = (
        <GroupReview
          group={group}
          draft={groupDraft}
          onBack={() => setRoute({ name: 'groupCapture', groupId: group.id })}
          onDone={() => {
            setGroupDraft(null);
            setRoute(null);
          }}
        />
      );
    } else {
      // groupPicker, or a stale/invalid group/draft → back to the picker
      gscreen = <GroupPicker onBack={() => setRoute(null)} onStart={(gid) => setRoute({ name: 'groupCapture', groupId: gid })} />;
    }
    return (
      <div key={route.name} style={{ height: '100%' }}>
        {gscreen}
      </div>
    );
  }

  // ---- Pushed screens ----
  let screen;
  if (route.name === 'athlete') {
    screen = (
      <AthletePage
        athlete={athlete}
        onBack={() => setRoute(null)}
        onNewRecap={() => newRecap(athlete.id)}
        onEditRecap={(recap) => {
          setDraft({ ...recap, transcript: recap.note || '' });
          setRoute({ name: 'edit', athleteId: athlete.id, recapId: recap.id });
        }}
        onResumeDraft={(recap) => {
          setDraft({ sport: recap.sport, tone: recap.tone, transcript: recap.note || '', _draftId: recap.id });
          setRoute({ name: 'capture', athleteId: athlete.id });
        }}
      />
    );
  } else if (route.name === 'capture') {
    screen = (
      <Capture
        athlete={athlete}
        initial={draft ? { sport: draft.sport, tone: draft.tone, transcript: draft.transcript } : null}
        onBack={() => openAthlete(athlete.id)}
        onGenerated={(recap, meta) => {
          setDraft((d) => ({ ...recap, ...meta, _draftId: d?._draftId }));
          setRoute({ name: 'review', athleteId: athlete.id });
        }}
        onSaveNote={({ sport, tone, transcript }) => {
          const note = { sport, tone, note: transcript, headline: '', workedOn: [], improved: [], nextFocus: [], homework: '', parentMessage: '', sent: false };
          if (draft?._draftId) updateRecap(athlete.id, draft._draftId, note);
          else saveRecap(athlete.id, note);
          openAthlete(athlete.id);
        }}
      />
    );
  } else if (route.name === 'review') {
    screen = (
      <Review
        athlete={athlete}
        draft={draft}
        onBack={() => setRoute({ name: 'capture', athleteId: athlete.id })}
        onSend={(finalRecap) => {
          const saved = draft?._draftId
            ? updateRecap(athlete.id, draft._draftId, { ...finalRecap, sent: true })
            : saveRecap(athlete.id, finalRecap);
          setSentRecap(saved);
          setRoute({ name: 'sent', athleteId: athlete.id });
        }}
        onSaveDraft={(draftRecap) => {
          if (draft?._draftId) updateRecap(athlete.id, draft._draftId, { ...draftRecap, sent: false });
          else saveRecap(athlete.id, { ...draftRecap, sent: false });
          openAthlete(athlete.id);
        }}
      />
    );
  } else if (route.name === 'edit') {
    screen = (
      <Review
        athlete={athlete}
        draft={draft}
        editing
        onBack={() => openAthlete(athlete.id)}
        onSend={(finalRecap) => {
          updateRecap(athlete.id, route.recapId, finalRecap);
          openAthlete(athlete.id);
        }}
      />
    );
  } else if (route.name === 'sent') {
    screen = (
      <Sent
        athlete={athlete}
        recap={sentRecap}
        onViewTimeline={() => {
          setDraft(null);
          openAthlete(athlete.id);
        }}
        onDone={() => {
          setDraft(null);
          setRoute(null);
        }}
      />
    );
  }

  return <div key={`${route.name}:${route.athleteId}`} style={{ height: '100%' }}>{screen}</div>;
}
