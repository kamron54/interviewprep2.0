// AdminQuestionManager.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';

const MAIN_TAGS = ['Dental', 'Medical', 'Physical Therapy'];
const SUBTAGS = ['Ethical', 'Behavioral', 'Teamwork', 'Leadership', 'Communication'];

function AdminQuestionManager() {
  const [questions, setQuestions] = useState([]);
  const [text, setText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [subtag, setSubtag] = useState('');
  const [big3, setBig3] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      const snapshot = await getDocs(collection(db, 'questions'));
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQuestions(fetched);
    };

    fetchQuestions();
  }, []);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleEditTag = (tag) => {
    setEditForm((prev) => ({
      ...prev,
      mainTags: prev.mainTags.includes(tag)
        ? prev.mainTags.filter(t => t !== tag)
        : [...prev.mainTags, tag],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!text.trim() || !subtag || selectedTags.length === 0) {
      setError('Please complete all fields.');
      return;
    }

    const newQuestion = {
      text: text.trim(),
      subtag,
      big3,
      mainTags: selectedTags,
      createdAt: new Date(),
    };

    try {
      const docRef = await addDoc(collection(db, 'questions'), newQuestion);
      setQuestions(prev => [...prev, { ...newQuestion, id: docRef.id }]);
      setText('');
      setSelectedTags([]);
      setSubtag('');
      setBig3(false);
    } catch (err) {
      setError('Failed to add question.');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'questions', id));
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const startEdit = (q) => {
    setEditingId(q.id);
    setEditForm({
      text: q.text,
      subtag: q.subtag,
      mainTags: q.mainTags || [],
      big3: q.big3 || false,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id) => {
    if (!editForm.text.trim() || !editForm.subtag || editForm.mainTags.length === 0) {
      alert('All fields required');
      return;
    }

    try {
      await updateDoc(doc(db, 'questions', id), {
        ...editForm,
        text: editForm.text.trim(),
      });

      setQuestions(prev =>
        prev.map(q =>
          q.id === id ? { ...q, ...editForm, text: editForm.text.trim() } : q
        )
      );

      setEditingId(null);
      setEditForm({});
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Admin: Question Manager</h1>

      <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow-sm bg-white">
        <h2 className="text-xl font-semibold">Add a New Question</h2>

        <div>
          <label className="block font-medium mb-1">Question Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full border p-2 rounded"
            rows={3}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Main Tags</label>
          <div className="flex gap-4 flex-wrap">
            {MAIN_TAGS.map(tag => (
              <label key={tag} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag)}
                  onChange={() => toggleTag(tag)}
                />
                {tag}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Subtag</label>
          <select
            value={subtag}
            onChange={(e) => setSubtag(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Select a subtag --</option>
            {SUBTAGS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={big3}
            onChange={(e) => setBig3(e.target.checked)}
          />
          <label>Include as “Big 3” question</label>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Question
        </button>
      </form>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Existing Questions</h2>
        {questions.length === 0 ? (
          <p>No questions found.</p>
        ) : (
          <ul className="space-y-2">
            {questions.map((q) => (
              <li key={q.id} className="p-3 border rounded shadow-sm bg-white">
                {editingId === q.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editForm.text}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, text: e.target.value }))
                      }
                      className="w-full border p-2 rounded"
                      rows={3}
                    />

                    <div className="flex gap-4 flex-wrap">
                      {MAIN_TAGS.map(tag => (
                        <label key={tag} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editForm.mainTags.includes(tag)}
                            onChange={() => toggleEditTag(tag)}
                          />
                          {tag}
                        </label>
                      ))}
                    </div>

                    <select
                      value={editForm.subtag}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, subtag: e.target.value }))
                      }
                      className="w-full border p-2 rounded"
                    >
                      <option value="">-- Select a subtag --</option>
                      {SUBTAGS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>

                    <label className="flex gap-2 items-center">
                      <input
                        type="checkbox"
                        checked={editForm.big3}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, big3: e.target.checked }))
                        }
                      />
                      Big 3
                    </label>

                    <div className="flex gap-2">
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded"
                        onClick={() => saveEdit(q.id)}
                      >
                        Save
                      </button>
                      <button
                        className="text-gray-600 underline"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-medium">{q.text}</p>
                      <p className="text-sm text-gray-500">
                        Tags: {q.mainTags?.join(', ')} | Subtag: {q.subtag} | Big3: {q.big3 ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <button
                        onClick={() => startEdit(q)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AdminQuestionManager;
