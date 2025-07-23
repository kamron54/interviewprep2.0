import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function InterviewSetup() {
  const [profession, setProfession] = useState('Dental');
  const [mode, setMode] = useState('video');
  const [big3, setBig3] = useState(true);
  const [questionCount, setQuestionCount] = useState(5);
  const navigate = useNavigate();

  const handleStart = () => {
    const config = {
      profession,
      mode,
      big3,
      questionCount,
    };

    navigate('/prep', { state: config });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Interview Setup</h1>

      <div className="space-y-4">
        {/* Profession Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
          <select
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="Dental">Dental</option>
            <option value="Medical">Medical</option>
            <option value="Physical Therapy">Physical Therapy</option>
            <option value="Physician Assistant">Physician Assistant</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="Occupational Therapy">Occupational Therapy</option>
            <option value="Veterinary Medicine">Veterinary Medicine</option>
          </select>
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
                className="text-blue-500 cursor-pointer peer"
                tabIndex={0}
              >
                ℹ️
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
