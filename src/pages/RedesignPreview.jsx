import { useState } from 'react';
import { Link } from 'react-router-dom';
import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/newsreader/opsz.css';
import '@fontsource-variable/source-sans-3';
import '@fontsource-variable/caveat';
import { ArrowRight, Check, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { comingSoonPrograms } from '../professions/index.js';
import usePageTitle from '../lib/usePageTitle';

// Redesign stage 0: a standalone preview of the "founder-led and warm" direction (homepage hero,
// program blocks, founder letter). It has its own header and theme, so the live site is untouched.
// The switcher compares headline fonts and accent colors. Dashed boxes mark Kamron's real material
// still to come (his clip, student quotes, his story). Nothing here is made up.

const ACCENTS = {
  evergreen: { label: 'Evergreen', rgb: '30 107 92' },
  terracotta: { label: 'Terracotta', rgb: '181 80 44' },
  navy: { label: 'Navy', rgb: '20 35 60' },
};

const FONTS = {
  fraunces: { label: 'Fraunces', family: "'Fraunces Variable'", settings: '"SOFT" 60, "WONK" 0' },
  newsreader: { label: 'Newsreader', family: "'Newsreader Variable'", settings: 'normal' },
};

const PROGRAM_BLOCKS = [
  {
    overline: 'Dentistry',
    title: 'Dental school',
    tagline: 'The Big 3, ethics, and teamwork, practiced the way they come up on interview day.',
    points: [
      'Questions on ethics, teamwork, leadership, and communication',
      'Video or audio, up to 3 minutes per answer',
      'Feedback on every answer, plus your recording to watch back',
    ],
    start: '/signup?program=dental',
    more: '/dental',
  },
  {
    overline: 'Medicine',
    title: 'Medical school',
    tagline: 'MMI stations, traditional interviews, and “why medicine?”',
    points: [
      'Ethical scenarios to reason through out loud',
      'Video or audio, up to 3 minutes per answer',
      'Feedback on every answer, plus your recording to watch back',
    ],
    start: '/signup?program=medical',
    more: '/medical',
  },
];

// Marks a spot for Kamron's real material
function Placeholder({ children, className }) {
  return (
    <div className={cn('rounded-lg border-2 border-dashed border-ink/20 bg-surface/60 p-4 text-sm text-ink/60', className)}>
      {children}
    </div>
  );
}

function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2">
      {/* The dot is a camera's recording light: practice on camera, then watch yourself back */}
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inset-0 rounded-full bg-brand/30 motion-safe:animate-ping" />
        <span className="relative h-2.5 w-2.5 rounded-full bg-brand" />
      </span>
      <span className="font-display text-[22px] font-semibold tracking-tight text-ink">InterviewPrep</span>
    </span>
  );
}

function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Wordmark />
        <nav className="hidden items-center gap-7 text-[15px] text-ink/70 md:flex">
          <a href="#programs" className="hover:text-ink">Programs</a>
          <Link to="/pricing" className="hover:text-ink">Pricing</Link>
          <a href="#about" className="hover:text-ink">About</a>
        </nav>
        <div className="flex items-center gap-4 text-[15px]">
          <Link to="/login" className="hidden text-ink/70 hover:text-ink sm:inline">Log in</Link>
          <Link to="/signup" className="rounded-full bg-ink px-4 py-2 font-semibold text-paper hover:bg-ink/90">Start free</Link>
        </div>
      </div>
    </header>
  );
}

