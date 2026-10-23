import { useAsync } from './useAsync';
import { listPlans } from '../services/membershipService';

/** Membership plans (shared CRM + website collection). */
export function usePlans({ activeOnly = false } = {}) {
  const { data, loading, error, reload } = useAsync(() => listPlans({ activeOnly }), [activeOnly]);
  return { plans: data || [], loading, error, reload };
}
