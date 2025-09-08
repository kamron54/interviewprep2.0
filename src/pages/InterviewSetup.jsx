import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase';

function InterviewSetup() {
  const [interviewType, setInterviewType] = useState('random');
  const [mode, setMode] = useState('video');
  const [big3, setBig3] = useState(true);
  const [questionCount, setQuestionCount] = useState(5);
  const navigate = useNavigate();
  const [customQuestions, setCustomQuestions] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [questionBank, setQuestionBank] = useState([]);
  const { profession: professionSlug } = useParams();
  const tagForProfession = (slug) => {
    if (!slug) return null;
    const map = {
      dental: 'Dental',
      medical: 'Medical',
      pt: 'Physical Therapy',
      pa: 'Physician Assistant',
      pharmacy: 'Pharmacy',
      ot: 'Occupational Therapy',
      veterinary: 'Veterinary Medicine',
    };
    return map[slug.toLowerCase()] ?? null;
  };
  const professionTag = tagForProfession(professionSlug);


  const handleStart = () => {
  const config = {
    profession: professionTag || 'Dental',  // fallback if not in a slugged route
    mode,
    big3,
    questionCount,
    interviewType, // new: 'random' | 'custom' (for UI awareness downstream if you want it)
  };

  // If user selected "Custom", override the config
  if (interviewType === "custom") {
    config.questions = customQuestions; // The user's hand-picked or typed questions
    config.big3 = false; // No need for big 3 logic
    config.questionCount = customQuestions.length;
    config.isCustom = true; // Optional, in case you want to check for it later
  }

  const target = `/${professionSlug || 'dental'}/session`;
  navigate(target, { state: { config } });
};

useEffect(() => {
  const fetchQuestions = async () => {
    const snapshot = await getDocs(collection(db, 'questions'));
    const all = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setQuestionBank(all);
  };

  fetchQuestions();
}, []);

const visibleBank =
  interviewType === 'custom' && professionTag
    ? questionBank.filter(q => q.mainTags?.includes(professionTag))
    : questionBank;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Interview Setup</h1>

      <div className="space-y-4">

        {/* Interview Type */}
        <div className="space-y-3">
          <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="interviewType"
              value="random"
              checked={interviewType === 'random'}
              onChange={(e) => setInterviewType(e.target.value)}
              className="mr-3"
            />
            <div>
              <p className="font-medium text-gray-900">Standard</p>
              <p className="text-sm text-gray-600">Questions are generated as you go for a realistic, interview-day experience.</p>
            </div>
          </label>

          <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="interviewType"
              value="custom"
              checked={interviewType === 'custom'}
              onChange={(e) => setInterviewType(e.target.value)}
              className="mr-3"
            />
            <div>
              <p className="font-medium text-gray-900">Custom</p>
              <p className="text-sm text-gray-600">Choose or create specific questions to target areas you want to practice.</p>
            </div>
          </label>
        </div>

        {/* Recording Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recording Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="video">Video</option>
            <option value="audio">Audio Only</option>
          </select>
        </div>

    {interviewType === 'random' && (
      <>
        {/* Include Big 3 */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={big3}
            onChange={(e) => setBig3(e.target.checked)}
          />
          <span className="flex items-center space-x-1 text-sm text-gray-800">
            <span>Include “Big 3” questions?</span>
            <div className="relative flex items-center">
              <span
                className="text-black-500 cursor-pointer peer"
                tabIndex={0}
              >
                ⓘ
              </span>
              <div
                className="absolute left-6 top-0 w-64 p-2 bg-white border border-gray-300 rounded shadow-lg text-sm text-gray-700 opacity-0 peer-hover:opacity-100 peer-focus:opacity-100 transition-opacity z-10 pointer-events-none"
              >
                The "Big 3" are the three interview questions that are guaranteed to show up in every interview: Tell me about yourself, Why this profession, and Why our school.
              </div>
            </div>

          </span>
        </div>

        {/* Question Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Questions</label>
          <input
            type="number"
            min="1"
            max="10"
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full p-2 border rounded-lg"
          />
        </div>
      </>
    )}

        {/* Costum Builder */}
        {interviewType === 'custom' && (
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <p className="text-sm font-semibold text-gray-700">Custom Interview Builder</p>

            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Type a custom question..."
                className="flex-1 p-2 border border-gray-300 rounded"
              />
              <button
                onClick={() => {
                  if (customInput.trim()) {
                    setCustomQuestions([...customQuestions, { text: customInput.trim() }]);
                    setCustomInput('');
                  }
                }}
                className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>

            {customQuestions.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-sm font-medium text-gray-600">Questions:</p>
                <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                  {customQuestions.map((q, index) => (
                    <li key={index} className="flex justify-between items-center">
                      {q.text}
                      <button
                        onClick={() => {
                          const updated = [...customQuestions];
                          updated.splice(index, 1);
                          setCustomQuestions(updated);
                        }}
                        className="text-red-500 text-xs hover:underline"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">Browse Question Bank</p>

              <div className="max-h-64 overflow-y-auto border rounded-lg p-2 space-y-2 bg-white">
                {visibleBank.map((q) => (
                  <div key={q.id} className="flex justify-between items-center border-b pb-2">
                    <span className="text-sm text-gray-800">{q.text}</span>
                    <button
                      onClick={() => {
                        if (!customQuestions.some((item) => item.text === q.text)) {
                          setCustomQuestions([...customQuestions, { text: q.text }]);
                        }
                      }}
                      className="text-blue-600 text-xs hover:underline"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Start Button */}
        <div>
          <button
            onClick={handleStart}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Start Interview
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterviewSetup;
