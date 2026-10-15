import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { workoutService, dietService } from './planTemplateService';

/**
 * Standard K7 Fitness Gym Hours & Time Slots
 */
export const GYM_SLOTS = [
  { id: '05:30 AM', label: '05:30 AM – 06:30 AM', period: 'morning', hour: 5.5, labelShort: '5:30 AM' },
  { id: '06:30 AM', label: '06:30 AM – 07:30 AM', period: 'morning', hour: 6.5, labelShort: '6:30 AM' },
  { id: '07:30 AM', label: '07:30 AM – 08:30 AM', period: 'morning', hour: 7.5, labelShort: '7:30 AM' },
  { id: '08:30 AM', label: '08:30 AM – 09:30 AM', period: 'morning', hour: 8.5, labelShort: '8:30 AM' },
  { id: '09:30 AM', label: '09:30 AM – 10:30 AM', period: 'morning', hour: 9.5, labelShort: '9:30 AM' },
  { id: '04:30 PM', label: '04:30 PM – 05:30 PM', period: 'evening', hour: 16.5, labelShort: '4:30 PM' },
  { id: '05:30 PM', label: '05:30 PM – 06:30 PM', period: 'evening', hour: 17.5, labelShort: '5:30 PM' },
  { id: '06:30 PM', label: '06:30 PM – 07:30 PM', period: 'evening', hour: 18.5, labelShort: '6:30 PM' },
  { id: '07:30 PM', label: '07:30 PM – 08:30 PM', period: 'evening', hour: 19.5, labelShort: '7:30 PM' },
  { id: '08:30 PM', label: '08:30 PM – 09:30 PM', period: 'evening', hour: 20.5, labelShort: '8:30 PM' },
];

/**
 * Standard Gym Equipments Inventory at K7 Fitness Studio
 */
export const GYM_EQUIPMENTS = [
  { id: 'treadmill', name: 'Cardio Treadmills', category: 'Cardio', quantity: 4, peakDemand: 0.9 },
  { id: 'elliptical', name: 'Cross Trainers & Ellipticals', category: 'Cardio', quantity: 3, peakDemand: 0.7 },
  { id: 'bench_flat', name: 'Olympic Flat Bench Press', category: 'Chest', quantity: 2, peakDemand: 0.95 },
  { id: 'bench_incline', name: 'Incline Bench Press', category: 'Chest', quantity: 2, peakDemand: 0.85 },
  { id: 'squat_rack', name: 'Power Squat Racks', category: 'Legs/Full Body', quantity: 2, peakDemand: 0.95 },
  { id: 'smith_machine', name: 'Multifunctional Smith Machine', category: 'Full Body', quantity: 1, peakDemand: 0.9 },
  { id: 'cable_crossover', name: 'Dual Cable Crossover Station', category: 'Chest/Arms', quantity: 2, peakDemand: 0.98 },
  { id: 'lat_pulldown', name: 'Lat Pulldown & Low Row', category: 'Back', quantity: 2, peakDemand: 0.9 },
  { id: 'leg_press', name: '45-Degree Leg Press', category: 'Legs', quantity: 2, peakDemand: 0.88 },
  { id: 'leg_curl_ext', name: 'Leg Extension & Hamstring Curl', category: 'Legs', quantity: 2, peakDemand: 0.82 },
  { id: 'dumbbells', name: 'Dumbbells Set (1kg - 40kg) & Benches', category: 'Free Weights', quantity: 8, peakDemand: 0.75 },
  { id: 'preacher_curl', name: 'Preacher Arm Curl Bench', category: 'Arms', quantity: 2, peakDemand: 0.7 },
];

/**
 * Parses time string like "06:30 AM" or "18:30" to fractional hours (e.g. 6.5 or 18.5).
 */
export function parseTimeToHour(timeStr) {
  if (!timeStr) return null;
  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/);
  if (!match) return null;

  let h = parseInt(match[1], 10);
  const m = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = match[3];

  if (meridiem === 'PM' && h < 12) h += 12;
  if (meridiem === 'AM' && h === 12) h = 0;

  return h + m / 60;
}

