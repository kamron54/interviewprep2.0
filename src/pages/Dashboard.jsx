// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Button from '../components/Button';
import Card from '../components/Card';

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Fetch user & Firestore record
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }
      if (!user.emailVerified) {
        setErrorMessage('Please verify your email before continuing. Check your inbox for a verification link.');
        return;
      }
      try {
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (!docSnap.exists()) {
          setErrorMessage('User data not found.');
        } else {
          setUserData(docSnap.data());
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setErrorMessage('Failed to fetch user data.');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Redirect to Stripe Checkout
  const handleUpgrade = async () => {
    try {
      const res = await fetch('/api/create-checkout-session', { method: 'POST' });
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error('Checkout redirect failed:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  // Loading or error states
  if (errorMessage) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card>
          <p className="text-red-600">{errorMessage}</p>
        </Card>
      </div>
    );
  }
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

      {/* Always-on Upgrade Banner for non-paying users */}
      {!userData.hasPaid && (
        <Card className="bg-gray-50 border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">
                {isTrialActive
                  ? `Your free trial ends in ${hoursLeft}h ${minutesLeft}m`
                  : `Your trial has ended`}
              </h2>
              <p className="text-gray-600">
                Upgrade now for full, uninterrupted access to mock interviews and AI feedback.
              </p>
            </div>
            <Button
              type="primary"
              className="mt-4 md:mt-0 md:ml-4"
              onClick={handleUpgrade}
            >
              {isTrialActive ? 'Upgrade Early & Save' : 'Upgrade to Continue'}
            </Button>
          </div>
        </Card>
      )}

      {/* Main Info & Actions */}
      <Card className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {userData.email}
        </h1>
        <p className="mt-2 text-gray-600">
          {userData.hasPaid
            ? 'You have full access.'
            : isTrialActive
              ? `Your free trial ends on ${new Date(userData.trialExpiresAt).toLocaleString()} (${hoursLeft}h ${minutesLeft}m left)`
              : 'Your trial has ended.'}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          {!userData.hasPaid && (
            <Button type="primary" onClick={handleUpgrade}>
              {isTrialActive ? 'Upgrade Early & Save' : 'Upgrade to Continue'}
            </Button>
          )}
          <Button type="primary" onClick={() => navigate('/setup')}>
            Start New Interview
          </Button>
        </div>
      </Card>

    </div>
  );
}
