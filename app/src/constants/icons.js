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

/** Facility icon keys stored in Firestore. Keep in sync with website/src/constants/icons.js */
export const FACILITY_ICONS = [
  { key: 'dumbbell', label: 'Dumbbell', Icon: Dumbbell },
  { key: 'weight', label: 'Weights', Icon: Weight },
  { key: 'heart-pulse', label: 'Cardio', Icon: HeartPulse },
  { key: 'user-check', label: 'Personal training', Icon: UserCheck },
  { key: 'zap', label: 'Power', Icon: Zap },
  { key: 'activity', label: 'Activity', Icon: Activity },
  { key: 'flame', label: 'Fat burn', Icon: Flame },
  { key: 'trophy', label: 'Trophy', Icon: Trophy },
  { key: 'bike', label: 'Cycling', Icon: Bike },
  { key: 'timer', label: 'Timer', Icon: Timer },
  { key: 'target', label: 'Target', Icon: Target },
  { key: 'award', label: 'Award', Icon: Award },
  { key: 'users', label: 'Group', Icon: Users },
  { key: 'person-standing', label: 'Functional', Icon: PersonStanding },
];

export function getFacilityIcon(key) {
  return (FACILITY_ICONS.find((i) => i.key === key) || FACILITY_ICONS[0]).Icon;
}