function ClipPlaceholder() {
  return (
    <div className="relative">
      {/* Kamron's own words: the real value is in watching yourself back */}
      <div className="pointer-events-none absolute -top-12 left-2 hidden rotate-[-4deg] items-end gap-1 lg:flex">
        <span className="font-hand text-[26px] leading-none text-brand">the real value is in watching yourself back</span>
        <svg width="44" height="46" viewBox="0 0 44 46" fill="none" className="mb-[-30px] text-brand" aria-hidden="true">
          <path d="M4 3c14 3 28 14 30 34m0 0-8-7m8 7 5-9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(20,35,60,0.06),0_8px_24px_-12px_rgba(20,35,60,0.18)]">
        <div className="border-b border-line px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">Question 1 of 5</p>
          <p className="mt-0.5 font-semibold text-ink">Why do you want to become a dentist?</p>
        </div>
        <div className="relative flex aspect-video items-center justify-center bg-ink">
          <div className="flex flex-col items-center gap-3 text-center text-paper/80">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-paper/15 ring-1 ring-paper/30">
              <Play className="h-6 w-6 translate-x-0.5 fill-current" />
            </span>
            <span className="max-w-[16rem] text-sm">Your clip goes here: you answering this question in the app, 30–60 seconds</span>
          </div>
          <span className="absolute bottom-3 left-4 right-4 h-1 rounded-full bg-paper/20">
            <span className="block h-1 w-1/3 rounded-full bg-paper/70" />
          </span>
        </div>
        <div className="grid gap-3 px-5 py-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">What worked</p>
            <p className="mt-1 text-ink/80">Opening with a specific patient moment makes your motivation feel real.</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">To consider</p>
            <p className="mt-1 text-ink/80">Close with one sentence on the kind of provider you want to become.</p>
          </div>
        </div>
      </div>
      <p className="mt-2 text-right text-xs text-ink/50">Example feedback</p>
    </div>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 md:pt-20 lg:grid-cols-[1.05fr_1fr]">
      <div>
        <p className="font-hand text-[26px] leading-none text-brand">built by a UCSF dental student</p>
        <h1 className="mt-4 text-balance font-display text-[44px] font-medium leading-[1.05] tracking-tight text-ink sm:text-[58px]">
          Practice the interview. Then watch yourself back.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/75">
          Answer dental and medical school interview questions on camera. Watch your recording, read the
          feedback, and try again. Your first 2 sessions are free.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link to="/signup" className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-paper hover:bg-ink/90">
            Start practicing free <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#programs" className="font-semibold text-ink underline decoration-line decoration-2 underline-offset-4 hover:decoration-brand">
            Pick your program
          </a>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-2 text-sm">
          <span className="mr-1 text-ink/50">Practice for</span>
          <Link to="/dental" className="rounded-full border border-ink/15 bg-surface px-3 py-1 font-medium text-ink hover:border-ink/40">Dental</Link>
          <Link to="/medical" className="rounded-full border border-ink/15 bg-surface px-3 py-1 font-medium text-ink hover:border-ink/40">Medical</Link>
          {comingSoonPrograms().map((p) => (
            <Link key={p.slug} to={`/${p.slug}`} className="rounded-full border border-dashed border-ink/20 px-3 py-1 text-ink/55 hover:border-ink/40">
              {p.name} · soon
            </Link>
          ))}
        </div>
      </div>
      <ClipPlaceholder />
    </section>
  );
}

