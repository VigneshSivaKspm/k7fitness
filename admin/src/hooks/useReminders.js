import { useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';
import { fillTemplate, whatsappLink } from '../utils/format';
import { formatDate } from '../utils/dates';

/** Builds WhatsApp deep links from the configurable message templates in Settings. */
export function useReminders() {
  const { settings, gymName, money } = useSettings();

  const values = useCallback(
    (t) => ({
      name: (t.fullName || t.name || '').split(' ')[0],
      fullName: t.fullName || t.name || '',
      memberId: t.memberId || '',
      plan: t.currentPlanName || '',
      expiryDate: formatDate(t.membershipExpiry),
      amount: money(t.pendingAmount || 0),
      gymName,
    }),
    [gymName, money],
  );

  return {
    renewal: (t) => whatsappLink(t.phone, fillTemplate(settings.renewalTemplate, values(t))),
    payment: (t) => whatsappLink(t.phone, fillTemplate(settings.paymentReminderTemplate, values(t))),
    enquiry: (e) => whatsappLink(e.phone, fillTemplate(settings.enquiryTemplate, values(e))),
    chat: (phone) => whatsappLink(phone),
  };
}