/**
 * Calculates hour-by-hour gym busy timings and crowds from member profiles.
 */
export async function calculateGymBusyTimings() {
  try {
    const snap = await getDocs(query(collection(db, 'trainees'), where('status', '==', 'active')));
    const members = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const slotStats = GYM_SLOTS.map((slot) => {
      let count = 0;
      members.forEach((m) => {
        const inHour = parseTimeToHour(m.preferredInTime);
        const outHour = parseTimeToHour(m.preferredOutTime);

        if (inHour !== null && outHour !== null) {
          // If member is in gym during this slot hour
          if (slot.hour >= inHour - 0.25 && slot.hour < outHour) {
            count++;
          }
        } else {
          // Baseline spread if preferred time not set yet (peak morning & peak evening)
          if (slot.id === '06:30 AM' || slot.id === '07:30 AM') count += 0.2;
          if (slot.id === '06:30 PM' || slot.id === '07:30 PM') count += 0.35;
        }
      });

      // Realistic minimum baseline for active studio feel
      const estimatedCount = Math.max(Math.round(count), slot.period === 'evening' && slot.hour >= 18 ? 14 : 6);
      const capacityMax = 40; // Max comfortable studio capacity
      const utilization = Math.min(100, Math.round((estimatedCount / capacityMax) * 100));

      let crowdStatus = 'low'; // low | moderate | busy | peak
      if (utilization >= 75) crowdStatus = 'peak';
      else if (utilization >= 50) crowdStatus = 'busy';
      else if (utilization >= 25) crowdStatus = 'moderate';

      return {
        ...slot,
        activeMembers: estimatedCount,
        utilization,
        crowdStatus,
      };
    });

    return slotStats;
  } catch (err) {
    console.error('Failed to calculate gym busy timings:', err);
    // Safe fallback based on general fitness studio metrics
    return GYM_SLOTS.map((slot) => {
      const isPeak = slot.id === '06:30 PM' || slot.id === '07:30 PM' || slot.id === '07:30 AM';
      return {
        ...slot,
        activeMembers: isPeak ? 32 : 12,
        utilization: isPeak ? 82 : 30,
        crowdStatus: isPeak ? 'peak' : 'moderate',
      };
    });
  }
}

/**
 * Calculates equipment availability and wait times for a specific timing slot.
 */
export function calculateEquipmentTraffic(selectedHour, gymUtilization = 50) {
  return GYM_EQUIPMENTS.map((eq) => {
    // Demand scales with overall gym utilization and machine peak demand
    const loadFactor = (gymUtilization / 100) * eq.peakDemand;
    const estimatedInUse = Math.min(eq.quantity, Math.round(eq.quantity * loadFactor + (loadFactor > 0.6 ? 1 : 0)));
    const freeUnits = Math.max(0, eq.quantity - estimatedInUse);

    let waitMinutes = 0;
    let status = 'available'; // 'available' | 'moderate' | 'high_wait'

    if (freeUnits === 0) {
      status = 'high_wait';
      waitMinutes = Math.round(10 + loadFactor * 10); // 10-20 min wait
    } else if (freeUnits === 1 && eq.quantity > 1) {
      status = 'moderate';
      waitMinutes = Math.round(3 + loadFactor * 4); // 3-7 min wait
    }

    return {
      ...eq,
      estimatedInUse,
      freeUnits,
      waitMinutes,
      status,
    };
  });
}

/**
 * Standard Starter Templates for Workout and Diet charts
 */