function ProgramBlock({ block }) {
  return (
    <div className="grid gap-10 border-t border-line py-12 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-brand">{block.overline}</p>
        <h3 className="mt-2 font-display text-[36px] font-medium leading-tight tracking-tight text-ink">{block.title}</h3>
        <p className="mt-3 text-lg text-ink/75">{block.tagline}</p>
        <ul className="mt-6 space-y-3">
          {block.points.map((p) => (
            <li key={p} className="flex items-start gap-3 text-ink/85">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-paper">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              {p}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link to={block.start} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-semibold text-paper hover:bg-ink/90">
            Start practicing free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to={block.more} className="font-semibold text-ink underline decoration-line decoration-2 underline-offset-4 hover:decoration-brand">
            What to expect
          </Link>
        </div>
      </div>
      <figure className="self-center">
        <span className="font-display text-6xl leading-none text-brand/40" aria-hidden="true">“</span>
        <Placeholder className="-mt-3">
          A real student’s quote goes here, with their first name and school (with their permission).
          Until a program has one, this spot holds a short note from you.
        </Placeholder>
      </figure>
    </div>
  );
}

function Programs() {
  return (
    <section id="programs" className="scroll-mt-4 bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-[38px] font-medium tracking-tight text-ink">Pick your program</h2>
        <p className="mt-2 text-lg text-ink/70">Each one has its own questions, interview formats, and tips.</p>
        <div className="mt-10">
          {PROGRAM_BLOCKS.map((b) => <ProgramBlock key={b.title} block={b} />)}
          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-8 text-sm">
            <span className="text-ink/60">Also on the way:</span>
            {comingSoonPrograms().map((p) => (
              <Link key={p.slug} to={`/${p.slug}`} className="rounded-full border border-dashed border-ink/25 px-3 py-1 text-ink/70 hover:border-ink/50">
                {p.displayName} · get notified
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FounderLetter() {
  return (
    <section id="about" className="mx-auto grid max-w-6xl items-start gap-12 px-4 py-24 sm:px-6 md:grid-cols-[280px_1fr]">
      <figure className="mx-auto w-56 rotate-[-2deg] bg-surface p-3 pb-2 shadow-[0_2px_4px_rgba(20,35,60,0.08),0_12px_28px_-12px_rgba(20,35,60,0.25)] md:mx-0 md:w-full">
        <img src="/images/kamron.jpg" alt="Kamron in UCSF School of Dentistry scrubs" className="aspect-square w-full object-cover" />
        <figcaption className="pt-2 text-center font-hand text-[22px] text-ink/80">me, at UCSF School of Dentistry</figcaption>
      </figure>
      <div className="max-w-2xl">
        <p className="font-hand text-[26px] leading-none text-brand">a note from me</p>
        <h2 className="mt-3 text-balance font-display text-[34px] font-medium leading-tight tracking-tight text-ink sm:text-[40px]">
          I know how nerve-racking these interviews feel. I’ve sat in that chair.
        </h2>
        <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink/80">
          <p>
            Hi, I’m Kamron. I’m a student at UCSF School of Dentistry. When I applied, I interviewed at several
            competitive programs, and I know how intimidating it can be.
          </p>
          <p>
            I built InterviewPrep to be the tool I wish I’d had: practice that feels like the real thing, and a
            way to watch yourself back. That’s where the real improvement happens.
          </p>
          <Placeholder>
            Your story goes here, in your words: what your interviews were like, what helped, what you’d tell
            yourself now. Send me bullet points or a voice memo and I’ll shape it.
          </Placeholder>
        </div>
        <p className="mt-8 font-hand text-[44px] leading-none text-ink">Kamron</p>
        <p className="mt-1 text-sm text-ink/60">
          UCSF School of Dentistry · <a href="mailto:kam.interviewprep@gmail.com" className="underline underline-offset-2 hover:text-ink">kam.interviewprep@gmail.com</a>
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-ink/60 sm:px-6">
        <Wordmark />
        <span>© {new Date().getFullYear()} InterviewPrep</span>
      </div>
    </footer>
  );
}

function Switcher({ font, setFont, accent, setAccent }) {
  const btn = (active) => cn('rounded-full px-3 py-1 text-xs font-semibold', active ? 'bg-ink text-paper' : 'text-ink/70 hover:bg-ink/5');
  return (
    <div className="fixed bottom-4 right-4 z-50 w-[300px] max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-surface p-4 text-ink shadow-xl">
      <p className="text-sm font-semibold">Design preview</p>
      <p className="mt-0.5 text-xs text-ink/60">Not live. The rest of the site is unchanged.</p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-ink/50">Headline font</p>
      <div className="mt-1.5 flex gap-1">
        {Object.entries(FONTS).map(([key, f]) => (
          <button key={key} type="button" onClick={() => setFont(key)} className={btn(font === key)}>{f.label}</button>
        ))}
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-ink/50">Accent</p>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {Object.entries(ACCENTS).map(([key, a]) => (
          <button key={key} type="button" onClick={() => setAccent(key)} className={cn(btn(accent === key), 'inline-flex items-center gap-1.5')}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `rgb(${a.rgb})` }} />
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function RedesignPreview() {
  usePageTitle('Design preview');
  const [font, setFont] = useState('fraunces');
  const [accent, setAccent] = useState('evergreen');

  const theme = {
    '--ink': '20 35 60',
    '--paper': '250 247 241',
    '--surface': '255 255 255',
    '--line': '230 223 211',
    '--brand': ACCENTS[accent].rgb,
    '--font-display': FONTS[font].family,
  };

  return (
    <div style={theme} className="min-h-screen bg-paper font-body text-ink antialiased">
      {/* Fraunces' "soft" axis rounds its serifs a little, for warmth */}
      <style>{`.font-display { font-variation-settings: ${FONTS[font].settings}; }`}</style>
      <Header />
      <Hero />
      <Programs />
      <FounderLetter />
      <Footer />
      <Switcher font={font} setFont={setFont} accent={accent} setAccent={setAccent} />
    </div>
  );
}
