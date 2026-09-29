// Everything dental-specific: the /dental page, signup, and which questions sessions pull.
// Plain data only — api/waitlist.js imports the registry too.
const dental = {
  slug: 'dental',
  name: 'Dental',
  displayName: 'Dental School',
  tag: 'Dental', // Firestore questions.mainTags value
  status: 'live', // 'live' | 'soon'
  cardBlurb: 'Practice “Why dentistry?”, the Big 3, and ethical scenarios.',
  landing: {
    audience: 'dental school',
    heroTitle: 'Nail Your Dental School Interviews.',
    heroSubtitle: 'Practice with mock interviews designed specifically for your profession. Get instant, actionable feedback and build confidence for your big day.',
    sampleQuestion: 'Why do you want to become a dentist?',
    credibility: 'founder', // full founder story; other programs get a short line or a reviewer
    reviewer: null, // { name, role, photo }: a real student who reviewed this program's questions
    formats: [
      { title: 'One-on-one and panel interviews', body: 'Most dental schools use conversational interviews with faculty, current students, or admissions staff.' },
      { title: 'Open-file vs. closed-file', body: 'Some interviewers have read your application; others know only your name. Be ready to tell your story from scratch either way.' },
      { title: 'The “Big 3”', body: 'Tell me about yourself, why dentistry, and why our school. Expect to answer all three.' },
    ],
    sampleQuestions: [
      'Why dentistry and not medicine?',
      'What have you learned from shadowing?',
      'Tell me about a time you worked through a conflict on a team.',
      'How would you help a patient who is anxious about treatment?',
      'What would you do if you saw a classmate cheating on an exam?',
    ],
    tipsTitle: 'Tips from someone who’s been through it',
    tips: [
      {
        title: 'Tell an honest ‘why dentistry’ story',
        body: 'Share how you discovered dentistry, what you observed in clinical settings, and the moments that confirmed your fit.',
      },
      {
        title: 'Reflect on exposure',
        body: 'Move past listing hours. Explain what you learned from shadowing/assisting and how it shaped your perspective.',
      },
      {
        title: 'Communication & trust matter',
        body: 'Expect scenarios about nervous patients, explaining procedures plainly, and building rapport under time pressure.',
      },
      {
        title: 'Teamwork over technicals',
        body: 'They’re looking for reliability, empathy, and collaboration — not drilling techniques in an interview.',
      },
    ],
    faqs: [],
  },
};

export default dental;
