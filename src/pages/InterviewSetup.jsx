import { useState, useEffect, } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase';

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import FocusHeader from '../components/FocusHeader';
import usePageTitle from '../lib/usePageTitle';
import { useAccount } from '../lib/account';

// A choice card for the interview type; the checked one gets a dark border
const CHOICE = 'flex cursor-pointer items-start gap-3 rounded-xl border border-line p-4 transition-colors hover:bg-gray-50/60 has-[:checked]:border-gray-900';
const FIELD_LABEL = 'block text-sm font-semibold text-gray-900';

function InterviewSetup() {
  usePageTitle('Interview setup');
  const [interviewType, setInterviewType] = useState('random');
  const [mode, setMode] = useState('video');
  const [big3, setBig3] = useState(true);
  const [questionCount, setQuestionCount] = useState(5);
  const navigate = useNavigate();
  const [customQuestions, setCustomQuestions] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [questionBank, setQuestionBank] = useState([]);
  // The student's program (saved on their account) decides which tagged questions they get
  const { program, profileLoaded } = useAccount();
  const professionTag = program.tag;

  const handleStart = () => {
    const config = {
      profession: professionTag,
      mode,
      big3,
      questionCount: Math.min(10, Math.max(1, Math.round(questionCount) || 1)),
      interviewType, // 'random' | 'custom'
    };

    if (interviewType === 'custom') {
      config.questions = customQuestions; // user-picked/typed
      config.big3 = false;
      config.questionCount = customQuestions.length;
      config.isCustom = true;
    }

    navigate('/session', { state: { config } });
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      const snapshot = await getDocs(collection(db, 'questions'));
      const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuestionBank(all);
    };
    fetchQuestions();
  }, []);

  const visibleBank = questionBank.filter(q => q.mainTags?.includes(professionTag));

  return (
    <div className="min-h-screen bg-background">
      <FocusHeader className="max-w-3xl" />

      <div className="mx-auto max-w-3xl space-y-6 px-4 pb-16 pt-10 sm:px-6">
        <div>
          <h1 className="text-[34px] font-medium leading-tight tracking-tight text-gray-900 sm:text-[40px]">Set up your interview</h1>
          <p className="mt-2 text-sm text-gray-500">
            Questions for {program.displayName} ·{' '}
            <Link to="/dashboard" className="font-medium text-gray-900 underline decoration-line decoration-2 underline-offset-4 hover:decoration-brand">Change program</Link>
          </p>
        </div>

        <Card className="rounded-2xl border-line shadow-sm">
          <CardContent className="space-y-3 p-5 sm:p-6">
            <h2 className="font-sans text-sm font-semibold text-gray-900">Interview type</h2>
            <label className={CHOICE}>
              <input
                type="radio"
                name="interviewType"
                value="random"
                checked={interviewType === 'random'}
                onChange={(e) => setInterviewType(e.target.value)}
                className="mt-1 accent-foreground"
              />
              <div>
                <p className="font-medium text-gray-900">Standard</p>
                <p className="text-sm text-gray-500">Random questions from the bank, one at a time, like interview day.</p>
              </div>
            </label>

            <label className={CHOICE}>
              <input
                type="radio"
                name="interviewType"
                value="custom"
                checked={interviewType === 'custom'}
                onChange={(e) => setInterviewType(e.target.value)}
                className="mt-1 accent-foreground"
              />
              <div>
                <p className="font-medium text-gray-900">Custom</p>
                <p className="text-sm text-gray-500">Pick questions from the bank or write your own.</p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Recording mode and question count side by side */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="rounded-2xl border-line shadow-sm">
            <CardContent className="space-y-2 p-5 sm:p-6">
              <label htmlFor="recording-mode" className={FIELD_LABEL}>Recording mode</label>
              <select
                id="recording-mode"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
              >
                <option value="video">Video</option>
                <option value="audio">Audio only</option>
              </select>
            </CardContent>
          </Card>

          {interviewType === 'random' && (
            <Card className="rounded-2xl border-line shadow-sm">
              <CardContent className="space-y-2 p-5 sm:p-6">
                <label htmlFor="question-count" className={FIELD_LABEL}>Number of questions</label>
                <Input
                  id="question-count"
                  type="number"
                  min="1"
                  max="10"
                  className="h-10"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  onBlur={() => setQuestionCount((n) => Math.min(10, Math.max(1, Math.round(n) || 1)))}
                />
                <p className="text-xs text-gray-500">Between 1 and 10.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {interviewType === 'random' && (
          <label htmlFor="big3" className="flex cursor-pointer items-start gap-3">
            <input
              id="big3"
              type="checkbox"
              checked={big3}
              onChange={(e) => setBig3(e.target.checked)}
              className="mt-1 accent-foreground"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">Include the “Big 3” questions</span>
              <span className="block text-sm text-gray-500">
                Tell me about yourself, why this profession, and why our school. They come up in almost every interview.
              </span>
            </span>
          </label>
        )}

        {interviewType === 'custom' && (
          <Card className="rounded-2xl border-line shadow-sm">
            <CardContent className="space-y-5 p-5 sm:p-6">
              <h2 className="font-sans text-sm font-semibold text-gray-900">Build your own interview</h2>
              <div className="flex gap-2">
                <Input
                  type="text"
                  className="h-10"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Type your own question…"
                />
                <Button
                  className="h-10"
                  onClick={() => {
                    if (customInput.trim()) {
                      setCustomQuestions([...customQuestions, { text: customInput.trim() }]);
                      setCustomInput('');
                    }
                  }}
                >
                  Add
                </Button>
              </div>

              {customQuestions.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Your questions</p>
                  <ol className="mt-2 space-y-1.5">
                    {customQuestions.map((q, index) => (
                      <li key={index} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-white py-1.5 pl-3 pr-1 text-sm">
                        <span className="text-gray-900">{q.text}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0 text-gray-500 hover:text-gray-900"
                          onClick={() => {
                            const updated = [...customQuestions];
                            updated.splice(index, 1);
                            setCustomQuestions(updated);
                          }}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-500">Add from the question bank</p>
                <ul className="mt-2 max-h-64 divide-y divide-line overflow-y-auto rounded-lg border border-line bg-background">
                  {visibleBank.map((q) => (
                    <li key={q.id} className="flex items-center justify-between gap-3 py-1 pl-3 pr-1">
                      <span className="text-sm text-gray-800">{q.text}</span>
                      <Button
                        variant="link"
                        size="sm"
                        className="shrink-0 text-primary"
                        onClick={() => {
                          if (!customQuestions.some((item) => item.text === q.text)) {
                            setCustomQuestions([...customQuestions, { text: q.text }]);
                          }
                        }}
                      >
                        Add
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          <Button
            variant="default"
            size="lg"
            onClick={handleStart}
            disabled={!profileLoaded || (interviewType === 'custom' && customQuestions.length === 0)}
            className="w-full"
          >
            Start interview
          </Button>
          {interviewType === 'custom' && customQuestions.length === 0 && (
            <p className="text-center text-xs text-gray-500">Add at least one question to start.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default InterviewSetup;
