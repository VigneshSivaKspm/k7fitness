import { Link } from 'react-router';
import { ArrowUpRight, BadgePercent, Contact, Dumbbell, ExternalLink, IdCard, Images, Info, LayoutTemplate, Quote, UserRound } from 'lucide-react';
import { PageHeader } from '../../components/ui/Layout';
import Button from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Feedback';
import { countActive } from '../../services/websiteService';
import { listPlans } from '../../services/membershipService';
import { useAsync, useDocumentTitle } from '../../hooks/useAsync';

const WEBSITE_URL = import.meta.env.VITE_WEBSITE_URL || '';

const SECTIONS = [
  { to: '/website/hero', label: 'Hero', description: 'Headline, buttons, background image and offer badge', icon: LayoutTemplate },
  { to: '/website/about', label: 'About', description: 'Story, mission, statistics and facilities', icon: Info },
  { to: '/website/programs', label: 'Programs', description: 'Training programs', icon: Dumbbell, count: 'programs' },
  { to: '/website/memberships', label: 'Membership plans', description: 'Pricing shown on the website', icon: IdCard, count: 'plans' },
  { to: '/website/trainers', label: 'Trainers', description: 'Coach profiles', icon: UserRound, count: 'trainers' },
  { to: '/website/gallery', label: 'Gallery', description: 'Photos and transformations', icon: Images, count: 'gallery' },
  { to: '/website/testimonials', label: 'Testimonials', description: 'Member reviews', icon: Quote, count: 'testimonials' },
  { to: '/website/offers', label: 'Offers', description: 'Promotions and announcements', icon: BadgePercent, count: 'offers' },
  { to: '/website/contact', label: 'Contact information', description: 'Phone, WhatsApp, address, map, hours and social links', icon: Contact },
];

export default function WebsiteOverview() {
  useDocumentTitle('Website');
  const counts = useAsync(async () => {
    const names = ['programs', 'trainers', 'gallery', 'testimonials', 'offers'];
    const [values, plans] = await Promise.all([Promise.all(names.map(countActive)), listPlans()]);
    return {
      ...Object.fromEntries(names.map((n, i) => [n, values[i]])),
      plans: plans.filter((p) => p.active && p.showOnWebsite).length,
    };
  }, []);

  return (
    <>
      <PageHeader
        title="Website"
        description="Update your public website yourself. Changes go live immediately, no developer needed."
        actions={
          WEBSITE_URL && (
            <Button variant="secondary" icon={ExternalLink} href={WEBSITE_URL}>
              Open website
            </Button>
          )
        }
      />
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {SECTIONS.map((s) => (
          <li key={s.to}>
            <Link to={s.to} className="card group flex h-full items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-pop">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ink text-white transition group-hover:bg-brand">
                <s.icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-zinc-900">{s.label}</span>
                  <ArrowUpRight className="size-4 text-zinc-300 transition group-hover:text-brand" />
                </span>
                <span className="mt-0.5 block text-sm text-zinc-500">{s.description}</span>
                {s.count && (
                  <span className="mt-2 block text-xs font-medium text-zinc-600">
                    {counts.loading ? (
                      <Skeleton className="h-3.5 w-24" />
                    ) : counts.data ? (
                      counts.data[s.count] ? (
                        <span className="text-emerald-700">{counts.data[s.count]} active</span>
                      ) : (
                        <span className="text-amber-700">Hidden: nothing to show yet</span>
                      )
                    ) : null}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
