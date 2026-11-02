import { useEffect } from 'react';
import { useContent } from '../../context/ContentContext';

/**
 * schema.org HealthClub (LocalBusiness) markup built from CMS content, so
 * search engines can show the gym's name, phone, address and prices.
 */
export default function StructuredData() {
  const { loading, contact, hero, plans } = useContent();

  useEffect(() => {
    if (loading) return undefined;
    const prices = plans.map((p) => Number(p.price)).filter((n) => n > 0);
    const sameAs = ['instagram', 'facebook', 'youtube'].map((k) => contact[k]).filter((u) => /^https?:\/\//.test(u || ''));
    const data = {
      '@context': 'https://schema.org',
      '@type': 'HealthClub',
      name: contact.gymName,
      description: hero.subtitle,
      url: window.location.origin,
      ...(contact.logoUrl ? { logo: contact.logoUrl, image: contact.logoUrl } : {}),
      ...(contact.phone ? { telephone: contact.phone } : {}),
      ...(contact.email ? { email: contact.email } : {}),
      ...(contact.address ? { address: { '@type': 'PostalAddress', streetAddress: contact.address } } : {}),
      ...(prices.length ? { priceRange: `₹${Math.min(...prices)} – ₹${Math.max(...prices)}` } : {}),
      ...(sameAs.length ? { sameAs } : {}),
    };
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.text = JSON.stringify(data);
    document.head.appendChild(el);
    return () => el.remove();
  }, [loading, contact, hero.subtitle, plans]);

  return null;
}
