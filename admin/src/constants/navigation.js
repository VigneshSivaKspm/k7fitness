import {
  BarChart3,
  CalendarCheck,
  CalendarClock,
  CreditCard,
  Dumbbell,
  Globe,
  IdCard,
  Inbox,
  IndianRupee,
  LayoutDashboard,
  Menu,
  Salad,
  Settings,
  UserPlus,
  Users,
} from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/trainees', label: 'Trainees', icon: Users },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
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

/** Thumb-reachable shortcuts on mobile. `menu` opens the side drawer. */
export const MOBILE_TABS = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/trainees', label: 'Members', icon: Users },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { menu: true, label: 'Menu', icon: Menu, badge: 'newEnquiries' },
];

/** The centre "+" button on the mobile tab bar. */
export const QUICK_ACTIONS = [
  { to: '/attendance', label: 'Attendance', hint: "Mark today's check-ins", icon: CalendarCheck, tone: 'bg-violet-600 text-white' },
  { to: '/trainees/new', label: 'Add trainee', hint: 'New member with membership', icon: UserPlus, tone: 'bg-brand text-white' },
  { to: '/fees', label: 'Collect fees', hint: 'Members with pending dues', icon: IndianRupee, tone: 'bg-emerald-600 text-white' },
  { to: '/renewals', label: 'Renewals', hint: 'Expiring & expired members', icon: CalendarClock, tone: 'bg-amber-500 text-white' },
  { to: '/enquiries', label: 'Enquiries', hint: 'Leads from the website', icon: Inbox, tone: 'bg-sky-600 text-white' },
  { to: '/workouts/new', label: 'Workout plan', hint: 'Create a template', icon: Dumbbell, tone: 'bg-ink text-white' },
  { to: '/diets/new', label: 'Diet plan', hint: 'Create a template', icon: Salad, tone: 'bg-lime-600 text-white' },
];

/** Section title for the compact mobile header, from the longest matching nav path. */
export function sectionFor(pathname) {
  let best = null;
  for (const item of NAV_ITEMS) {
    for (const entry of item.children ? [item, ...item.children] : [item]) {
      const match = pathname === entry.to || pathname.startsWith(`${entry.to}/`);
      if (match && (!best || entry.to.length > best.to.length)) best = entry;
    }
  }
  return best;
}
