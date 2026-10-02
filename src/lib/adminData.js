import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase';

// Reads for the admin pages, in one place. These only succeed for admins if the
// Firestore rules (and api/waitlist.js) say so; the pages' admin gate just hides the UI.

function useCollection(name) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getDocs(collection(db, name))
      .then((snap) => { if (!cancelled) setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); })
      .catch((err) => console.error(`Error fetching ${name}:`, err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [name]);

  return [items, setItems, loading];
}

export function useAdminUsers() {
  const [users, , loading] = useCollection('users');
  return { users, loading };
}

// setQuestions lets the question manager reflect its own adds, edits, and deletes
export function useAdminQuestions() {
  const [questions, setQuestions, loading] = useCollection('questions');
  return { questions, setQuestions, loading };
}

// Waitlist entries come from api/waitlist.js (admin-only GET). null until loaded.
export function useAdminWaitlist() {
  const [entries, setEntries] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch('/api/waitlist', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (!cancelled) setEntries(data.entries);
      } catch (err) {
        console.error('Error fetching waitlist:', err);
        if (!cancelled) setEntries([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return entries;
}
