import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchWebsiteContent } from '../services/contentService';
import {
  DEFAULT_ABOUT,
  DEFAULT_CONTACT,
  DEFAULT_GALLERY,
  DEFAULT_HERO,
  DEFAULT_OFFERS,
  DEFAULT_PLANS,
  DEFAULT_PROGRAMS,
  DEFAULT_TESTIMONIALS,
  DEFAULT_TRAINERS,
} from '../constants/defaults';

const ContentContext = createContext(null);

/** Keeps admin-entered values and falls back to brand defaults only for empty fields. */
function withDefaults(defaults, data) {
  if (!data) return defaults;
  const merged = { ...defaults };
  for (const [key, value] of Object.entries(data)) {
    if (value !== '' && value !== null && value !== undefined) {
      if (Array.isArray(value) && value.length === 0) continue;
      merged[key] = value;
    }
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
      plans: d.plans?.length ? d.plans : DEFAULT_PLANS,
      programs: d.programs?.length ? d.programs : DEFAULT_PROGRAMS,
      trainers: d.trainers?.length ? d.trainers : DEFAULT_TRAINERS,
      gallery: d.gallery?.length ? d.gallery : DEFAULT_GALLERY,
      testimonials: d.testimonials?.length ? d.testimonials : DEFAULT_TESTIMONIALS,
      offers: d.offers?.length ? d.offers : DEFAULT_OFFERS,
    };
  }, [state]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used inside ContentProvider');
  return ctx;
}
