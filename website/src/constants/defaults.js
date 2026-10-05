/**
 * Brand defaults shown until the gym owner customises content in the Admin CMS.
 * These are configuration defaults — not fake records. Every list section
 * (plans, trainers, gallery…) stays hidden until real data exists.
 */
export const DEFAULT_HERO = {
  eyebrow: 'K7 Fitness Studio & Gym',
  heading: 'Train hard.\nLive strong.',
  highlight: 'Live strong.',
  subtitle:
    'Strength, conditioning and real coaching under one roof. Build your strongest self with programs designed around your goals.',
  primaryCtaText: 'Join now',
  primaryCtaLink: '#contact',
  secondaryCtaText: 'View memberships',
  secondaryCtaLink: '#membership',
  imageUrl: '/images/hero.webp',
  badgeText: '',
  showBadge: false,
};

export const DEFAULT_ABOUT = {
  eyebrow: 'About K7',
  heading: 'Built for people who show up',
  description: '',
  mission: '',
  vision: '',
  images: [{ url: '/images/about-main.webp' }, { url: '/images/about-detail.webp' }],
  stats: [],
  facilities: [],
  benefits: [],
};

export const DEFAULT_CONTACT = {
  gymName: 'K7 Fitness Studio & Gym',
  tagline: 'Fitness Studio & Gym',
  logoUrl: '',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  // K7 Fitness Studio location (editable in Admin → Website → Contact information)
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3910.3783877580004!2d77.44881127482853!3d11.452590688740303!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba93d736421928f%3A0x6222318f060d2f45!2sK7%20Fitness%20Studio!5e0!3m2!1sen!2sin!4v1791198399976!5m2!1sen!2sin',
  mapLink: 'https://www.google.com/maps/dir/?api=1&destination=11.4525907,77.4488113',
  instagram: '',
  facebook: '',
  youtube: '',
  openingHours: [],
  whatsappMessage: 'Hi K7 Fitness! I would like to know more about your memberships.',
};
