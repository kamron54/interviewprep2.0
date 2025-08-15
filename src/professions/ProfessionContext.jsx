// src/professions/ProfessionContext.jsx
import { createContext, useContext, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import professions from './index.js'; // assumes src/professions/index.js exists

const ProfessionContext = createContext(null);

/**
 * Wraps routes under "/:profession/*".
 * - If there is a slug but it's unknown, redirect to "/".
 * - If there is no slug (non-profession routes), just render children (no config).
 */
export function ProfessionProvider({ children }) {
  const { profession: slug } = useParams() || {};

  // Not in a profession route (e.g., "/")
  if (!slug) return children;

  const config = professions[slug.toLowerCase()];
  if (!config) return <Navigate to="/" replace />;

  // Persist the last visited profession (used by header on non-slug pages like /dashboard)
  useEffect(() => {
    try {
      if (slug) localStorage.setItem('lastProfession', slug);
    } catch {}
  }, [slug]);

  return (
    <ProfessionContext.Provider value={{ slug, config }}>
      {children}
    </ProfessionContext.Provider>
  );
}

// ✅ Named hook export (this is what your HomePage import expects)
export function useProfession() {
  return useContext(ProfessionContext);
}

export default ProfessionContext;
