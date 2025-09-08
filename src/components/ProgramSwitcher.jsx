import { Fragment, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Listbox, Transition } from '@headlessui/react';
import { useProfession } from '../professions/ProfessionContext.jsx';
import professions from '../professions';

function ChevronDown(props) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

export default function ProgramSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const current = useProfession?.()?.slug;

  const options = useMemo(() =>
    Object.values(professions).map(p => ({ slug: p.slug, label: p.displayName || p.slug })),
  []);

  const active = options.find(o => o.slug === current) || options[0];

  const go = (slug) => {
    const parts = location.pathname.split('/').filter(Boolean);
    const sub = parts.length > 1 ? parts.slice(1).join('/') : '';
    navigate(sub ? `/${slug}/${sub}` : `/${slug}`);
  };

  return (
    <Listbox value={active} onChange={(opt) => go(opt.slug)}>
      <div className="relative">
        {/* Button (trigger) */}
        <Listbox.Button
          className="
            inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900
            focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
          "
        >
          <span>{active?.label}</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Listbox.Button>

        {/* Menu (styled, like Lovable) */}
        <Transition as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-75"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Listbox.Options
            className="
              absolute z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white
              shadow-lg ring-1 ring-black/5
            "
          >
            {options.map((o) => (
              <Listbox.Option
                key={o.slug}
                value={o}
                className={({ active }) =>
                  [
                    'cursor-pointer select-none px-3 py-2 text-sm',
                    active ? 'bg-teal-50' : 'bg-white',
                  ].join(' ')
                }
              >
                {({ selected }) => (
                  <div className="flex items-center justify-between">
                    <span className={selected ? 'font-semibold text-gray-900' : 'text-gray-800'}>
                      {o.label}
                    </span>
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
