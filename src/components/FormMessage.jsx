// Inline error/success message under a form
export default function FormMessage({ tone = 'error', children }) {
  const cls = tone === 'error'
    ? 'border-destructive/30 bg-destructive/10 text-destructive'
    : 'border-teal-600/30 bg-teal-50 text-teal-800';
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={`rounded-md border px-3 py-2 text-sm ${cls}`}>
      {children}
    </p>
  );
}
