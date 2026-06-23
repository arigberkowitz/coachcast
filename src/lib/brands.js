// The two branded "worlds". Each carries its identity (name, accent palette,
// vocabulary, category list, recap-section labels), its auth copy, and its seed
// data. Choosing a side at the landing makes one of these the active brand, which
// drives theming (CSS vars) and vocabulary everywhere.
import { SPORTS, SUBJECTS } from './sports';

// ---- seed data ---------------------------------------------------------------

const coachSeed = [
  {
    id: 'a_maya', name: 'Maya Chen', age: 9, sport: 'basketball',
    goals: [
      { id: 'g_maya_1', text: 'Finish layups with both hands', createdAt: '2026-05-18T00:00:00.000Z', achievedAt: null },
      { id: 'g_maya_2', text: 'Dribble with head up', createdAt: '2026-05-05T00:00:00.000Z', achievedAt: '2026-06-02T00:00:00.000Z' },
    ],
    recaps: [
      { id: 'r_maya_1', athleteId: 'a_maya', createdAt: '2026-06-09T17:40:00.000Z', sport: 'basketball', tone: 'warm', note: 'worked on layups off both feet, still rushing the second step. great energy today.', headline: 'Layups are getting smoother', workedOn: ['Layups off both feet', 'Slowing the approach'], improved: ['Right-hand finish at the rim'], nextFocus: ['Left-hand layups under control'], parentMessage: "Maya had a great session. We spent most of it on layups, and her right-hand finish is really coming along — she's getting the footwork right more often than not. She still speeds up on the second step when she gets excited, so next time we'll slow that down and add her left hand. She works hard and it shows.", sent: true },
      { id: 'r_maya_2', athleteId: 'a_maya', createdAt: '2026-06-02T17:30:00.000Z', sport: 'basketball', tone: 'warm', note: 'dribbling with head up, ball control drills. doing well keeping eyes up.', headline: 'Dribbling with her head up', workedOn: ['Ball control', 'Keeping eyes up while dribbling'], improved: ['Confidence with the left hand'], nextFocus: ['Changing speed off the dribble'], parentMessage: "Good session today. Maya is starting to keep her head up while she dribbles instead of staring at the ball, which is a big step. Her left hand is getting more comfortable too. Next week we'll work on changing speeds so defenders can't settle.", sent: true },
    ],
  },
  {
    id: 'a_diego', name: 'Diego Ramirez', age: 13, sport: 'soccer',
    recaps: [
      { id: 'r_diego_1', athleteId: 'a_diego', createdAt: '2026-06-11T22:15:00.000Z', sport: 'soccer', tone: 'technical', note: 'first touch under pressure, receiving on the half turn. needs to check shoulder more.', headline: 'First touch under pressure', workedOn: ['Receiving on the half-turn', 'Scanning before the ball arrives'], improved: ['Cushioning the first touch'], nextFocus: ['Checking his shoulder before receiving'], parentMessage: "Diego put in a strong session focused on his first touch when a defender is close. He's getting better at opening his body to receive on the half-turn, which lets him play forward faster. The next thing is scanning — checking over his shoulder before the ball comes so he already knows his options. He's a thoughtful player and picks this up quickly.", sent: true },
      { id: 'r_diego_2', athleteId: 'a_diego', createdAt: '2026-06-04T22:00:00.000Z', sport: 'soccer', tone: 'straight', note: 'passing range, weighting longer balls. accuracy good, weight inconsistent.', headline: 'Working the longer pass', workedOn: ['Passing range', 'Weighting longer balls'], improved: ['Accuracy over 20+ yards'], nextFocus: ['Consistent weight on the driven pass'], parentMessage: "We worked on Diego's longer passing today. His accuracy over distance is good — the thing to tighten up is the weight, so the ball arrives at a pace his teammate can actually use. We'll keep drilling it.", sent: true },
    ],
  },
  {
    id: 'a_ava', name: 'Ava Thompson', age: 11, sport: 'tennis',
    recaps: [
      { id: 'r_ava_1', athleteId: 'a_ava', createdAt: '2026-06-10T20:00:00.000Z', sport: 'tennis', tone: 'warm', note: 'forehand topspin, low to high swing path. great improvement on follow through.', headline: 'Forehand has real topspin now', workedOn: ['Forehand topspin', 'Low-to-high swing path'], improved: ['Follow-through over the shoulder'], nextFocus: ['Recovering to the middle after the shot'], parentMessage: "Ava had a really good lesson. Her forehand is starting to have proper topspin — she's brushing up the back of the ball and finishing over her shoulder instead of pushing it. It's a noticeable change. Next time we'll add footwork so she recovers to the middle after she hits. She's a pleasure to coach.", sent: true },
    ],
  },
  {
    id: 'a_liam', name: "Liam O'Brien", age: 8, sport: 'golf',
    recaps: [
      { id: 'r_liam_1', athleteId: 'a_liam', createdAt: '2026-06-08T15:30:00.000Z', sport: 'golf', tone: 'warm', note: 'grip and setup, putting from 6 feet. loves it, attention wanders a bit.', headline: 'Solid grip, fun on the greens', workedOn: ['Grip and setup', 'Putting from six feet'], improved: ['Keeping his head still over putts'], nextFocus: ['A steady, repeatable pre-putt routine'], parentMessage: "Liam had a fun session. We sorted out his grip and setup, which makes everything easier, and he sank a few six-footers by keeping his head still. He's full of energy — sometimes his focus wanders, so we'll build a little routine before each putt to help him settle. Great attitude.", sent: true },
    ],
  },
  {
    id: 'a_noah', name: 'Noah Williams', age: 15, sport: 'baseball',
    recaps: [
      { id: 'r_noah_1', athleteId: 'a_noah', createdAt: '2026-06-12T23:10:00.000Z', sport: 'baseball', tone: 'technical', note: 'hitting, staying back on offspeed, hands inside the ball. pulling off some.', headline: 'Staying back on offspeed', workedOn: ['Staying back on offspeed pitches', 'Keeping hands inside the ball'], improved: ['Weight transfer timing'], nextFocus: ['Keeping his front shoulder closed'], parentMessage: "Noah had a productive hitting session. He's doing a better job staying back on offspeed pitches instead of lunging, and his hands are staying inside the ball. The next thing is keeping his front shoulder closed a beat longer so he doesn't pull off — when he does that, the contact is much harder. He's putting in the work.", sent: true },
      { id: 'r_noah_2', athleteId: 'a_noah', createdAt: '2026-06-05T23:00:00.000Z', sport: 'baseball', tone: 'straight', note: 'infield, footwork on grounders, glove out front. clean transfers.', headline: 'Cleaner work in the infield', workedOn: ['Footwork on grounders', 'Fielding the ball out front'], improved: ['Glove-to-hand transfers'], nextFocus: ['Charging slow rollers'], parentMessage: "Good infield session. Noah is fielding the ball out front and his transfers are quick and clean. Next time we'll work on charging slow rollers so he has time to make the throw.", sent: true },
    ],
  },
];

