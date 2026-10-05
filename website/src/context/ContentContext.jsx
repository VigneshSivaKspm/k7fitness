import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchWebsiteContent } from '../services/contentService';
import { DEFAULT_ABOUT, DEFAULT_CONTACT, DEFAULT_HERO } from '../constants/defaults';

const ContentContext = createContext(null);

/** Keeps admin-entered values and falls back to brand defaults only for empty fields. */
function withDefaults(defaults, data) {
  if (!data) return defaults;
  const merged = { ...defaults };
  for (const [key, value] of Object.entries(data)) {
    if (value !== '' && value !== null && value !== undefined) merged[key] = value;
  }
  return merged;
}

export function ContentProvider({ children }) {
  const [state, setState] = useState({ loading: true, data: {} });

  useEffect(() => {
    let alive = true;
    fetchWebsiteContent().then((data) => alive && setState({ loading: false, data }));
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo(() => {
    const d = state.data;
    return {
      loading: state.loading,
      hero: withDefaults(DEFAULT_HERO, d.hero),
      about: withDefaults(DEFAULT_ABOUT, d.about),
      contact: withDefaults(DEFAULT_CONTACT, d.contact),
      plans: d.plans || [],
      programs: d.programs || [],
      trainers: d.trainers || [],
      gallery: d.gallery || [],
      testimonials: d.testimonials || [],
      offers: d.offers || [],
    };
  }, [state]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used inside ContentProvider');
  return ctx;
}
