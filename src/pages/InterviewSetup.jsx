import { useState, useEffect, } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase';

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";

function ChevronDown(props) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

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
  const base = professionSlug ? `/${professionSlug}` : "/dental";

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
      profession: professionTag || 'Dental', // fallback if not in a slugged route
      mode,
      big3,
      questionCount,
      interviewType, // 'random' | 'custom'
    };

    if (interviewType === 'custom') {
      config.questions = customQuestions; // user-picked/typed
      config.big3 = false;
      config.questionCount = customQuestions.length;
      config.isCustom = true;
    }

    const target = `/${professionSlug || 'dental'}/session`;
    navigate(target, { state: { config } });
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      const snapshot = await getDocs(collection(db, 'questions'));
      const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuestionBank(all);
    };
    fetchQuestions();
  }, []);

  const visibleBank =
    interviewType === 'custom' && professionTag
      ? questionBank.filter(q => q.mainTags?.includes(professionTag))
      : questionBank;

  return (
    <div className="min-h-screen bg-background">
      {/* Header (matches Session & Summary) */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate(`${base}/dashboard`)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Interview Setup</h1>
        </div>

        {/* Interview Type on its own */}
        <Card className="border border-border">
          <CardContent className="space-y-3 p-4">
            <h2 className="text-base font-medium">Interview Type</h2>
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
              <input
                type="radio"
                name="interviewType"
                value="random"
                checked={interviewType === 'random'}
                onChange={(e) => setInterviewType(e.target.value)}
                className="accent-foreground"
              />
              <div>
                <p className="font-medium text-foreground">Standard</p>
                <p className="text-xs text-muted-foreground">Questions are generated as you go for a realistic, interview-day experience.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
              <input
                type="radio"
                name="interviewType"
                value="custom"
                checked={interviewType === 'custom'}
                onChange={(e) => setInterviewType(e.target.value)}
                className="accent-foreground"
              />
              <div>
                <p className="font-medium text-foreground">Custom</p>
                <p className="text-xs text-muted-foreground">Choose or create specific questions to target areas you want to practice.</p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Recording Mode and Big 3/Question Count side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recording Mode */}
          <Card className="border border-border">
            <CardContent className="space-y-2 p-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Recording Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="video">Video</option>
                <option value="audio">Audio Only</option>
              </select>
            </CardContent>
          </Card>

          {interviewType === 'random' && (
            <Card className="border border-border">
              <CardContent className="space-y-4 p-4">
                {/* Question Count */}
                <div className="space-y-2">
                  <label className="text-sm text-foreground">Total Questions</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                  />
                </div>               
              </CardContent>
            </Card>
          )}
        </div>

        {/* Include Big 3 */}
        {interviewType === 'random' && (
              <div className="flex items-center gap-2">
                <input
                  id="big3"
                  type="checkbox"
                  checked={big3}
                  onChange={(e) => setBig3(e.target.checked)}
                  className="accent-foreground"
                />
                <label
                  htmlFor="big3"
                  className="relative inline-flex items-center gap-1 text-sm text-foreground leading-none"
                >
                  Include “Big 3” questions?
                  <span className="text-muted-foreground cursor-pointer peer select-none" tabIndex={0}>ⓘ</span>
                  <div className="absolute left-full ml-1 top-1/2 -translate-y-1/2 w-64 p-2 bg-card border border-border rounded shadow-md text-xs text-muted-foreground opacity-0 peer-hover:opacity-100 peer-focus:opacity-100 transition-opacity z-10 pointer-events-none">
                    The "Big 3" are the three interview questions that are guaranteed to show up in every interview: Tell me about yourself, Why this profession, and Why our school.
                  </div>
                </label>
              </div>
      )}

        {/* Custom Builder */}
        {interviewType === 'custom' && (
          <Card className="border border-border">
            <CardContent className="space-y-3 p-4">
              <h2 className="text-base font-medium">Custom Interview Builder</h2>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Type a custom question..."
                />
                <Button
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
                <div className="mt-2 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Questions:</p>
                  <ul className="space-y-1">
                    {customQuestions.map((q, index) => (
                      <li key={index} className="flex justify-between items-center rounded-md border border-border bg-card px-3 py-2 text-sm">
                        <span className="text-foreground">{q.text}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
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
                  </ul>
                </div>
              )}

              <div className="mt-2">
                <p className="text-sm font-semibold text-foreground mb-2">Browse Question Bank</p>
                <div className="max-h-64 overflow-y-auto border border-border rounded-lg p-2 space-y-2 bg-background">
                  {visibleBank.map((q) => (
                    <div key={q.id} className="flex justify-between items-center border-b border-border/60 pb-2">
                      <span className="text-sm text-foreground/90">{q.text}</span>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-primary"
                        onClick={() => {
                          if (!customQuestions.some((item) => item.text === q.text)) {
                            setCustomQuestions([...customQuestions, { text: q.text }]);
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Start Button */}
        <div>
          <Button
            variant="default"
            onClick={handleStart}
            className="w-full !h-auto py-3 px-4 rounded-lg font-large"
          >
            Start Interview
          </Button>
        </div>
      </main>
    </div>
  );
}

export default InterviewSetup;
