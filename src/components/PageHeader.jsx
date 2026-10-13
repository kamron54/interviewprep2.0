import { cn } from '@/lib/utils';

// Top of an inner page (Pricing, Resources, guides, legal pages): an optional handwritten note,
// the title in Fraunces, and one line under it. Left-aligned like the homepage sections.
export default function PageHeader({ title, subtitle, note, narrow = false, children }) {
  return (
    <section className="border-b border-line">
      <div className={cn('mx-auto px-4 pb-12 pt-14 sm:px-6 md:pt-16', narrow ? 'max-w-3xl' : 'max-w-6xl')}>
        {note && <p className="font-hand text-[24px] leading-none text-brand">{note}</p>}
        <h1 className={cn('text-balance text-[40px] font-medium leading-[1.08] tracking-tight text-gray-900 sm:text-[48px]', note && 'mt-3')}>
          {title}
        </h1>
        {subtitle && <p className="mt-3 max-w-2xl text-lg text-gray-600">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
