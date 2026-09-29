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
      'What are your three greatest strengths?',
      'Tell me about a time you failed and what you learned from it.',
      'What do you think are the biggest challenges facing the dental profession today?',
      'What would you do if a patient could not afford a necessary procedure?',
      'What would you do if you saw a classmate cheating on an exam?',
    ],
    tipsTitle: 'Tips from Kamron',
    tips: [
      {
        title: 'Tell an honest ‘why dentistry’ story',
        body: 'Share how you discovered dentistry, what parts of it specifically interest you (e.g., long-term patient relationships, public health, surgical precision), and what moments made you feel like “this is the right fit.”',
      },
      {
        title: 'Reflect on exposure',
        body: 'Whether you shadowed one general dentist or explored multiple specialties, you should be able to speak meaningfully about what you observed. It’s less about how much you saw and more about how you processed it. What surprised you? What challenged your assumptions?',
      },
      {
        title: 'Communication & trust matter',
        body: 'Dentists work closely with people who are often anxious or in pain. You may get questions about how you’d handle a nervous patient, explain a difficult procedure, or work with someone who doesn’t follow through on care. Think of times you built trust or navigated tough conversations.',
      },
      {
        title: 'Expect questions about teamwork',
        body: 'You probably won’t be asked about drilling a tooth, but you will be asked about how you function in teams. Think about school projects, work experiences, or volunteer settings where collaboration, reliability, or conflict resolution came up.',
      },
    ],
    faqs: [],
  },
};

export default dental;
