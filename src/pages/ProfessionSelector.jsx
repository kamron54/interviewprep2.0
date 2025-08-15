// src/pages/ProfessionSelector.jsx
import { Link } from "react-router-dom";

export default function ProfessionSelector() {
  // You can add more categories later; we’ll start with Health Professions.
  const categories = [
    {
      title: "Health Professions School Admissions",
      items: [
        {
          name: "Dental School Admissions",
          slug: "dental",
          description:
            "Practice dental school interviews with tailored questions and instant feedback.",
          available: true,
        },
        {
          name: "Medical School Admissions",
          slug: "medical",
          description:
            "Dedicated question banks and guidance for MD/DO applicants.",
          available: true,
        },
        {
          name: "Physician Assistant Program Admissions",
          slug: "pa",
          description: "Scenario-based prompts and PA-specific interview prep.",
          available: false,
        },
        {
          name: "Pharmacy School Admissions",
          slug: "pharmacy",
          description:
            "Communication, ethics, and clinical reasoning—tailored for PharmD.",
          available: false,
        },
        {
          name: "Occupational Therapy Program Admissions",
          slug: "ot",
          description:
            "Client-centered scenarios and behavioral questions for OT programs.",
          available: false,
        },
        {
          name: "Physical Therapy School Admissions",
          slug: "pt",
          description:
            "PT-focused interview practice with instant, structured feedback.",
          available: false,
        },
        {
          name: "Veterinary Medicine School Admissions",
          slug: "veterinary",
          description:
            "Animal care ethics and client communication scenarios for DVM.",
          available: false,
        },
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Keep your brand voice */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-semibold tracking-tight">
          Nail your interviews.
        </h1>
        <p className="text-lg text-gray-700 mt-2">
          Practice mock interviews and get instant feedback.
        </p>
      </div>

      {categories.map((cat) => (
        <section key={cat.title} className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            {cat.title}
          </h2>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cat.items.map((item) =>
              item.available ? (
                // Clickable card (Dental)
                <Link
                  key={item.slug}
                  to={`/${item.slug}`}
                  className="group block bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-700">
                      {item.name}
                    </h3>
                    <span className="inline-flex items-center text-sm text-blue-700">
                      Start
                      <svg
                        className="ml-1 h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L12 6.414V16a1 1 0 11-2 0V6.414L5.707 9.707A1 1 0 114.293 8.293l5-5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600">{item.description}</p>
                </Link>
              ) : (
                // Disabled card (Coming soon)
                <div
                  key={item.slug}
                  className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 opacity-80 cursor-not-allowed"
                  aria-disabled="true"
                  role="group"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {item.name}
                    </h3>
                    <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                      Coming soon
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600">{item.description}</p>
                </div>
              )
            )}
          </div>
        </section>
      ))}

      {/* Future categories placeholder */}
      {/* <section className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-900">Test Prep</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          // Add cards later…
        </div>
      </section> */}
    </div>
  );
}
