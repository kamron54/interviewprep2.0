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
          Practice mock interviews and get instant feedback — built for applicants to medical, dental, pharmacy, PA, PT, and other healthcare programs.
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

      {/* How It Works Section */}
<section className="px-6 py-16 bg-white max-w-6xl mx-auto">
  <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
  <div className="space-y-20">
    
    {/* Step 1 */}
    <div className="grid md:grid-cols-2 gap-10 items-center">
      <div>
        <h3 className="text-2xl font-semibold mb-2">Choose your interview type</h3>
        <p className="text-gray-700">
          Select the health professional field for your mock interview, including dental, medical, pharmacy, and more.
        </p>
      </div>
      <div className="bg-gray-50 p-6 rounded-lg shadow-md border w-full max-w-md mx-auto">
        <label className="block text-sm font-medium mb-2">Interview Type</label>
        <select className="w-full border rounded px-3 py-2">
          <option>Dental</option>
          <option>Medical</option>
          <option>Pharmacy</option>
          <option>Other</option>
        </select>
        <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
          Start Interview
        </button>
      </div>
    </div>

    {/* Step 2 */}
    <div className="grid md:grid-cols-2 gap-10 items-center md:flex-row-reverse">
      <div>
        <h3 className="text-2xl font-semibold mb-2">Practice with real questions</h3>
        <p className="text-gray-700">
          Respond to common interview questions in a simulated environment, just like the real thing.
        </p>
      </div>
      <div className="relative rounded-lg overflow-hidden shadow-md border w-full max-w-md mx-auto bg-black aspect-video">
        <img
          src="/images/step2-user.jpg"
          alt="Interview session user"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">Recording</div>
        <div className="absolute bottom-2 left-2 text-white text-sm px-2">Why do you want to become a doctor?</div>
      </div>
    </div>

    {/* Step 3 */}
    <div className="grid md:grid-cols-2 gap-10 items-center">
      <div>
        <h3 className="text-2xl font-semibold mb-2">Review your answers & get instant feedback</h3>
        <p className="text-gray-700">
          Watch your recorded responses and receive AI-powered feedback to improve your performance immediately.
        </p>
      </div>
      <div className="bg-gray-50 p-6 rounded-lg shadow-md border w-full max-w-md mx-auto space-y-4 text-sm">
        <div>
          <p className="font-semibold">Why do you want to become a doctor?</p>
          <div className="mt-1">
            <button className="text-blue-600 underline text-xs">Watch Your Answer</button>
          </div>
        </div>
        <div>
          <p className="font-semibold mb-1">AI Feedback</p>
          <p className="text-gray-700">
            Your response showed passion for healthcare and a clear personal journey. Try to include more specific long-term goals and structured examples.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>


      {/* Why It Works */}
<section className="bg-gray-50 px-6 py-20 max-w-6xl mx-auto">
  <h2 className="text-3xl font-bold mb-6 text-center">Why It Works</h2>
  <p className="text-lg text-gray-700 max-w-3xl mx-auto text-center">
    Watching yourself answer questions is uncomfortable — but it’s the fastest way to improve. I was nervous about interviews too. Practicing with real questions and watching my answers back helped me walk into every interview feeling confident.
  </p>
</section>

{/* FAQ */}
<section id="faq" className="bg-white px-6 py-20 max-w-6xl mx-auto border-t border-gray-200">
  <h2 className="text-3xl font-bold mb-8 text-center">FAQ</h2>
  <ul className="space-y-6 text-lg max-w-3xl mx-auto">
    <li>
      <p><strong>Q:</strong> Do I need to pay?</p>
      <p><strong>A:</strong> Nope — you get 24 hours free, no credit card required.</p>
    </li>
    <li>
      <p><strong>Q:</strong> Why video?</p>
      <p><strong>A:</strong> Seeing and hearing yourself is uncomfortable — and incredibly effective.</p>
    </li>
    <li>
      <p><strong>Q:</strong> What if I don’t want to be on camera?</p>
      <p><strong>A:</strong> You can choose audio-only mode before your interview begins.</p>
    </li>
    <li>
      <p><strong>Q:</strong> Can I skip questions?</p>
      <p><strong>A:</strong> Yes! You can skip any question at any time, even before recording.</p>
    </li>
  </ul>
</section>

{/* About */}
<section id="about" className="bg-gray-50 px-6 py-20 max-w-6xl mx-auto border-t border-gray-200">
  <h2 className="text-3xl font-bold mb-8 text-center">About Me</h2>
  <div className="max-w-3xl mx-auto text-lg text-gray-700 space-y-6">
    <p>
      My name is Kamron, and I’m a student at UCSF School of Dentistry. During my application process, I partook in a handful of interviews and was accepted to schools such as UPenn, Tufts, and UCSF. I built InterviewPrep because I know how intimidating the process can be — and I wanted to create a tool I wish I had when I was applying.
    </p>
    <p>
      If you ever want advice, feel free to reach out. I also offer 1-on-1 mock interviews for $75/hr.
    </p>
  </div>
</section>
    </div>
  );
}