const tutorSeed = [
  {
    id: 's_sofia', name: 'Sofia Reyes', age: 12, sport: 'math',
    goals: [
      { id: 'g_sofia_1', text: 'Add & subtract fractions confidently', createdAt: '2026-05-22T00:00:00.000Z', achievedAt: null },
      { id: 'g_sofia_2', text: 'Multiplication facts through 10', createdAt: '2026-05-01T00:00:00.000Z', achievedAt: '2026-06-11T00:00:00.000Z' },
    ],
    recaps: [
      { id: 'r_sofia_1', athleteId: 's_sofia', createdAt: '2026-06-18T22:00:00.000Z', sport: 'math', tone: 'warm', note: 'fractions, adding with unlike denominators. getting common denominators now.', headline: 'Fractions are clicking', workedOn: ['Adding fractions with unlike denominators', 'Finding common denominators'], improved: ['Spotting the lowest common denominator quickly'], nextFocus: ['Subtracting mixed numbers'], parentMessage: "Sofia had a really good session. Adding fractions with different denominators was tripping her up, and today it clicked — she's finding common denominators on her own now instead of guessing. Next time we'll move on to subtracting mixed numbers. She stuck with the hard problems and it paid off.", sent: true },
      { id: 'r_sofia_2', athleteId: 's_sofia', createdAt: '2026-06-11T22:00:00.000Z', sport: 'math', tone: 'straight', note: 'multiplication facts speed, 6s and 7s shaky. flashcards helped.', headline: 'Sharpening multiplication facts', workedOn: ['Multiplication facts', 'Speed on the 6s and 7s'], improved: ['Recall on the 8s'], nextFocus: ['Timed practice on 6s and 7s'], parentMessage: "We drilled multiplication facts today. Her 8s are solid now; the 6s and 7s are still a beat slow, so a few minutes of flashcards at home would help. Good focus throughout.", sent: true },
    ],
  },
  {
    id: 's_marcus', name: 'Marcus Bell', age: 16, sport: 'testprep',
    recaps: [
      { id: 'r_marcus_1', athleteId: 's_marcus', createdAt: '2026-06-20T20:30:00.000Z', sport: 'testprep', tone: 'technical', note: 'SAT reading, evidence questions, pacing on the passage. timing better.', headline: 'Pacing up on SAT reading', workedOn: ['Evidence-based reading questions', 'Pacing per passage'], improved: ['Eliminating two wrong answers first'], nextFocus: ['Inference questions under time'], parentMessage: "Marcus made real progress on the reading section. He's getting through each passage with time to spare now, and his approach of ruling out the two clearly-wrong answers first is cutting his mistakes. The next focus is inference questions, which are still where he loses the most points. Solid, disciplined work today.", sent: true },
      { id: 'r_marcus_2', athleteId: 's_marcus', createdAt: '2026-06-13T20:30:00.000Z', sport: 'testprep', tone: 'straight', note: 'SAT math no-calc, algebra word problems, translating to equations.', headline: 'Translating word problems', workedOn: ['No-calculator algebra', 'Turning word problems into equations'], improved: ['Setting up systems of equations'], nextFocus: ['Exponent rules'], parentMessage: "We worked the no-calculator math section. Marcus is better at translating word problems into equations, which was the main gap. Next time we'll review exponent rules. He's steady and prepared each week.", sent: true },
    ],
  },
  {
    id: 's_priya', name: 'Priya Nair', age: 9, sport: 'reading',
    recaps: [
      { id: 'r_priya_1', athleteId: 's_priya', createdAt: '2026-06-19T21:00:00.000Z', sport: 'reading', tone: 'warm', note: 'reading comprehension, retelling the story in order. sounding out longer words.', headline: 'Retelling stories in order', workedOn: ['Reading comprehension', 'Retelling events in sequence'], improved: ['Sounding out longer words'], nextFocus: ['Finding the main idea'], parentMessage: "Priya had a lovely session. She can now retell a story in the right order, which shows she's really following what she reads, and she's braver about sounding out longer words. Next time we'll work on finding the main idea of a passage. Reading a few minutes together at home would keep this momentum going.", sent: true },
    ],
  },
  {
    id: 's_ethan', name: 'Ethan Cole', age: 16, sport: 'science',
    recaps: [
      { id: 'r_ethan_1', athleteId: 's_ethan', createdAt: '2026-06-10T23:30:00.000Z', sport: 'science', tone: 'technical', note: 'chemistry, balancing equations, mole ratios. conceptual gap on conservation of mass.', headline: 'Balancing chemical equations', workedOn: ['Balancing chemical equations', 'Mole ratios'], improved: ['Conservation of mass intuition'], nextFocus: ['Stoichiometry word problems'], parentMessage: "Ethan and I worked through balancing equations today. Once the idea that mass is conserved really landed, the balancing got much easier for him. Next session we'll apply it to stoichiometry word problems, which is where the unit is heading. He asks good questions.", sent: true },
    ],
  },
  {
    id: 's_hana', name: 'Hana Kim', age: 13, sport: 'spanish',
    recaps: [
      { id: 'r_hana_1', athleteId: 's_hana', createdAt: '2026-06-21T19:00:00.000Z', sport: 'spanish', tone: 'warm', note: 'past tense, preterite vs imperfect, conversation practice. confidence growing.', headline: 'Past tense in conversation', workedOn: ['Preterite vs. imperfect', 'Speaking in full sentences'], improved: ['Confidence talking out loud'], nextFocus: ['Irregular preterite verbs'], parentMessage: "Hana had a great lesson. She's starting to feel the difference between the two past tenses instead of memorizing rules, and she spoke in full sentences for most of the session — a big confidence step. Next time we'll tackle the irregular preterite verbs. She's a joy to teach.", sent: true },
      { id: 'r_hana_2', athleteId: 's_hana', createdAt: '2026-06-14T19:00:00.000Z', sport: 'spanish', tone: 'straight', note: 'vocabulary, food and family units. quizzed, retention good.', headline: 'Strong vocabulary retention', workedOn: ['Food and family vocabulary', 'Quick recall'], improved: ['Spelling accents correctly'], nextFocus: ['Using new words in sentences'], parentMessage: "We covered the food and family vocabulary units. Hana's retention is strong and she's getting the accent marks right. Next time we'll practice using the words in her own sentences rather than just translating.", sent: true },
    ],
  },
];

