import { assetUrl } from '../../utils/format';
import { useOptionalSettings } from '../../context/SettingsContext';

/** K7 lockup for dark surfaces. Uses the uploaded logo when one is set. */
export default function Logo({ compact = false, className = '', subtitle = 'Admin' }) {
  const settings = useOptionalSettings();
  const logoUrl = settings?.business?.logoUrl;

  if (logoUrl) {
    return <img src={logoUrl} alt={settings.gymName} className={`h-9 w-auto object-contain ${className}`} />;
  }
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img src={assetUrl('brand/k7-mark.svg')} alt="" aria-hidden="true" className="h-9 w-auto" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[1.45rem] tracking-wider text-white">
            <span className="text-brand-bright">Fitness</span>
          </span>
          <span className="mt-0.5 text-[0.6rem] font-semibold tracking-[0.28em] text-zinc-500 uppercase">{subtitle}</span>
        </span>
      )}
      <span className="sr-only">K7 Fitness Studio & Gym</span>
    </span>
  );
}

