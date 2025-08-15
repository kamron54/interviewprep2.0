// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Button from '../components/Button';
import Card from '../components/Card';

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [isVerified, setIsVerified] = useState(true);
  const navigate = useNavigate();

  // Fetch user & Firestore record
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }
      // Always reload so we get the latest verification state
      await user.reload();
      const nowVerified = user.emailVerified === true;
      setIsVerified(nowVerified);

      // Keep Firestore in sync for this user (helps Admin view)
      try {
        if (nowVerified) {
          await updateDoc(doc(db, 'users', user.uid), { emailVerified: true });
        }
      } catch (e) {
        console.warn('Could not update emailVerified flag:', e);
      }

      try {
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (!docSnap.exists()) {
          console.warn('User data not found.');
        } else {
          setUserData(docSnap.data());
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Redirect to Stripe Checkout with UID
  const handleUpgrade = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('User not authenticated');

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error: ${text}`);
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error('Checkout redirect failed:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  // Loading or error states
  if (!userData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card>
          <p>Checking access…</p>
        </Card>
      </div>
    );
  }

  // Compute trial timings
  const now = new Date();
  const trialEnd = new Date(userData.trialExpiresAt);
  const isTrialActive = now < trialEnd;
  const msLeft = trialEnd - now;
  const hoursLeft = Math.floor(msLeft / 1000 / 60 / 60);
  const minutesLeft = Math.floor((msLeft / 1000 / 60) % 60);

   return (
     <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
       {/* BIG email verification banner (visible until verified) */}
       {!isVerified && (
         <Card className="border-2 border-yellow-400 bg-yellow-50 p-6">
           <h2 className="text-xl font-semibold text-yellow-800">
             Verify your email to unlock the app
           </h2>
           <p className="text-yellow-900 mt-1">
             We’ve sent a verification link to your inbox. Once verified, refresh this page.
           </p>
           <p className="text-sm text-yellow-900 mt-2">
             Tip: check your spam folder if you don’t see it.
           </p>
         </Card>
       )}

      {/* Always‑on Upgrade Banner for non‑paying users */}
      {!userData.hasPaid && (
        <Card className="bg-gray-50 border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">
                {isTrialActive
                  ? `Your free trial ends in ${hoursLeft}h ${minutesLeft}m`
                  : `Your trial has ended`}
              </h2>
              <p className="text-gray-600 mb-0">
                Upgrade now for unlimited access to mock interviews and feedback.
              </p>
            </div>
            <div className="mt-4 md:mt-0 md:ml-4">
              <Button type="primary" onClick={handleUpgrade}>
                {isTrialActive ? 'Upgrade Now' : 'Upgrade to Continue'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Main Info & Actions */}
      <Card className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {userData?.name || auth.currentUser.email}
        </h1>

        <div className="mt-6 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
           {(isTrialActive || userData.hasPaid) && isVerified && (
             <Button
               type="primary"
               onClick={() => {
                 const p = localStorage.getItem('lastProfession');
                 if (p) navigate(`/${p}/setup`);
                 else navigate('/setup');
               }}
             >
              Start New Interview
            </Button>
          )}
        </div>
      </Card>

    </div>
  );
}