// ---- brands ------------------------------------------------------------------

export const BRANDS = {
  coach: {
    id: 'coach',
    name: 'CoachCast',
    storeKey: 'coachcast.v1',
    person: 'athlete',
    personPlural: 'Athletes',
    categoryLabel: 'Sport',
    categories: SPORTS,
    recap: { workedOn: 'Worked on', improved: 'Improved', nextFocus: 'Up next' },
    accent: { accent: '#FF5A2C', accentText: '#C5400F', accentSoft: '#FFEDE5', accentSoft2: '#FFDDCF', accentGlow: 'rgba(255,90,44,.7)' },
    auth: {
      eyebrow: 'Coach sign-in',
      heroLine1: 'Recaps parents',
      heroLine2: 'actually read.',
      subhead: 'After a session, talk for twenty seconds. CoachCast writes the parent update in your voice — you review it and send.',
      footnote: 'Built for independent youth sports coaches — basketball, golf, tennis, baseball, soccer.',
      sample: {
        for: "For Maya's parent",
        headline: 'Layups are getting smoother',
        body: "Maya had a great session. Her right-hand finish at the rim is really coming along, and she's getting the footwork right more often than not…",
        tags: ['Footwork', 'Right-hand finish'],
      },
    },
    chooser: { title: 'I coach a sport', sub: 'Basketball, golf, tennis, baseball, soccer' },
    seed: coachSeed,
  },
  tutor: {
    id: 'tutor',
    name: 'TutorCast',
    storeKey: 'tutorcast.v1',
    person: 'student',
    personPlural: 'Students',
    categoryLabel: 'Subject',
    categories: SUBJECTS,
    recap: { workedOn: 'Covered today', improved: 'Strengths', nextFocus: 'Next focus' },
    accent: { accent: '#4C56D6', accentText: '#343CA0', accentSoft: '#ECEEFC', accentSoft2: '#DADDF6', accentGlow: 'rgba(76,86,214,.6)' },
    auth: {
      eyebrow: 'Tutor sign-in',
      heroLine1: 'Progress parents',
      heroLine2: 'actually read.',
      subhead: 'After a session, talk for twenty seconds. TutorCast writes the parent update in your voice — you review it and send.',
      footnote: 'Built for independent tutors — math, reading, science, test prep, and more.',
      sample: {
        for: "For Sofia's parent",
        headline: 'Fractions are clicking',
        body: "Sofia had a really good session. Adding fractions with different denominators finally clicked — she's finding common denominators on her own now…",
        tags: ['Fractions', 'Common denominators'],
      },
    },
    chooser: { title: 'I tutor a subject', sub: 'Math, reading, science, test prep, languages, and more' },
    seed: tutorSeed,
  },
};

export const getBrand = (id) => BRANDS[id] || BRANDS.coach;
