import {
  Activity,
  Award,
  Bike,
  Dumbbell,
  Flame,
  HeartPulse,
  PersonStanding,
  Target,
  Timer,
  Trophy,
  UserCheck,
  Users,
  Weight,
  Zap,
} from 'lucide-react';

/** Keys stored by the Admin CMS for facility icons. Keep in sync with admin/src/constants/icons.js */
export const FACILITY_ICONS = {
  dumbbell: Dumbbell,
  weight: Weight,
  'heart-pulse': HeartPulse,
  'user-check': UserCheck,
  zap: Zap,
  activity: Activity,
  flame: Flame,
  trophy: Trophy,
  bike: Bike,
  timer: Timer,
  target: Target,
  award: Award,
  users: Users,
  'person-standing': PersonStanding,
};

export function getFacilityIcon(key) {
  return FACILITY_ICONS[key] || Dumbbell;
}
