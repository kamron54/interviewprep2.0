import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Button from '../components/Button';
import Card from '../components/Card';

function Dashboard() {
  const [status, setStatus] = useState('Checking access...');
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      if (!user.emailVerified) {
        setStatus('⚠️ Please verify your email before continuing. Check your inbox for a verification link.');
        return;
      }

      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setStatus('❌ User data not found in Firestore.');
          return;
        }

        const data = docSnap.data();
        setUserData(data);

        const now = new Date();
        const trialEnd = new Date(data.trialExpiresAt);
        const hasTrial = now < trialEnd;

        if (hasTrial || data.hasPaid) {
          setStatus('✅ Access granted.');
        } else {
          setStatus('🚫 Your 24-hour trial has expired. Please upgrade to continue.');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setStatus('❌ Failed to fetch user data.');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <Card>
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Your Dashboard</h1>
        <p className="text-gray-700 mt-2">{status}</p>
      </Card>

      {status.startsWith('✅') && userData && (
        <Card className="space-y-4">
          <div>
            <p className="text-lg">
              Logged in as <strong>{userData.email}</strong>
            </p>
            <p className="text-sm text-gray-600">
              Trial ends: {new Date(userData.trialExpiresAt).toLocaleString()}
            </p>
            <p className="text-green-600 font-medium">You have full access to the app.</p>
          </div>

          <Button type="primary" onClick={() => navigate('/setup')}>
            Start New Interview
          </Button>
        </Card>
      )}
    </div>
  );
}

export default Dashboard;
