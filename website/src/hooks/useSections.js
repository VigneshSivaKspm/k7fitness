import { useMemo } from 'react';
import { useLocation } from 'react-router';
import { useContent } from '../context/ContentContext';

const NAV = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'programs', label: 'Programs' },
  { id: 'membership', label: 'Membership' },
  { id: 'trainers', label: 'Trainers' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'contact', label: 'Contact' },
];

/** Which sections have real content. Navigation never links to an empty section. */
export function useSections() {
  const c = useContent();
  return useMemo(() => {
    const visible = {
      home: true,
      about: Boolean(c.about.description || c.about.stats?.length || c.about.facilities?.length),
      programs: c.programs.length > 0,
      membership: c.plans.length > 0,
      trainers: c.trainers.length > 0,
      gallery: c.gallery.length > 0,
      testimonials: c.testimonials.length > 0,
      contact: true,
    };
    return { visible, nav: NAV.filter((n) => visible[n.id]) };
  }, [c]);
}

/** Section anchors that also work from other pages (e.g. /privacy → /#contact). */
export function useSectionHref() {
  const { pathname } = useLocation();
  return (id) => (pathname === '/' ? `#${id}` : `/#${id}`);
}
