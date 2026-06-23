import { useState } from 'react';
import { useStore, saveRecap, updateRecap } from '../data/store';
import TabBar from './TabBar';
import Today from './Today';
import Home from './Home';
import AthletePage from './AthletePage';
import Capture from './Capture';
import Review from './Review';
import Sent from './Sent';

// Two root tabs (Today, Athletes) with push routes layered on top
// (Athlete → Capture → Review → Sent). The tab bar shows only at root;
// pushed screens are full-focus.
export default function PhoneApp() {
  const { athletes } = useStore();
  const [tab, setTab] = useState('today');
  const [route, setRoute] = useState(null); // null = at root tab
  const [draft, setDraft] = useState(null);
  const [sentRecap, setSentRecap] = useState(null);

  const openAthlete = (id) => setRoute({ name: 'athlete', athleteId: id });
  const newRecap = (id) => {
    setDraft(null);
    setRoute({ name: 'capture', athleteId: id });
  };

  // A pushed route needs a valid athlete; otherwise fall back to the root tabs.
  const athlete = route ? athletes.find((a) => a.id === route.athleteId) : null;

  // ---- Root tabs ----
  if (!route || !athlete) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div key={tab} style={{ flex: 1, minHeight: 0 }}>
          {tab === 'today' ? (
            <Today onNewRecap={newRecap} onOpenAthlete={openAthlete} />
          ) : (
            <Home onOpenAthlete={openAthlete} onNewRecap={newRecap} />
          )}
        </div>
        <TabBar active={tab} onChange={setTab} />
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
      />
    );
  } else if (route.name === 'capture') {
    screen = (
      <Capture
        athlete={athlete}
        initial={draft ? { sport: draft.sport, tone: draft.tone, transcript: draft.transcript } : null}
        onBack={() => openAthlete(athlete.id)}
        onGenerated={(recap, meta) => {
          setDraft({ ...recap, ...meta });
          setRoute({ name: 'review', athleteId: athlete.id });
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
          const saved = saveRecap(athlete.id, finalRecap);
          setSentRecap(saved);
          setRoute({ name: 'sent', athleteId: athlete.id });
        }}
        onSaveDraft={(draftRecap) => {
          saveRecap(athlete.id, { ...draftRecap, sent: false });
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
