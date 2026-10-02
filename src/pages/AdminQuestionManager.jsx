// AdminQuestionManager.jsx
import { useMemo, useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import AdminLayout from '../components/AdminLayout';
import { useAdminQuestions } from '../lib/adminData';

const MAIN_TAGS = ['Dental', 'Medical', 'Physical Therapy', 'Physician Assistant', 'Pharmacy', 'Occupational Therapy', 'Veterinary Medicine'];
const SUBTAGS = ['Ethical', 'Behavioral', 'Teamwork', 'Leadership', 'Communication'];

const fieldCls = 'w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

function AdminQuestionManager() {
  return (
    <AdminLayout title="Questions">
      <QuestionManager />
    </AdminLayout>
  );
}

// The fields shared by the add form and the inline edit form
function QuestionFields({ value, onChange, idPrefix }) {
  const set = (patch) => onChange({ ...value, ...patch });
  const toggleTag = (tag) => set({
    mainTags: value.mainTags.includes(tag) ? value.mainTags.filter((t) => t !== tag) : [...value.mainTags, tag],
  });

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor={`${idPrefix}-text`} className="text-sm font-medium">Question</label>
        <textarea id={`${idPrefix}-text`} rows={3} className={fieldCls} value={value.text} onChange={(e) => set({ text: e.target.value })} />
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Programs</legend>
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {MAIN_TAGS.map((tag) => (
            <label key={tag} className="flex items-center gap-2">
              <input type="checkbox" className="accent-foreground" checked={value.mainTags.includes(tag)} onChange={() => toggleTag(tag)} />
              {tag}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor={`${idPrefix}-subtag`} className="text-sm font-medium">Subtag</label>
          <select id={`${idPrefix}-subtag`} className={cn(fieldCls, 'h-10 py-0')} value={value.subtag} onChange={(e) => set({ subtag: e.target.value })}>
            <option value="">-- Select a subtag --</option>
            {SUBTAGS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 self-end pb-2.5 text-sm">
          <input type="checkbox" className="accent-foreground" checked={value.big3} onChange={(e) => set({ big3: e.target.checked })} />
          Include as “Big 3” question
        </label>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${idPrefix}-tip`} className="text-sm font-medium">Tip (optional)</label>
        <textarea
          id={`${idPrefix}-tip`}
          rows={2}
          className={fieldCls}
          placeholder="e.g., Tie your answer to a healthcare scenario"
          value={value.tip}
          onChange={(e) => set({ tip: e.target.value })}
        />
      </div>
    </div>
  );
}

const EMPTY_QUESTION = { text: '', mainTags: [], subtag: '', big3: false, tip: '' };

function QuestionManager() {
  const { questions, setQuestions, loading } = useAdminQuestions();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(EMPTY_QUESTION);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_QUESTION);
  const [filterTag, setFilterTag] = useState(null); // a program tag, or null for all
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null); // the question waiting for delete confirmation

  const isComplete = (q) => q.text.trim() && q.mainTags.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isComplete(draft)) {
      toast.error('Add the question text and at least one program.');
      return;
    }

    const newQuestion = {
      text: draft.text.trim(),
      subtag: draft.subtag,
      tip: draft.tip.trim(),
      big3: draft.big3,
      mainTags: draft.mainTags,
      createdAt: new Date(),
    };

    try {
      const docRef = await addDoc(collection(db, 'questions'), newQuestion);
      setQuestions((prev) => [...prev, { ...newQuestion, id: docRef.id }]);
      setDraft(EMPTY_QUESTION);
      toast.success('Question added');
    } catch (err) {
      console.error(err);
      toast.error('Failed to add question.');
    }
  };

  const handleDelete = async () => {
    const { id } = deleting;
    try {
      await deleteDoc(doc(db, 'questions', id));
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      toast.success('Question deleted');
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete question.');
    }
  };

  const startEdit = (q) => {
    setEditingId(q.id);
    setEditForm({
      text: q.text,
      subtag: q.subtag || '', // Firestore rejects undefined, so older questions without one get ''
      mainTags: q.mainTags || [],
      big3: q.big3 || false,
      tip: q.tip || '',
    });
  };

  const saveEdit = async (id) => {
    if (!isComplete(editForm)) {
      toast.error('Add the question text and at least one program.');
      return;
    }

    const changes = { ...editForm, text: editForm.text.trim() };
    try {
      await updateDoc(doc(db, 'questions', id), changes);
      setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...changes } : q)));
      setEditingId(null);
      toast.success('Question updated');
    } catch (err) {
      console.error('Update failed:', err);
      toast.error('Failed to update question.');
    }
  };

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return questions.filter((item) =>
      (!filterTag || item.mainTags?.includes(filterTag)) && (!q || item.text?.toLowerCase().includes(q)));
  }, [questions, filterTag, search]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading questions…</p>;

  const chipCls = (active) => cn(
    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm',
    active ? 'border-gray-900 bg-gray-900 text-white' : 'bg-white text-gray-700 hover:border-gray-400'
  );

  return (
    <>
      {/* Questions per program: the readiness check before launching one. Click to filter. */}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={chipCls(!filterTag)} onClick={() => setFilterTag(null)}>
          All <span className="opacity-70">{questions.length}</span>
        </button>
        {MAIN_TAGS.map((tag) => (
          <button key={tag} type="button" className={chipCls(filterTag === tag)} onClick={() => setFilterTag(filterTag === tag ? null : tag)}>
            {tag} <span className="opacity-70">{questions.filter((q) => q.mainTags?.includes(tag)).length}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            aria-label="Search questions"
            placeholder="Search questions"
            className="h-10 pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {!adding && (
          <Button onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> Add question
          </Button>
        )}
      </div>

      {adding && (
        <Card className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-base font-semibold">Add a new question</h2>
            <QuestionFields value={draft} onChange={setDraft} idPrefix="new" />
            <div className="flex gap-2">
              <Button type="submit">Add question</Button>
              <Button type="button" variant="ghost" onClick={() => { setAdding(false); setDraft(EMPTY_QUESTION); }}>Done</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {visible.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            {questions.length === 0 ? 'No questions yet.' : 'No questions match.'}
          </p>
        ) : (
          <ul className="divide-y">
            {visible.map((q) => (
              <li key={q.id} className="p-4">
                {editingId === q.id ? (
                  <div className="space-y-4">
                    <QuestionFields value={editForm} onChange={setEditForm} idPrefix={`edit-${q.id}`} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(q.id)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">{q.text}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {q.mainTags?.length === MAIN_TAGS.length
                          ? <Badge variant="secondary">All programs</Badge>
                          : q.mainTags?.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
                        {q.subtag && <Badge variant="outline">{q.subtag}</Badge>}
                        {q.big3 && <Badge>Big 3</Badge>}
                        {q.tip && <span className="text-xs text-muted-foreground">Has tip</span>}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(q)}>Edit</Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleting(q)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <p className="text-xs text-muted-foreground">Showing {visible.length} of {questions.length} questions</p>

      <AlertDialog open={!!deleting} onOpenChange={(open) => { if (!open) setDeleting(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this question?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.text}” will be removed from every program’s question bank. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default AdminQuestionManager;
