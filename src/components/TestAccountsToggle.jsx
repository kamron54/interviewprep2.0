import { useState } from 'react';

const STORAGE_KEY = 'adminHideTestAccounts';

// Gmail "+" addresses (you+test1@gmail.com) are how test accounts get made
export function isTestAccount(user) {
  return (user.email || '').includes('+');
}

// Real students only: never admins, and no test accounts while they're hidden
export function studentAccounts(users, hideTests) {
  return users.filter((u) => u.role !== 'admin' && !(hideTests && isTestAccount(u)));
}

// On by default, remembered across the admin pages
export function useHideTestAccounts() {
  const [hide, setHide] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) !== 'false'; } catch { return true; }
  });
  const update = (value) => {
    setHide(value);
    try { localStorage.setItem(STORAGE_KEY, String(value)); } catch { /* storage unavailable */ }
  };
  return [hide, update];
}

export default function TestAccountsToggle({ hide, onChange, hiddenCount }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
      <input
        type="checkbox"
        checked={hide}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-foreground"
      />
      Hide test accounts{hide && hiddenCount > 0 ? ` (${hiddenCount} hidden)` : ''}
    </label>
  );
}
