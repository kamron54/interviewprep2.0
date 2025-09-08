import { useEffect, useRef } from 'react';

export default function GuideFilter({ keepKeywords = [], activeProfession = 'Dental', hideCTA = true, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const H = (el) => el && /H2|H3/.test(el.tagName);
    const txt = (el) => (el.textContent || '').trim().toLowerCase();

    const prof = activeProfession.toLowerCase();
    const keepers = keepKeywords.map(k => k.toLowerCase());

    const heads = Array.from(root.querySelectorAll('h2, h3'));
    for (let i = 0; i < heads.length; i++) {
      const h = heads[i];
      const t = txt(h);

      const isCTA = hideCTA && t.includes('call to action');
      const isGeneral = t.includes('general');
      const isProf = ['dental','medical','nursing','pharmacy','pa','pt','ot'].some(p => t.includes(p));

      // decide to keep based on guide keywords
      let keep = false;
      if (!keepers.length) keep = true;
      if (keepers.some(k => t.includes(k))) keep = true;

      // general always allowed
      if (isGeneral) keep = true;
      // profession-specific only if matches active
      if (isProf) keep = t.includes(prof);

      if (isCTA) keep = false; // always hide CTA in guides

      // Apply to this heading + until next heading
      let node = h;
      while (node) {
        node.style.display = keep ? '' : 'none';
        node = node.nextElementSibling;
        if (node && H(node)) break;
      }
    }
  }, [keepKeywords, activeProfession, hideCTA]);

  return <div ref={ref}>{children}</div>;
}
