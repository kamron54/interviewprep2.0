import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import Button from "../components/Button";

export default function InterviewTips() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const [openPanels, setOpenPanels] = useState({});
  const togglePanel = (key) =>
    setOpenPanels((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="px-6 py-16 max-w-5xl mx-auto">
      <h1 className="text-4xl font-semibold mb-6">Interview Tips</h1>

      <div className="space-y-6 mb-8">
        <div className="bg-gray-50 p-6 rounded-lg text-gray-700 leading-relaxed">
          <h3 className="text-2xl font-semibold">Know Your "Why"</h3>
          <p className="mt-2 text-lg">
            Every interviewer wants to know: Why this profession? Your answer
            should reflect authentic experiences—clinical exposure, shadowing,
            personal stories—not generic answers like "I want to help people."
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg text-gray-700 leading-relaxed">
          <h3 className="text-2xl font-semibold">
            Practice Behavioral and Situational Questions
          </h3>
          <p className="mt-2 text-lg">
            Use the STAR method (Situation, Task, Action, Result). Be ready to
            discuss:
          </p>
          <ul className="list-disc list-inside pl-5 mt-2 space-y-1 text-lg">
            <li>A time you faced conflict or failure</li>
            <li>Ethical dilemmas</li>
            <li>Leadership experiences</li>
            <li>Moments of empathy or resilience</li>
          </ul>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg text-gray-700 leading-relaxed">
          <h3 className="text-2xl font-semibold">Show Core Competencies</h3>
          <p className="mt-2 text-lg">
            Demonstrate the following throughout your answers:
          </p>
          <ul className="list-disc list-inside pl-5 mt-2 space-y-1 text-lg">
            <li>Empathy</li>
            <li>Communication</li>
            <li>Integrity</li>
            <li>Teamwork</li>
            <li>Adaptability</li>
            <li>Accountability</li>
          </ul>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg text-gray-700 leading-relaxed">
          <h3 className="text-2xl font-semibold">Research the School</h3>
          <p className="mt-2 text-lg">
            Tailor your responses to each program. Know their curriculum
            structure, mission, unique opportunities, and how you align with
            them.
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg text-gray-700 leading-relaxed">
          <h3 className="text-2xl font-semibold">Practice With Real Tools</h3>
          <p className="mt-2 text-lg">
            Simulate interviews on our website. Practice eye contact, posture,
            timing, and tone. Reviewing recordings can dramatically improve
            your delivery.
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg text-gray-700 leading-relaxed">
          <h3 className="text-2xl font-semibold">Prepare Questions</h3>
          <p className="mt-2 text-lg">Always ask thoughtful, genuine questions:</p>
          <ul className="list-disc list-inside pl-5 mt-2 space-y-1 text-lg">
            <li>"What do students find most rewarding here?"</li>
            <li>"How does your program support student wellness or diversity?"</li>
          </ul>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg text-gray-700 leading-relaxed">
          <h3 className="text-2xl font-semibold">Stay Calm and Authentic</h3>
          <p className="mt-2 text-lg">
            Interviews assess how you think, not just what you know. It’s okay to
            pause and reflect before answering. Authenticity beats perfection.
          </p>
        </div>
      </div>

{/* Divider title */}
<h2 className="text-3xl font-semibold mt-12 mb-6">
  Profession‑Specific Interview Tips
</h2>

{/* Medical School (MD/DO) Accordion */}
<div className="bg-gray-50 rounded-lg mb-6 shadow-sm">
  <button
    id="btn-medical"
    onClick={() => togglePanel("medical")}
    aria-expanded={openPanels.medical || false}
    aria-controls="panel-medical"
    className="w-full flex items-center justify-between px-6 py-4 focus:outline-none"
  >
    <h3 className="text-2xl font-semibold">🧬 Medical School (MD/DO)</h3>
    <svg
      className={`w-5 h-5 transform transition-transform duration-200 ${
        openPanels.medical ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </button>

  {openPanels.medical && (
    <div
      id="panel-medical"
      role="region"
      aria-labelledby="btn-medical"
      className="px-6 pb-6"
    >
      <div className="space-y-6">
        <div>
          <h4 className="text-xl font-semibold">
            Drop the “I want to help people” line and tell your story
          </h4>
          <p className="mt-1 text-lg text-gray-700">
            Interviewers want to know why medicine makes sense for you. That
            could mean a personal health experience, time spent shadowing,
            or even realizing that you’re drawn to problem-solving in complex,
            high-stakes environments. The best answers are specific and rooted
            in real moments.
          </p>
        </div>

        <div>
          <h4 className="text-xl font-semibold">
            Be able to explain how your understanding of medicine evolved
          </h4>
          <p className="mt-1 text-lg text-gray-700">
            It’s okay if you didn’t always want to be a doctor. What matters is
            that you can trace your thought process: what you saw, what you
            questioned, what solidified your interest. Show that you’ve done
            more than dip a toe in — you’ve reflected on what the job really is.
          </p>
        </div>

        <div>
          <h4 className="text-xl font-semibold">
            Expect ethical, social, and systems-based questions
          </h4>
          <p className="mt-1 text-lg text-gray-700">
            You’ll likely get questions on topics like healthcare access,
            physician burnout, or patient autonomy. You don’t need perfect
            answers — just clear thinking, open‑mindedness, and a sense of
            nuance. They’re looking for maturity, not policy expertise.
          </p>
        </div>

        <div>
          <h4 className="text-xl font-semibold">Be human</h4>
          <p className="mt-1 text-lg text-gray-700">
            Some applicants fall into the trap of trying to sound robotic or
            hyper‑professional. Don’t do that. Let your personality come
            through. If you’re funny, be a little funny. If you’re thoughtful,
            slow down and think aloud. You’ll stand out more by being yourself
            than by checking boxes.
          </p>
        </div>

        <div>
          <h4 className="text-xl font-semibold">
            Know why this school — but don’t overdo it
          </h4>
          <p className="mt-1 text-lg text-gray-700">
            You should know enough to answer, “Why here?” — think curriculum
            model, clinical exposure, values, or culture. But don’t
            over‑sell it or list facts from their website. One or two genuine
            connections go further than a rehearsed pitch.
          </p>
        </div>

        <div>
          <h4 className="text-xl font-semibold">
            MMI? Practice reacting, not performing
          </h4>
          <p className="mt-1 text-lg text-gray-700">
            For Multiple Mini Interviews (MMIs), you’ll need to think on your
            feet. You might role‑play or analyze ethical scenarios. The key
            isn’t to be “correct,” it’s to show how you think — are you
            empathetic, organized, ethical, and reasonable under pressure?
          </p>
        </div>
      </div>
    </div>
  )}
</div>
{/* Dental School (DDS/DMD) Accordion */}
<div className="bg-gray-50 rounded-lg mb-6 shadow-sm">
  <button
    id="btn-dental"
    onClick={() => togglePanel("dental")}
    aria-expanded={openPanels.dental || false}
    aria-controls="panel-dental"
    className="w-full flex items-center justify-between px-6 py-4 focus:outline-none"
  >
    <h3 className="text-2xl font-semibold">🦷 Dental School (DDS/DMD)</h3>
    <svg
      className={`w-5 h-5 transform transition-transform duration-200 ${
        openPanels.dental ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </button>

  {openPanels.dental && (
    <div
      id="panel-dental"
      role="region"
      aria-labelledby="btn-dental"
      className="px-6 pb-6 space-y-6"
    >
      <div>
        <h4 className="text-xl font-semibold">
          Don’t overthink “why dentistry” — just tell your story
        </h4>
        <p className="mt-1 text-lg text-gray-700">
          Most interviewers aren't looking for a perfect answer. They're looking
          for something real. Be honest about how you discovered dentistry, what
          parts of it specifically interest you (e.g., long-term patient
          relationships, public health, surgical precision), and what moments
          made you feel like “this is the right fit.”
        </p>
      </div>

      <div>
        <h4 className="text-xl font-semibold">
          Know your exposure — and reflect on it
        </h4>
        <p className="mt-1 text-lg text-gray-700">
          Whether you shadowed one general dentist or explored multiple
          specialties, you should be able to speak meaningfully about what you
          observed. It’s less about how much you saw and more about how you
          processed it. What surprised you? What challenged your assumptions?
        </p>
      </div>

      <div>
        <h4 className="text-xl font-semibold">
          Be ready to talk about communication and trust
        </h4>
        <p className="mt-1 text-lg text-gray-700">
          Dentists work closely with people who are often anxious or in pain.
          You may get questions about how you’d handle a nervous patient,
          explain a difficult procedure, or work with someone who doesn’t
          follow through on care. Think of times you've built trust or
          navigated tough conversations.
        </p>
      </div>

      <div>
        <h4 className="text-xl font-semibold">
          Expect questions about teamwork — not just technical skills
        </h4>
        <p className="mt-1 text-lg text-gray-700">
          You probably won’t be asked about drilling a tooth, but you will be
          asked about how you function in teams. Think about school projects,
          work experiences, or volunteer settings where collaboration,
          reliability, or conflict resolution came up.
        </p>
      </div>

      <div>
        <h4 className="text-xl font-semibold">
          You don’t need to have it all figured out
        </h4>
        <p className="mt-1 text-lg text-gray-700">
          You don’t need to know whether you’ll specialize or stay in general
          practice. You just need to show curiosity, teachability, and that
          you’ve started thinking about your place in the profession.
        </p>
      </div>

      <div>
        <h4 className="text-xl font-semibold">
          Know what kind of dentist you don’t want to be
        </h4>
        <p className="mt-1 text-lg text-gray-700">
          This one’s subtle but powerful. You can show maturity by reflecting
          on what didn’t appeal to you in your shadowing or research — and how
          that shaped what you’re looking for in your career.
        </p>
      </div>
    </div>
  )}
</div>
{/* Physical Therapy (DPT) Accordion */}
<div className="bg-gray-50 rounded-lg mb-6 shadow-sm">
  <button
    id="btn-pt"
    onClick={() => togglePanel("pt")}
    aria-expanded={openPanels.pt || false}
    aria-controls="panel-pt"
    className="w-full flex items-center justify-between px-6 py-4 focus:outline-none"
  >
    <h3 className="text-2xl font-semibold">🏋 Physical Therapy (DPT)</h3>
    <svg
      className={`w-5 h-5 transform transition-transform duration-200 ${
        openPanels.pt ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </button>

  {openPanels.pt && (
    <div
      id="panel-pt"
      role="region"
      aria-labelledby="btn-pt"
      className="px-6 pb-6 space-y-6"
    >
      <div>
        <h4 className="text-xl font-semibold">
          Be ready to explain why PT over other healthcare fields.
        </h4>
        <p className="mt-1 text-lg text-gray-700">
          It’s a common question, especially since some applicants start pre‑med
          or pre‑PA. Interviewers want to know what drew you to movement-based,
          long-term, hands-on care. Talk about what you saw or experienced that
          made PT feel like the right fit — rehab after injury, sports medicine,
          neuro recovery, etc.
        </p>
      </div>

      <div>
        <h4 className="text-xl font-semibold">
          Reflect on your patient interactions.
        </h4>
        <p className="mt-1 text-lg text-gray-700">
          Most applicants shadow a lot. What separates you is your reflection.
          What did you learn about working with people in pain? About building
          trust over time? About motivating someone who wants to give up? These
          are core to PT, so your stories matter.
        </p>
      </div>

      <div>
        <h4 className="text-xl font-semibold">Show emotional intelligence.</h4>
        <p className="mt-1 text-lg text-gray-700">
          PTs deal with patients at their most frustrated, vulnerable, or
          discouraged. You might get questions like: “What would you say to a
          patient who’s not making progress?” or “How would you respond to
          someone who’s angry or uncooperative?” Stay calm, empathetic, and
          focused on partnership.
        </p>
      </div>

      <div>
        <h4 className="text-xl font-semibold">Be aware of PT’s challenges.</h4>
        <p className="mt-1 text-lg text-gray-700">
          Student debt, insurance limitations, productivity pressures — you
          don’t have to pretend PT is perfect. But showing that you’ve thought
          about these things (and still want in) makes you look mature and
          grounded.
        </p>
      </div>

      <div>
        <h4 className="text-xl font-semibold">Talk movement.</h4>
        <p className="mt-1 text-lg text-gray-700">
          If you have experience in sports, yoga, strength training, or rehab,
          bring it up — it shows you think in terms of body mechanics, not just
          biology.
        </p>
      </div>
    </div>
  )}
</div>
{/* Physician Assistant (PA) Accordion */}
<div className="bg-gray-50 rounded-lg mb-6 shadow-sm">
  <button
    id="btn-pa"
    onClick={() => togglePanel("pa")}
    aria-expanded={openPanels.pa || false}
    aria-controls="panel-pa"
    className="w-full flex items-center justify-between px-6 py-4 focus:outline-none"
  >
    <h3 className="text-2xl font-semibold">🩺 Physician Assistant (PA)</h3>
    <svg
      className={`w-5 h-5 transform transition-transform duration-200 ${
        openPanels.pa ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </button>

  {openPanels.pa && (
    <div
      id="panel-pa"
      role="region"
      aria-labelledby="btn-pa"
      className="px-6 pb-6 space-y-6"
    >
      <div>
        <h4 className="text-xl font-semibold">
          Be very clear on why you chose PA over MD or NP.
        </h4>
        <p className="mt-1 text-lg text-gray-700">
          This question comes up a lot, and you need more than surface‑level reasons.
          Talk about what you value in the PA role — lateral mobility, team‑based care,
          focus on medicine without residency, etc. But don’t just list features —
          connect them to who you are and what you’ve seen.
        </p>
      </div>

      <div>
        <h4 className="text-xl font-semibold">
          Your patient care experience matters — reflect on it.
        </h4>
        <p className="mt-1 text-lg text-gray-700">
          Most PA applicants have hands‑on experience: EMT, CNA, MA, scribe, etc.
          You’ll likely be asked about what you learned from those roles.
          Be honest about the difficult or messy parts, and use those stories to
          show your growth.
        </p>
      </div>

      <div>
        <h4 className="text-xl font-semibold">Teamwork and humility are big.</h4>
        <p className="mt-1 text-lg text-gray-700">
          PAs are collaborators by design. Expect questions about working under
          supervision, handling feedback from a supervising physician, or
          navigating team disagreements. Talk about when you supported others —
          not just when you led.
        </p>
      </div>

      <div>
        <h4 className="text-xl font-semibold">You don’t need to sound like a “hero.”</h4>
        <p className="mt-1 text-lg text-gray-700">
          You’re not expected to have saved lives or “always known” this was
          your calling. What matters is that you can clearly explain how your
          interest developed and what confirmed it. It’s okay if it was a
          winding path.
        </p>
      </div>

      <div>
        <h4 className="text-xl font-semibold">Understand the profession’s realities.</h4>
        <p className="mt-1 text-lg text-gray-700">
          PAs deal with scope‑of‑practice laws, burnout, and sometimes role
          confusion. Having an informed perspective — even just mentioning these
          challenges — shows maturity. You don’t need to solve them, just be aware.
        </p>
      </div>
    </div>
  )}
</div>
{/* Pharmacy (PharmD) Accordion */}
<div className="bg-gray-50 rounded-lg mb-6 shadow-sm">
  <button
    id="btn-pharmd"
    onClick={() => togglePanel("pharmd")}
    aria-expanded={openPanels.pharmd || false}
    aria-controls="panel-pharmd"
    className="w-full flex items-center justify-between px-6 py-4 focus:outline-none"
  >
    <h3 className="text-2xl font-semibold">🌿 Pharmacy (PharmD)</h3>
    <svg
      className={`w-5 h-5 transform transition-transform duration-200 ${
        openPanels.pharmd ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </button>

  {openPanels.pharmd && (
    <div
      id="panel-pharmd"
      role="region"
      aria-labelledby="btn-pharmd"
      className="px-6 pb-6 space-y-6"
    >
      <div>
        <h4 className="text-xl font-semibold">
          Show that you understand the modern pharmacist’s role.
        </h4>
        <p className="mt-1 text-lg text-gray-700">
          Pharmacy is a clinical, patient-facing profession. Talk about what you’ve
          observed: immunizations, medication therapy management, patient counseling,
          or interdisciplinary rounds.
        </p>
      </div>

      <div>
        <h4 className="text-xl font-semibold">
          Be honest about how your interest developed — even if it’s nontraditional.
        </h4>
        <p className="mt-1 text-lg text-gray-700">
          Some applicants come in after working in retail. Others switch from pre-med.
          Either is fine — as long as you can explain why pharmacy now makes sense.
          Specific moments &gt; generic interest in “science and helping people.”
        </p>
      </div>

      <div>
        <h4 className="text-xl font-semibold">
          Expect questions about patient communication.
        </h4>
        <p className="mt-1 text-lg text-gray-700">
          Pharmacists often deal with confused or noncompliant patients. You might get
          a scenario about someone refusing medication, asking about side effects,
          or not speaking your language. Be prepared to talk through how you’d
          educate and reassure with empathy.
        </p>
      </div>

      <div>
        <h4 className="text-xl font-semibold">Attention to detail.</h4>
        <p className="mt-1 text-lg text-gray-700">
          You might get a question like: “How do you manage risk or avoid mistakes?”
          Focus on systems: double-checking, knowing your limits, asking questions.
          They want safe, thoughtful pharmacists — not perfectionists who burn out.
        </p>
      </div>

      <div>
        <h4 className="text-xl font-semibold">Demonstrate curiosity.</h4>
        <p className="mt-1 text-lg text-gray-700">
          If you’ve followed trends like pharmacogenomics, medication access issues,
          or the expanding scope of pharmacy practice — bring it up. It shows you’re
          engaged with the profession as it really exists.
        </p>
      </div>
    </div>
  )}
</div>
{/* Occupational Therapy (OT) Accordion */}
<div className="bg-gray-50 rounded-lg mb-6 shadow-sm">
  <button
    id="btn-ot"
    onClick={() => togglePanel("ot")}
    aria-expanded={openPanels.ot || false}
    aria-controls="panel-ot"
    className="w-full flex items-center justify-between px-6 py-4 focus:outline-none"
  >
    <h3 className="text-2xl font-semibold">🧩 Occupational Therapy (OT)</h3>
    <svg
      className={`w-5 h-5 transform transition-transform duration-200 ${
        openPanels.ot ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </button>

  {openPanels.ot && (
    <div
      id="panel-ot"
      role="region"
      aria-labelledby="btn-ot"
      className="px-6 pb-6 space-y-6"
    >
      <div>
        <h4 className="text-xl font-semibold">
          Be clear on what OT actually is — and why it fits you.
        </h4>
        <p className="mt-1 text-lg text-gray-700">
          Talk about enabling independence, not just “helping people.” Mention
          specific settings (pediatrics, rehab, mental health) that resonate
          with you.
        </p>
      </div>

      <div>
        <h4 className="text-xl font-semibold">
          Highlight creativity and adaptability.
        </h4>
        <p className="mt-1 text-lg text-gray-700">
          OTs work with limited tools and varied patient needs. Share a time
          you had to improvise or tailor support to someone’s unique situation.
        </p>
      </div>

      <div>
        <h4 className="text-xl font-semibold">Reflect on real experiences.</h4>
        <p className="mt-1 text-lg text-gray-700">
          Even one patient interaction or volunteer role can be powerful if you
          explain what it taught you about client-centered care.
        </p>
      </div>
    </div>
  )}
</div>
{/* Veterinary Medicine (DVM) Accordion */}
<div className="bg-gray-50 rounded-lg mb-6 shadow-sm">
  <button
    id="btn-dvm"
    onClick={() => togglePanel("dvm")}
    aria-expanded={openPanels.dvm || false}
    aria-controls="panel-dvm"
    className="w-full flex items-center justify-between px-6 py-4 focus:outline-none"
  >
    <h3 className="text-2xl font-semibold">🐱 Veterinary Medicine (DVM)</h3>
    <svg
      className={`w-5 h-5 transform transition-transform duration-200 ${
        openPanels.dvm ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </button>

  {openPanels.dvm && (
    <div
      id="panel-dvm"
      role="region"
      aria-labelledby="btn-dvm"
      className="px-6 pb-6 space-y-6"
    >
      <div>
        <h4 className="text-xl font-semibold">
          Know it’s not just about animals — it’s about people, too.
        </h4>
        <p className="mt-1 text-lg text-gray-700">
          You’ll work with clients as much as pets. Be ready to talk about
          communication, trust, and emotionally tough situations
          (e.g., euthanasia, cost barriers).
        </p>
      </div>

      <div>
        <h4 className="text-xl font-semibold">
          Reflect on your animal experience — don’t just list it.
        </h4>
        <p className="mt-1 text-lg text-gray-700">
          What did you learn from shadowing, clinics, or shelters? How did it
          shape your view of veterinary medicine?
        </p>
      </div>

      <div>
        <h4 className="text-xl font-semibold">Understand the scope of the field.</h4>
        <p className="mt-1 text-lg text-gray-700">
          Mention awareness of different paths: small/large animal, exotics,
          public health, research. You don’t need to know your exact path —
          just show curiosity.
        </p>
      </div>

      <div>
        <h4 className="text-xl font-semibold">Expect ethical scenarios.</h4>
        <p className="mt-1 text-lg text-gray-700">
          You may be asked: “What would you do if a client refuses care?” or
          “How would you balance cost and animal welfare?” Be thoughtful and compassionate.
        </p>
      </div>
    </div>
  )}
</div>
{/* Final Tip Heading */}
<h2 className="text-4xl font-semibold mt-12 mb-6">Final Tip 🚨</h2>

{/* Final Tip CTA Card */}
<div className="bg-gray-50 p-6 rounded-lg text-gray-700 leading-relaxed">
  <p className="mt-2 text-lg">
    <strong>Practice &gt; Theory.</strong> Knowing what to say isn’t enough—you must deliver it with confidence, clarity, and compassion. Use our recording and AI feedback tools to refine your presentation until it's second nature. Ready to stand out?
  </p>
  <div className="mt-6 text-center">
    {user ? (
      <Link to="/dashboard">
        <Button type="primary">Start practicing now</Button>
      </Link>
    ) : (
      <Link to="/signup">
        <Button type="primary">Start practicing now</Button>
      </Link>
    )}
  </div>
</div>

    
    </div>
  );
}
