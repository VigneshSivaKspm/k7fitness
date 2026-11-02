/**
 * Brand defaults & demo showcase content.
 * All sections are fully populated out-of-the-box for client preview/demo.
 * When Firebase CMS is connected, admin-entered data takes precedence.
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
  description:
    'K7 Fitness Studio & Gym is a strength-first training space built for real results. With modern equipment, certified coaches and a focused, motivating atmosphere, we help beginners and experienced athletes alike train smarter, stay consistent and become their strongest selves.\n\nWhether your goal is fat loss, muscle gain, better health or a complete transformation, our coaches build a plan around you and keep you accountable every step of the way.',
  mission: 'To make expert coaching and a world-class training environment accessible to everyone who is ready to put in the work.',
  vision: 'To be the most trusted fitness community in our city, known for discipline, results and genuine care for every member.',
  images: [{ url: '/images/about-main.webp' }, { url: '/images/about-detail.webp' }],
  stats: [
    { label: 'Happy members', value: '500', suffix: '+' },
    { label: 'Expert trainers', value: '8', suffix: '' },
    { label: 'Years of experience', value: '10', suffix: '+' },
    { label: 'Training programs', value: '6', suffix: '' },
  ],
  benefits: [
    'Certified, experienced trainers',
    'Personalised workout & diet plans',
    'Modern strength & cardio equipment',
    'Clean, safe and motivating space',
    'Flexible early-morning & evening timings',
    'Regular progress assessments',
  ],
  facilities: [
    { id: 'f1', title: 'Strength Training', description: 'Power racks, platforms, barbells and a full range of free weights.', icon: 'dumbbell', active: true },
    { id: 'f2', title: 'Cardio Zone', description: 'Treadmills, bikes, cross-trainers and rowers for endurance and fat burn.', icon: 'heart-pulse', active: true },
    { id: 'f3', title: 'Personal Training', description: 'One-to-one coaching with a plan built entirely around your goals.', icon: 'user-check', active: true },
    { id: 'f4', title: 'Weight Training', description: 'Machines and dumbbells for every muscle group and every level.', icon: 'weight', active: true },
    { id: 'f5', title: 'Functional Training', description: 'Kettlebells, battle ropes, sleds and turf for athletic movement.', icon: 'zap', active: true },
    { id: 'f6', title: 'Cross Training', description: 'High-intensity circuits that build strength and conditioning together.', icon: 'flame', active: true },
    { id: 'f7', title: 'General Fitness', description: 'Balanced routines to improve health, mobility and everyday energy.', icon: 'activity', active: true },
    { id: 'f8', title: 'Transformation Programs', description: 'Structured, coach-led programs with diet guidance and check-ins.', icon: 'trophy', active: true },
  ],
};

export const DEFAULT_PROGRAMS = [
  {
    id: 'prog-strength',
    name: 'Strength Training',
    description: 'Build real, lasting strength with progressive barbell and dumbbell training guided by expert coaches.',
    duration: '12 weeks',
    imageUrl: '/images/program-strength.webp',
    benefits: ['Build muscle', 'Stronger lifts', 'Better posture'],
  },
  {
    id: 'prog-fat-loss',
    name: 'Fat Loss',
    description: 'High-energy conditioning combined with diet coaching to burn fat and boost your stamina.',
    duration: '8 weeks',
    imageUrl: '/images/program-fat-loss.webp',
    benefits: ['Burn fat', 'Improve stamina', 'Diet guidance'],
  },
  {
    id: 'prog-pt',
    name: 'Personal Training',
    description: 'One-to-one sessions with a dedicated coach, a custom plan and complete accountability.',
    duration: 'Flexible',
    imageUrl: '/images/program-personal-training.webp',
    benefits: ['Custom plan', 'Form correction', 'Faster results'],
  },
  {
    id: 'prog-transformation',
    name: 'Body Transformation',
    description: 'A complete coach-led transformation with training, nutrition and weekly progress check-ins.',
    duration: '16 weeks',
    imageUrl: '/images/program-transformation.webp',
    benefits: ['Full makeover', 'Nutrition plan', 'Weekly check-ins'],
  },
];

export const DEFAULT_PLANS = [
  {
    id: 'plan-monthly',
    name: 'Monthly',
    duration: 1,
    durationUnit: 'months',
    price: 1500,
    recommended: false,
    description: 'Flexible monthly training with complete floor access.',
    features: ['Full gym access', 'Cardio & strength zones', 'Locker access', 'General trainer guidance'],
  },
  {
    id: 'plan-quarterly',
    name: 'Quarterly',
    duration: 3,
    durationUnit: 'months',
    price: 4000,
    recommended: true,
    description: 'Our most popular plan for building solid consistency.',
    features: ['Full gym access', 'Cardio & strength zones', 'Custom diet consultation', 'Locker access', 'Fitness assessment'],
  },
  {
    id: 'plan-half-yearly',
    name: 'Half-Yearly',
    duration: 6,
    durationUnit: 'months',
    price: 7500,
    recommended: false,
    description: 'Committed training for serious transformation.',
    features: ['Full gym access', 'Diet consultation', 'Structured workout plan', 'Body composition check', 'Progress reviews'],
  },
  {
    id: 'plan-yearly',
    name: 'Yearly',
    duration: 12,
    durationUnit: 'months',
    price: 13000,
    recommended: false,
    description: 'Maximum value for round-the-year peak fitness.',
    features: ['Full gym access', 'Diet & workout plans', 'Quarterly assessments', 'Priority locker access', 'Best value per month'],
  },
];

export const DEFAULT_TRAINERS = [
  {
    id: 'trainer-1',
    name: 'Karthik Raja',
    specialization: 'Head Coach & Strength',
    experience: '10+ years experience',
    bio: 'Specialising in strength and powerlifting technique, guiding members to build long-term athletic discipline.',
    instagram: 'https://instagram.com',
    photoUrl: '/images/04-strength.png',
  },
  {
    id: 'trainer-2',
    name: 'Suresh Kumar',
    specialization: 'Fat Loss & Conditioning',
    experience: '6+ years experience',
    bio: 'Helps members lose fat sustainably with smart conditioning, functional circuits, and balanced lifestyle habits.',
    instagram: 'https://instagram.com',
    photoUrl: '/images/05-cardio.png',
  },
  {
    id: 'trainer-3',
    name: 'Praveen Anand',
    specialization: 'Personal Trainer & Mobility',
    experience: '5+ years experience',
    bio: 'Focuses on one-to-one coaching, correct form, injury prevention and building confidence for beginners.',
    instagram: 'https://instagram.com',
    photoUrl: '/images/06-personal-training.png',
  },
];

export const DEFAULT_GALLERY = [
  {
    id: 'gal-1',
    title: 'Strength Training Zone',
    caption: 'Heavy free weights and professional racks',
    category: 'Gym',
    imageUrl: '/images/04-strength.png',
  },
  {
    id: 'gal-2',
    title: 'Cardio & Endurance Area',
    caption: 'Modern treadmills, cycles and trainers',
    category: 'Cardio',
    imageUrl: '/images/05-cardio.png',
  },
  {
    id: 'gal-3',
    title: 'Personal Coaching Floor',
    caption: 'Dedicated 1-on-1 functional training space',
    category: 'Coaching',
    imageUrl: '/images/06-personal-training.png',
  },
  {
    id: 'gal-4',
    title: 'Transformation Area',
    caption: 'Equipped for complete body workouts',
    category: 'Gym',
    imageUrl: '/images/07-transformation.png',
  },
  {
    id: 'gal-5',
    title: 'Modern Workout Floor',
    caption: 'Clean, spacious and energizing atmosphere',
    category: 'Gym',
    imageUrl: '/images/about-main.webp',
  },
  {
    id: 'gal-6',
    title: 'Dumbbell & Free Weights Rack',
    caption: 'Weights ranging for all training levels',
    category: 'Equipment',
    imageUrl: '/images/about-detail.webp',
  },
];

export const DEFAULT_TESTIMONIALS = [
  {
    id: 'test-1',
    name: 'Arun K.',
    rating: 5,
    message: 'Lost 12 kg in four months. The coaches planned both my workouts and diet and kept me consistent. Best decision I made this year.',
  },
  {
    id: 'test-2',
    name: 'Priya S.',
    rating: 5,
    message: 'As a beginner I was nervous, but the trainers made me feel comfortable from day one. Clean gym, great equipment and a really positive atmosphere.',
  },
  {
    id: 'test-3',
    name: 'Vignesh R.',
    rating: 5,
    message: 'My squat and deadlift have gone up massively since joining K7. The strength program is well structured and the coaching on form is excellent.',
  },
  {
    id: 'test-4',
    name: 'Meena D.',
    rating: 5,
    message: 'Flexible timings fit perfectly around my work. Personal attention from the trainers makes a huge difference.',
  },
];

export const DEFAULT_OFFERS = [
  {
    id: 'offer-1',
    title: 'Special Offer: Up to 20% off on Annual Memberships',
    description: 'Join today and get 20% off yearly plans plus a free personal diet consultation. Limited slots available.',
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    ctaText: 'Claim offer',
    ctaLink: '#contact',
  },
];

export const DEFAULT_CONTACT = {
  gymName: 'K7 Fitness Studio & Gym',
  tagline: 'Fitness Studio & Gym',
  logoUrl: '',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  email: 'contact@k7fitness.in',
  address: 'K7 Fitness Studio, Main Road, Near Bus Stand, Gobichettipalayam, Erode, Tamil Nadu 638452',
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3910.3783877580004!2d77.44881127482853!3d11.452590688740303!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba93d736421928f%3A0x6222318f060d2f45!2sK7%20Fitness%20Studio!5e0!3m2!1sen!2sin!4v1791198399976!5m2!1sen!2sin',
  mapLink: 'https://www.google.com/maps/dir/?api=1&destination=11.4525907,77.4488113',
  instagram: 'https://instagram.com',
  facebook: 'https://facebook.com',
  youtube: '',
  openingHours: [
    { label: 'Monday – Saturday', hours: '5:30 AM – 10:00 PM' },
    { label: 'Sunday', hours: '6:00 AM – 12:00 PM' },
  ],
  whatsappMessage: 'Hi K7 Fitness! I would like to know more about your memberships.',
};
