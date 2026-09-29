import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FormMessage from './FormMessage';

// "Get notified" signup for a coming-soon program. Stored by api/waitlist.js.
export default function WaitlistForm({ program }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('sending');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, program: program.slug }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  };

  if (status === 'done') {
    return (
      <FormMessage tone="success">
        You’re on the list. We’ll email {email} when {program.name} practice opens.
      </FormMessage>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="waitlist-email" className="sr-only">Email</label>
        <Input
          id="waitlist-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="h-11 bg-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" size="lg" className="h-11 shrink-0" disabled={status === 'sending'}>
          {status === 'sending' ? 'Adding…' : 'Notify me'}
        </Button>
      </div>
      {error && <FormMessage>{error}</FormMessage>}
    </form>
  );
}
