import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { getProgram } from '../professions/index.js';
import { rememberedProgram } from './auth';

const AccountContext = createContext(null);

// One auth listener and one live subscription to users/{uid} for the whole app.
// Live, so a Stripe payment or a program change shows up everywhere without a refresh.
export function AccountProvider({ children }) {
  const [state, setState] = useState({ user: null, profile: null, profileLoaded: false, authReady: false });

  useEffect(() => {
    let unsubProfile = null;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      unsubProfile?.();
      unsubProfile = null;
      setState({ user, profile: null, profileLoaded: !user, authReady: true });
      if (!user) return;

      unsubProfile = onSnapshot(
        doc(db, 'users', user.uid),
        (snap) => setState((s) => (s.user?.uid === user.uid
          ? { ...s, profile: snap.exists() ? snap.data() : null, profileLoaded: true }
          : s)),
        (err) => {
          console.warn('Could not load profile:', err);
          setState((s) => ({ ...s, profileLoaded: true }));
        },
      );
    });
    return () => {
      unsubAuth();
      unsubProfile?.();
    };
  }, []);

  return <AccountContext.Provider value={state}>{children}</AccountContext.Provider>;
}

// { user, profile, profileLoaded, authReady, track, program }
// track: the program the user practices for. Saved on their account; signed-out visitors
// (and accounts from before programs existed) fall back to the last program page they viewed.
export function useAccount() {
  const state = useContext(AccountContext);
  const saved = state.profile?.track;
  const track = getProgram(saved)?.status === 'live' ? saved : rememberedProgram();
  return { ...state, track, program: getProgram(track) };
}
