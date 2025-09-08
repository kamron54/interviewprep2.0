import { useProfession } from '../professions/ProfessionContext.jsx';

export default function About() {
  const { slug } = useProfession() || {};
  const base = slug ? `/${slug}` : '/dental';

  return (
    <main>
      {/* Hero */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900">About</h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-600">
            The story behind InterviewPrep—and the person building it.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-gray-50">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 px-4 py-16 sm:px-6 md:grid-cols-[auto,1fr] lg:px-8">
          <img
            src="/images/kamron.jpg"
            alt="Kamron"
            className="h-24 w-24 rounded-full object-cover ring-2 ring-white shadow md:h-28 md:w-28"
          />

          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-base font-semibold text-gray-900">Hi, I’m Kamron</h2>
            <div className="mt-3 space-y-4 text-sm leading-6 text-gray-700">
              <p>
                I’m currently a student at UCSF School of Dentistry. During my application process,
                I participated in a handful of interviews and was accepted to schools such as
                 UPenn, Tufts, and UCSF. I built <strong>InterviewPrep</strong> because I know how intimidating the process can be—and
                I wanted to create the tool I wish I’d had when I was applying.
              </p>
              <p className="text-xs text-gray-500">
                If you ever want to chat or ask me any questions, you can reach me at <a className="underline" href="mailto:kam.interviewprep@gmail.com">kam.interviewprep@gmail.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
