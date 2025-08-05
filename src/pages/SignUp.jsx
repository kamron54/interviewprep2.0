import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import Button from '../components/Button';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setStatus('Creating account...');

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      const trialExpiresAt = new Date();
      trialExpiresAt.setDate(trialExpiresAt.getDate() + 1);

      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: user.email,
        createdAt: serverTimestamp(),
        trialExpiresAt: trialExpiresAt.toISOString(),
        hasPaid: false,
        promoCodeUsed: null,
      });

      await sendEmailVerification(user);

      setStatus('✅ Account created! Check your email to verify your address before logging in. (Check your spam folder if the email doesn’t arrive.)');
    } catch (err) {
      console.error('❌ Error:', err);
      setStatus('❌ ' + err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-xl shadow-md bg-white space-y-4">
      <h1 className="text-2xl font-bold">Create Account</h1>
      <label className="block">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full border rounded-md p-2"
          placeholder="Name"
        />
      </label>
      <form onSubmit={handleSignUp} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          className="p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="primary" full>
          Sign Up
        </Button>
      </form>
      {status && <p className="text-sm text-gray-700">{status}</p>}
    </div>
  );
}

export default SignUp;
