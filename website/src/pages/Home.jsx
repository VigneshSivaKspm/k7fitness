import { useEffect } from 'react';
import Hero from '../components/sections/Hero';
import Offers from '../components/sections/Offers';
import About from '../components/sections/About';
import Programs from '../components/sections/Programs';
import Membership from '../components/sections/Membership';
import Trainers from '../components/sections/Trainers';
import Gallery from '../components/sections/Gallery';
import Testimonials from '../components/sections/Testimonials';
import CtaBand from '../components/sections/CtaBand';
import Contact from '../components/sections/Contact';
import { useContent } from '../context/ContentContext';
import { useSections } from '../hooks/useSections';

export default function Home() {
  const { contact, hero, loading } = useContent();
  const { visible } = useSections();

  // Keep the title/description in sync with CMS content.
  useEffect(() => {
    if (loading) return;
    document.title = `${contact.gymName} — ${hero.heading.replace(/\s+/g, ' ').trim()}`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && hero.subtitle) meta.setAttribute('content', hero.subtitle);
  }, [loading, contact.gymName, hero.heading, hero.subtitle]);

  // Deep links like /#membership: sections render after content loads, so scroll then.
  useEffect(() => {
    if (loading || !window.location.hash) return;
    const el = document.getElementById(window.location.hash.slice(1));
    if (el) requestAnimationFrame(() => el.scrollIntoView());
  }, [loading]);

  return (
    <main>
      <Hero />
      <Offers />
      {visible.about && <About />}
      <Programs />
      <Membership />
      <Trainers />
      <Gallery />
      <Testimonials />
      <CtaBand />
      <Contact />
    </main>
  );
}
