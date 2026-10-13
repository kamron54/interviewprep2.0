// Everything medicine-specific. Same shape as dental.js.
const medical = {
  slug: 'medical',
  name: 'Medical',
  displayName: 'Medical School',
  tag: 'Medical', // Firestore questions.mainTags value
  status: 'live',
  landing: {
    audience: 'medical school',
    heroTitle: 'Practice your medical school interview before the real one.',
    heroSubtitle: 'Work through ethical scenarios and traditional questions on camera, watch yourself back, and get feedback on every answer.',
    // The program's block on the homepage (bootcamp.com-style)
    block: {
      overline: 'Medicine',
      tagline: 'MMI stations, traditional interviews, and “why medicine?”',
      points: [
        'Ethical scenarios to reason through out loud',
        'Video or audio, up to 3 minutes per answer',
        'Feedback on every answer, plus your recording to watch back',
      ],
    },
    // Real students' quotes go here (see dental.js); until then the homepage block shows a sample question
    quotes: [],
    credibility: 'short',
    reviewer: null, // { name, role, photo }: e.g. a current med student who reviewed the question bank
    formats: [
      { title: 'Multiple mini interviews (MMI)', body: 'Many medical schools use MMI: a series of short, timed stations, each built around an ethical dilemma, scenario, or question.' },
      { title: 'Traditional interviews', body: 'One-on-one or panel conversations about your experiences, motivation, and fit with the school.' },
      { title: '“Why medicine?”', body: 'Expect some version of it everywhere, usually alongside “Tell me about yourself” and “Why our school?”' },
    ],
    sampleQuestions: [
      'Why medicine and not nursing or physician assistant?',
      'Tell me about a time you made a mistake. What did you learn?',
      'A patient refuses a treatment you believe they need. What do you do?',
      'What do you think is the biggest challenge facing healthcare today?',
      'Tell me about a meaningful clinical experience.',
    ],
    tipsTitle: 'What interviewers look for',
    tips: [
      { title: 'Know your “why medicine” story', body: 'Ground it in specific experiences with patients, not just an interest in science.' },
      { title: 'Reason through ethics out loud', body: 'Interviewers care more about how you weigh options and people than about one “right” answer.' },
      { title: 'Show teamwork, not heroics', body: 'Medicine is a team effort. Highlight how you work with, and learn from, others.' },
      { title: 'Keep the patient at the center', body: 'Tie your answers back to patient-centered communication and care.' },
    ],
    faqs: [],
  },
};

export default medical;
