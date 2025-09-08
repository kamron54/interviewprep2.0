export default function GuideShell({ title, subtitle, children }) {
  return (
    <main className="bg-gray-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">{title}</h1>
          {subtitle && <p className="mt-2 max-w-2xl text-gray-600">{subtitle}</p>}
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div
            className="
              rounded-2xl border bg-white p-6 shadow-sm
              [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-900
              [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-900
              [&_p]:text-gray-700 [&_p]:leading-7
              [&_ul]:list-disc [&_ul]:pl-6 [&_li]:marker:text-gray-400
              [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:text-gray-800 [&_blockquote]:italic
              [&_a]:text-teal-700 hover:[&_a]:underline
            "
          >
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
