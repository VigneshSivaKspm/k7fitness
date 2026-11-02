import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getBusinessProfile, getGeneralSettings } from '../services/settingsService';
import { countNewEnquiries } from '../services/enquiryService';
import { DEFAULT_BUSINESS, DEFAULT_SETTINGS } from '../constants/options';
import { currencySymbol, formatCurrency } from '../utils/format';
import { PageLoader } from '../components/ui/Feedback';

const SettingsContext = createContext(null);
const BADGE_REFRESH_MS = 2 * 60 * 1000;

/**
 * Private configuration (settings/general) + business identity
 * (websiteSettings/contact — the single source shared with the website).
 */
export function SettingsProvider({ children }) {
  const [general, setGeneral] = useState(DEFAULT_SETTINGS);
  const [business, setBusiness] = useState(DEFAULT_BUSINESS);
  const [newEnquiries, setNewEnquiries] = useState(0);
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    const [g, b] = await Promise.allSettled([getGeneralSettings(), getBusinessProfile()]);
    if (g.status === 'fulfilled' && g.value) setGeneral({ ...DEFAULT_SETTINGS, ...g.value });
    if (b.status === 'fulfilled' && b.value) setBusiness({ ...DEFAULT_BUSINESS, ...b.value });
    setReady(true);
  }, []);

  const refreshBadges = useCallback(async () => {
    try {
      setNewEnquiries(await countNewEnquiries());
    } catch {
      /* badge is non-critical */
    }
  }, []);

  useEffect(() => {
    reload();
    refreshBadges();
    const t = setInterval(refreshBadges, BADGE_REFRESH_MS);
    return () => clearInterval(t);
  }, [reload, refreshBadges]);

  const value = useMemo(() => {
    const alertDays = Number(general.expiryAlertDays) || DEFAULT_SETTINGS.expiryAlertDays;
    return {
      ready,
      settings: { ...general, expiryAlertDays: alertDays, feeDueDays: Number(general.feeDueDays) || 0 },
      business,
      gymName: business.gymName || DEFAULT_BUSINESS.gymName,
      money: (v) => formatCurrency(v, general.currency || 'INR'),
      symbol: currencySymbol(general.currency || 'INR'),
      newEnquiries,
      refreshBadges,
      reload,
    };
  }, [general, business, ready, newEnquiries, refreshBadges, reload]);

  return <SettingsContext.Provider value={value}>{ready ? children : <PageLoader label="Loading K7 Admin…" />}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}

/** For components that may render outside the signed-in area (e.g. the login page logo). */
export function useOptionalSettings() {
  return useContext(SettingsContext);
}
