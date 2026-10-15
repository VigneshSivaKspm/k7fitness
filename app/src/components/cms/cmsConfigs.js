import { BadgePercent, Dumbbell, Quote, UserRound } from 'lucide-react';

/**
 * Field-driven configuration for simple website collections.
 * Field types: text | textarea | url | link | image | list | rating | date | number
 * Image fields store `${urlKey}` and `${pathKey}` on the document.
 */
export const CMS_COLLECTIONS = {
  programs: {
    collection: 'programs',
    title: 'Programs',
    singular: 'program',
    description: 'Training programs shown on the website (e.g. Strength, Cardio, Transformation).',
    icon: Dumbbell,
    titleKey: 'name',
    subtitle: (i) => [i.duration, i.benefits?.length ? `${i.benefits.length} benefits` : ''].filter(Boolean).join(' · '),
    imageKey: 'imageUrl',
    reorder: true,
    fields: [
      { key: 'image', type: 'image', label: 'Image', urlKey: 'imageUrl', pathKey: 'imagePath', folder: 'public/programs', aspect: 'aspect-[4/3]' },
      { key: 'name', type: 'text', label: 'Program name', required: true, max: 60 },
      { key: 'duration', type: 'text', label: 'Duration', placeholder: 'e.g. 12 weeks · 60 min sessions', max: 60 },
      { key: 'description', type: 'textarea', label: 'Short description', max: 300 },
      { key: 'benefits', type: 'list', label: 'Benefits', placeholder: 'e.g. Build lean muscle' },
    ],
  },
  trainers: {
    collection: 'trainers',
    title: 'Trainers',
    singular: 'trainer',
    description: 'Coaches shown on the website.',
    icon: UserRound,
    titleKey: 'name',
    subtitle: (i) => [i.specialization, i.experience].filter(Boolean).join(' · '),
    imageKey: 'photoUrl',
    reorder: true,
    fields: [
      { key: 'photo', type: 'image', label: 'Photo', urlKey: 'photoUrl', pathKey: 'photoPath', folder: 'public/trainers', aspect: 'aspect-[4/5]', maxSize: 1200 },
      { key: 'name', type: 'text', label: 'Name', required: true, max: 60 },
      { key: 'specialization', type: 'text', label: 'Specialization', placeholder: 'e.g. Strength & Conditioning', max: 60 },
      { key: 'experience', type: 'text', label: 'Experience', placeholder: 'e.g. 8+ years experience', max: 60 },
      { key: 'bio', type: 'textarea', label: 'Biography', max: 500 },
      { key: 'instagram', type: 'url', label: 'Instagram profile URL', placeholder: 'https://instagram.com/…' },
    ],
  },
  testimonials: {
    collection: 'testimonials',
    title: 'Testimonials',
    singular: 'testimonial',
    description: 'Member reviews shown on the website.',
    icon: Quote,
    titleKey: 'name',
    subtitle: (i) => `${'★'.repeat(Number(i.rating) || 0)} · ${String(i.message || '').slice(0, 60)}${String(i.message || '').length > 60 ? '…' : ''}`,
    imageKey: 'photoUrl',
    reorder: true,
    fields: [
      { key: 'photo', type: 'image', label: 'Photo', optional: true, urlKey: 'photoUrl', pathKey: 'photoPath', folder: 'public/testimonials', aspect: 'aspect-square', maxSize: 400 },
      { key: 'name', type: 'text', label: 'Member name', required: true, max: 60 },
      { key: 'rating', type: 'rating', label: 'Rating', defaultValue: 5 },
      { key: 'message', type: 'textarea', label: 'Testimonial', required: true, max: 600 },
    ],
  },
  offers: {
    collection: 'offers',
    title: 'Offers',
    singular: 'offer',
    description: 'Promotions and announcements. Expired offers are hidden from the website automatically.',
    icon: BadgePercent,
    titleKey: 'title',
    imageKey: 'imageUrl',
    reorder: false,
    fields: [
      { key: 'image', type: 'image', label: 'Image', optional: true, urlKey: 'imageUrl', pathKey: 'imagePath', folder: 'public/offers', aspect: 'aspect-video' },
      { key: 'title', type: 'text', label: 'Title', required: true, max: 80, placeholder: 'e.g. Diwali Offer: 20% off yearly plans' },
      { key: 'description', type: 'textarea', label: 'Description', max: 300 },
      { key: 'startDate', type: 'date', label: 'Start date', required: true },
      { key: 'endDate', type: 'date', label: 'End date', required: true, after: 'startDate' },
      { key: 'ctaText', type: 'text', label: 'Button text', placeholder: 'Claim offer', max: 30 },
      { key: 'ctaLink', type: 'link', label: 'Button link', placeholder: '#contact or https://…' },
    ],
  },
};
