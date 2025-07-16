import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import Button from "../components/Button";

export default function HomePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white text-gray-900 font-sans">
      {/* Hero */}
      <section className="text-center px-6 py-20 bg-gray-50">
        <h1 className="text-4xl font-bold mb-4">Nail your interviews.</h1>
        <p className="text-lg mb-6">
          Practice mock interviews and get instant feedback — built by a fellow student.
        </p>
        {user ? (
          <Link to="/setup">
            <Button type="primary">Start New Interview</Button>
          </Link>
        ) : (
          <Link to="/signup">
            <Button type="primary">Start Free 24-Hour Trial</Button>
          </Link>
        )}
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">How It Works</h2>
        <ul className="space-y-4 text-lg">
          <li>1. Choose your interview type</li>
          <li>2. Practice with real questions</li>
          <li>3. Get instant feedback</li>
        </ul>
      </section>

      {/* Why It Works */}
      <section className="bg-gray-50 px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Why It Works</h2>
        <p className="text-lg mb-4">
          Watching yourself answer questions is uncomfortable — but it’s the fastest way to improve. I was nervous about interviews too. Practicing with real questions and watching my answers back helped me walk into every interview feeling confident.
        </p>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">FAQ</h2>
        <ul className="space-y-4 text-lg">
          <li>
            <strong>Q:</strong> Do I need to pay?<br />
            <strong>A:</strong> Nope — you get 24 hours free, no credit card required.
          </li>
          <li>
            <strong>Q:</strong> Why video?<br />
            <strong>A:</strong> Seeing and hearing yourself is uncomfortable — and incredibly effective.
          </li>
          <li>
            <strong>Q:</strong> What if I don’t want to be on camera?<br />
            <strong>A:</strong> You can choose audio-only mode before your interview begins.
          </li>
          <li>
            <strong>Q:</strong> Can I skip questions?<br />
            <strong>A:</strong> Yes! You can skip any question at any time, even before recording.
          </li>
        </ul>
      </section>

      {/* About */}
      <section id="about" className="bg-gray-50 px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">About Me</h2>
        <p className="text-lg">
          I’m a dental student at UCSF. During my application process, I received over 10 interview offers and was accepted to schools like UPenn, Tufts, and UCSF. I built InterviewPrep because I know how intimidating the process can be — and I wanted to create a tool I wish I had when I was applying.
        </p>
        <p className="text-lg mt-4">
          If you ever want advice, feel free to reach out. I also offer 1-on-1 mock interviews for $75/hr.
        </p>
      </section>
    </div>
  );
}
