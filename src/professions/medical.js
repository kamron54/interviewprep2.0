// Everything medicine-specific. Same shape as dental.js.
const medical = {
  slug: 'medical',
  name: 'Medical',
  displayName: 'Medical School',
  tag: 'Medical', // Firestore questions.mainTags value
  status: 'live',
  cardBlurb: 'Practice “Why medicine?”, ethical scenarios, and behavioral questions.',
  landing: {
    audience: 'medical school',
    heroTitle: 'Nail Your Medical School Interviews.',
    heroSubtitle: 'Practice with mock interviews designed specifically for your profession. Get instant, actionable feedback and build confidence for your big day.',
    sampleQuestion: 'Why do you want to become a doctor?',
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
