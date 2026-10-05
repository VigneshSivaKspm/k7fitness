import {
  BarChart3,
  CalendarClock,
  CreditCard,
  Dumbbell,
  Globe,
  IdCard,
  Inbox,
  LayoutDashboard,
  Salad,
  Settings,
  Users,
} from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/trainees', label: 'Trainees', icon: Users },
  { to: '/memberships', label: 'Memberships', icon: IdCard },
  { to: '/fees', label: 'Fees', icon: CreditCard },
  { to: '/workouts', label: 'Workout Plans', icon: Dumbbell },
  { to: '/diets', label: 'Diet Plans', icon: Salad },
  { to: '/renewals', label: 'Renewals', icon: CalendarClock },
  { to: '/enquiries', label: 'Enquiries', icon: Inbox, badge: 'newEnquiries' },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  {
    to: '/website',
    label: 'Website',
    icon: Globe,
    children: [
      { to: '/website', label: 'Overview', end: true },
      { to: '/website/hero', label: 'Hero' },
      { to: '/website/about', label: 'About' },
      { to: '/website/programs', label: 'Programs' },
      { to: '/website/memberships', label: 'Membership Plans' },
      { to: '/website/trainers', label: 'Trainers' },
      { to: '/website/gallery', label: 'Gallery' },
      { to: '/website/testimonials', label: 'Testimonials' },
      { to: '/website/offers', label: 'Offers' },
      { to: '/website/contact', label: 'Contact Information' },
    ],
  },
  { to: '/settings', label: 'Settings', icon: Settings },
];

/** Thumb-reachable shortcuts on mobile. */
export const MOBILE_TABS = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/trainees', label: 'Members', icon: Users },
  { to: '/fees', label: 'Fees', icon: CreditCard },
  { to: '/renewals', label: 'Renewals', icon: CalendarClock },
];
