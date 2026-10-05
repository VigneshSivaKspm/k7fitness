import { useNavigate } from 'react-router';
import { ArrowLeft, Printer } from 'lucide-react';
import Button from './ui/Button';
import { useSettings } from '../context/SettingsContext';
import { assetUrl } from '../utils/format';

/** A4-style printable page with a branded letterhead and on-screen toolbar. */
export default function PrintShell({ title, subtitle, children, footer }) {
  const navigate = useNavigate();
  const { business, gymName } = useSettings();

  return (
    <div className="min-h-svh bg-zinc-100 py-4 sm:py-8 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-3xl items-center justify-between gap-2 px-4">
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button icon={Printer} onClick={() => window.print()}>
          Print
        </Button>
      </div>
      <article className="print-area mx-auto max-w-3xl bg-white shadow-card sm:rounded-2xl">
        <header className="flex items-center justify-between gap-4 rounded-t-2xl bg-ink px-6 py-5 text-white sm:px-8">
          <div className="flex items-center gap-3">
            <img src={business.logoUrl || assetUrl('brand/k7-mark.svg')} alt="" className="h-10 w-auto" />
            <div>
              <p className="font-display text-2xl leading-none tracking-wider">{gymName}</p>
              {business.address && <p className="mt-1 max-w-xs text-[0.7rem] leading-snug text-zinc-400">{business.address}</p>}
            </div>
          </div>
          <div className="text-right text-[0.7rem] text-zinc-400">
            {business.phone && <p>{business.phone}</p>}
            {business.email && <p>{business.email}</p>}
          </div>
        </header>
        <div className="h-1 bg-brand" />
        <div className="px-6 py-6 sm:px-8">
          <h1 className="text-xl font-bold text-zinc-900">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-zinc-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <footer className="border-t border-zinc-100 px-6 py-4 text-center text-xs text-zinc-500 sm:px-8">{footer}</footer>}
      </article>
    </div>
  );
}