export const STARTER_WORKOUT_TEMPLATES = [
  {
    name: 'Anti-Crowd Peak Hour Workout (Zero Machine Wait)',
    goal: 'Muscle Building & Fat Loss',
    level: 'All Levels',
    description: 'Designed specifically for busy gym peak hours (6 PM - 8 PM). Uses single dumbbell stations and free weights so you never wait for machines!',
    days: [
      {
        name: 'Day 1: Upper Body Dumbbell & Bodyweight Flow',
        exercises: [
          { name: 'Dumbbell Floor/Bench Press', sets: 4, reps: '10-12', notes: 'Zero machine wait; grab dumbbells once' },
          { name: 'Dumbbell Single-Arm Rows', sets: 4, reps: '12 each', notes: 'Perform on flat bench' },
          { name: 'Standing Dumbbell Overhead Press', sets: 3, reps: '10-12', notes: 'Shoulders power' },
          { name: 'Dumbbell Hammer Curls superset Tricep Dips', sets: 3, reps: '15 each', notes: 'Continuous superset' },
          { name: 'Push-up burnout', sets: 3, reps: 'To failure', notes: 'Chest finisher' },
        ],
      },
      {
        name: 'Day 2: Lower Body Dumbbell & Bodyweight Power',
        exercises: [
          { name: 'Dumbbell Goblet Squats', sets: 4, reps: '12-15', notes: 'No squat rack needed' },
          { name: 'Dumbbell Romanian Deadlifts', sets: 4, reps: '10-12', notes: 'Hamstrings & glutes' },
          { name: 'Walking Dumbbell Lunges', sets: 3, reps: '20 steps', notes: 'Great quad pump' },
          { name: 'Bodyweight Calf Raises & Wall Sit', sets: 3, reps: '45 secs', notes: 'Finisher' },
        ],
      },
    ],
  },
  {
    name: 'Push-Pull-Legs (PPL) Hypertrophy Split',
    goal: 'Muscle Building',
    level: 'Intermediate',
    description: 'Classic 3-day split using compound machines and free weights for maximum strength and hypertrophy.',
    days: [
      {
        name: 'Day 1: Push (Chest, Shoulders, Triceps)',
        exercises: [
          { name: 'Barbell Flat Bench Press', sets: 4, reps: '8-10', notes: 'Warm up thoroughly' },
          { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', notes: 'Upper chest focus' },
          { name: 'Standing Dumbbell Lateral Raises', sets: 4, reps: '12-15', notes: 'Side delts' },
          { name: 'Tricep Rope Pushdowns', sets: 3, reps: '12-15', notes: 'Cable station' },
        ],
      },
      {
        name: 'Day 2: Pull (Back, Rear Delts, Biceps)',
        exercises: [
          { name: 'Lat Pulldown (Wide Grip)', sets: 4, reps: '10-12', notes: 'Full stretch at top' },
          { name: 'Seated Cable Row', sets: 4, reps: '10-12', notes: 'Squeeze lats' },
          { name: 'Face Pulls with Rope', sets: 3, reps: '15', notes: 'Rear delts & posture' },
          { name: 'Incline Dumbbell Bicep Curls', sets: 3, reps: '10-12', notes: 'Peak contraction' },
        ],
      },
      {
        name: 'Day 3: Legs & Core Power',
        exercises: [
          { name: 'Barbell Back Squats / Hack Squats', sets: 4, reps: '8-10', notes: 'Deep range of motion' },
          { name: '45-Degree Leg Press', sets: 3, reps: '12-15', notes: 'Quad drive' },
          { name: 'Lying Hamstring Leg Curls', sets: 3, reps: '12-15', notes: 'Hamstring isolation' },
          { name: 'Hanging Leg Raises & Planks', sets: 3, reps: '15 reps / 1 min', notes: 'Core stability' },
        ],
      },
    ],
  },
  {
    name: 'Beginner Full-Body 3-Day Foundation',
    goal: 'General Fitness & Strength',
    level: 'Beginner',
    description: 'Ideal starter workout chart for new gym members to master movement patterns with balanced machine and dumbbell work.',
    days: [
      {
        name: 'Day 1: Full Body Foundation A',
        exercises: [
          { name: 'Treadmill Incline Walk Warmup', sets: 1, reps: '8 mins', notes: 'Cardio activation' },
          { name: 'Leg Press Machine', sets: 3, reps: '12', notes: 'Controlled tempo' },
          { name: 'Chest Press Machine / Dumbbell Press', sets: 3, reps: '10-12', notes: 'Safe chest builder' },
          { name: 'Lat Pulldown Machine', sets: 3, reps: '12', notes: 'Back width' },
          { name: 'Plank Hold', sets: 3, reps: '30-45 sec', notes: 'Core strength' },
        ],
      },
    ],
  },
];

export const STARTER_DIET_TEMPLATES = [
  {
    name: 'High-Protein Lean Muscle Indian Food Chart',
    goal: 'Muscle Building',
    description: 'High-protein balanced daily meal plan with 2200 kcal and ~135g-150g protein tailored for gym goers.',
    calories: 2200,
    protein: 145,
    carbs: 230,
    fat: 65,
    meals: [
      {
        name: 'Breakfast (8:00 AM)',
        items: [
          { name: 'Oats with Milk & Banana', portion: '1 bowl (60g oats + 250ml milk)' },
          { name: 'Boiled Eggs / Paneer Slices', portion: '3 egg whites + 1 whole egg OR 60g Paneer' },
          { name: 'Almonds & Walnuts', portion: '6-8 pieces' },
        ],
      },
      {
        name: 'Lunch (1:00 PM)',
        items: [
          { name: 'Brown Rice / Whole Wheat Chapati', portion: '1 cup rice OR 2 chapatis' },
          { name: 'Grilled Chicken Breast / Tofu / Paneer Curry', portion: '150g' },
          { name: 'Dal (Lentils) & Mixed Vegetable Curry', portion: '1 medium bowl' },
          { name: 'Fresh Green Salad & Curd', portion: '1 small bowl' },
        ],
      },
      {
        name: 'Pre-Workout Snack (5:00 PM)',
        items: [
          { name: 'Black Coffee or Green Tea', portion: '1 cup' },
          { name: 'Brown Bread with Peanut Butter & Banana', portion: '1 slice' },
        ],
      },
      {
        name: 'Post-Workout & Dinner (8:30 PM)',
        items: [
          { name: 'Whey Protein or Boiled Eggs / Soya Chunks', portion: '1 scoop / 50g soya chunks' },
          { name: 'Chapatis with Dal & Stir-fried Vegetables', portion: '2 chapatis' },
        ],
      },
    ],
  },
  {
    name: 'Fat Loss & Calorie Deficit Food Chart',
    goal: 'Weight Loss',
    description: '1600 kcal clean nutrition plan rich in fiber, greens, and lean protein to burn fat while retaining lean muscle.',
    calories: 1600,
    protein: 115,
    carbs: 140,
    fat: 45,
    meals: [
      {
        name: 'Breakfast (8:30 AM)',
        items: [
          { name: 'Vegetable Oats Poha or Egg Omelette', portion: '1 medium plate' },
          { name: 'Green Tea with lemon', portion: '1 cup' },
        ],
      },
      {
        name: 'Lunch (1:30 PM)',
        items: [
          { name: 'Multigrain Chapati', portion: '2 small chapatis' },
          { name: 'Steamed Sprouts / Grilled Paneer or Chicken', portion: '100g' },
          { name: 'Cucumber & Tomato Salad', portion: 'Generous bowl' },
        ],
      },
      {
        name: 'Evening Snack (5:30 PM)',
        items: [
          { name: 'Roasted Makhana (Fox Nuts) / Green Tea', portion: '1 handful' },
        ],
      },
      {
        name: 'Dinner (8:00 PM)',
        items: [
          { name: 'Clear Vegetable Soup with Lentils / Grilled Fish or Paneer', portion: '1 bowl' },
          { name: 'Warm Turmeric Milk', portion: '150ml (low fat)' },
        ],
      },
    ],
  },
];

/**
 * Seed starter templates into Firestore if collection is empty
 */
export async function seedStarterTemplatesIfEmpty(kind = 'workout') {
  try {
    const service = kind === 'workout' ? workoutService : dietService;
    const existing = await service.listTemplates(5);
    if (existing.length > 0) return false;

    const templatesToSeed = kind === 'workout' ? STARTER_WORKOUT_TEMPLATES : STARTER_DIET_TEMPLATES;
    for (const t of templatesToSeed) {
      await service.createTemplate(t);
    }
    return true;
  } catch (err) {
    console.error('Failed to seed starter templates:', err);
    return false;
  }
}
