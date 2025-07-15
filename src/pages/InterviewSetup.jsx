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
            <option value="PT">PT</option>
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
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={big3}
            onChange={(e) => setBig3(e.target.checked)}
          />
          <label className="text-sm text-gray-800">Include “Big 3” questions?</label>
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
