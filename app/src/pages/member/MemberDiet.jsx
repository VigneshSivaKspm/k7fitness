import { useEffect, useState } from 'react';
import {
  Apple,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Droplets,
  Flame,
  LayoutGrid,
  List,
  Printer,
  Salad,
  Sparkles,
  Table as TableIcon,
  Utensils,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getTrainee } from '../../services/traineeService';
import { dietService } from '../../services/planTemplateService';
import { fitnessGoalLabel } from '../../constants/options';

// Built-in goal-based sample food charts for instant demonstration if none assigned yet
const SAMPLE_DIETS = {
  muscle_building: {
    name: 'K7 High Protein Muscle Food Chart',
    goal: 'Muscle Building & Strength',
    description: 'Caloric surplus diet focused on lean protein synthesis, complex carbohydrates and essential micronutrients.',
    calories: 2600,
    protein: 160,
    carbs: 310,
    fat: 65,
    waterLiters: '3.5 – 4 Litres',
    meals: [
      {
        slot: 'Pre-Workout Energizer',
        time: '6:30 AM',
        notes: 'Take 30-45 minutes before gym session for sustained glycogen.',
        items: [
          { food: 'Black Coffee or Warm Green Tea', quantity: '1 cup', notes: 'Boosts metabolic rate and focus' },
          { food: 'Bananas with Peanut Butter', quantity: '1 large banana + 1 tbsp peanut butter', alternatives: '2 medjool dates or 1 toast' },
        ],
      },
      {
        slot: 'Post-Workout Breakfast',
        time: '8:30 AM',
        notes: 'Crucial window for protein delivery and muscle recovery.',
        items: [
          { food: 'Egg Whites & Whole Eggs', quantity: '4 whites + 1 whole egg', alternatives: '150g Paneer or Tofu stir-fry' },
          { food: 'Rolled Oats with Milk', quantity: '80g oats with 200ml milk', notes: 'Add cinnamon & berries' },
          { food: 'Soaked Almonds & Walnuts', quantity: '8 almonds + 2 walnuts', notes: 'Essential fatty acids' },
        ],
      },
      {
        slot: 'High Protein Lunch',
        time: '1:30 PM',
        notes: 'Balanced macronutrient anchor meal of the day.',
        items: [
          { food: 'Grilled Chicken Breast or Fish', quantity: '150g', alternatives: '150g Paneer / Soya curry' },
          { food: 'Brown Rice or Multigrain Phulkas', quantity: '1.5 cups rice or 3 rotis' },
          { food: 'Yellow Dal or Rajma / Chana', quantity: '1 deep bowl (200g)', notes: 'Plant protein & fiber' },
          { food: 'Fresh Garden Salad', quantity: '1 large bowl', notes: 'Drizzle with lemon' },
        ],
      },
      {
        slot: 'Evening Refuel Snack',
        time: '5:30 PM',
        notes: 'Mid-day protein synthesis maintenance.',
        items: [
          { food: 'Boiled Sprouts Chaat', quantity: '1 cup (150g)', notes: 'Tossed with onion & lemon' },
          { food: 'Roasted Makhana (Foxnuts)', quantity: '1 small fistful (30g)', notes: 'Low GI crunchy snack' },
        ],
      },
      {
        slot: 'Lean & Clean Dinner',
        time: '8:30 PM',
        notes: 'Light on carbs, high on lean recovery proteins.',
        items: [
          { food: 'Stir-Fried Vegetables', quantity: '1 large bowl (200g)', notes: 'Broccoli, capsicum, beans' },
          { food: 'Grilled Paneer or Chicken', quantity: '120g protein source', alternatives: 'Lentil soup with 3 egg whites' },
          { food: 'Multigrain Roti', quantity: '2 rotis', notes: 'Optional low carb' },
        ],
      },
    ],
  },
  default: {
    name: 'K7 Clean Balanced Nutrition Plan',
    goal: 'Weight Loss & Conditioning',
    description: 'Caloric deficit diet prioritizing lean proteins, dense micronutrients and low GI carbs.',
    calories: 1950,
    protein: 130,
    carbs: 190,
    fat: 45,
    waterLiters: '3 – 3.5 Litres',
    meals: [
      {
        slot: 'Morning Kickstart',
        time: '7:00 AM',
        notes: 'Rehydrate and jumpstart metabolism.',
        items: [
          { food: 'Warm Lemon Water with Chia Seeds', quantity: '1 tall glass', notes: 'Digestive hydration' },
          { food: 'Boiled Eggs or Sprout Salad', quantity: '3 egg whites or 1 bowl sprouts' },
        ],
      },
      {
        slot: 'Wholesome Breakfast',
        time: '8:45 AM',
        items: [
          { food: 'Vegetable Oats or Moong Dal Chilla', quantity: '2 chillas or 1 bowl oats' },
          { food: 'Green Tea without Sugar', quantity: '1 cup' },
        ],
      },
      {
        slot: 'Balanced Lunch',
        time: '1:15 PM',
        items: [
          { food: 'Grilled Chicken or Tofu/Paneer', quantity: '120g' },
          { food: '2 Multigrain Rotis with Dal', quantity: '1 bowl dal' },
          { food: 'Cucumber & Tomato Salad', quantity: 'Generous bowl' },
        ],
      },
      {
        slot: 'Light Evening Snack',
        time: '5:00 PM',
        items: [
          { food: 'Roasted Chana / Makhana', quantity: '1 fistful' },
          { food: 'Black Coffee or Buttermilk', quantity: '1 cup' },
        ],
      },
      {
        slot: 'Recovery Dinner',
        time: '8:15 PM',
        items: [
          { food: 'Clear Vegetable Soup with Protein', quantity: '1 large bowl' },
          { food: 'Steamed Veggies & Grilled Protein', quantity: '1 bowl' },
        ],
      },
    ],
  },
};

export default function MemberDiet() {
  const { member } = useAuth();
  const [diet, setDiet] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active meal filter: 'all' or index (0, 1, 2, ...)
  const [activeMealTab, setActiveMealTab] = useState('all');
  // View mode: 'table' | 'cards'
  const [viewMode, setViewMode] = useState('table');
  // Expanded meal slots in card view (default: first meal open)
  const [expandedSlots, setExpandedSlots] = useState({ 0: true });

  useEffect(() => {
    if (!member?.id) return;
    let cancelled = false;

    async function loadDiet() {
      try {
        const trainee = await getTrainee(member.id);
        if (trainee?.dietAssignmentId && !cancelled) {
          const d = await dietService.getAssignment(trainee.dietAssignmentId);
          if (!cancelled && d) {
            setDiet(d);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load diet', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDiet();
    return () => {
      cancelled = true;
    };
  }, [member?.id]);

  const displayedDiet = diet || (member?.goal === 'muscle_building' ? SAMPLE_DIETS.muscle_building : SAMPLE_DIETS.default);
  const meals = displayedDiet.meals || [];

  const toggleSlot = (idx) => {
    setExpandedSlots((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Filtered meals based on tab
  const visibleMeals = activeMealTab === 'all'
    ? meals
    : meals.filter((_, idx) => idx === Number(activeMealTab));

  return (
    <div className="space-y-3 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-sm">
            <Salad className="size-4.5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-black text-zinc-950 truncate">Diet & Nutrition</h1>
            <p className="text-[0.68rem] text-zinc-500 truncate">
              {displayedDiet.name}
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-red-50 text-red-600 border border-red-200 px-2.5 py-0.5 text-[0.68rem] font-bold">
          {displayedDiet.goal || fitnessGoalLabel(member?.goal)}
        </span>
      </div>

      {/* Compact Macro & Calorie Strip Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-950 text-white p-3.5 sm:p-4 shadow-md border border-zinc-900">
        <div className="pointer-events-none absolute -right-6 -bottom-6 size-24 rounded-full bg-red-600/20 blur-xl" />
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <div>
              <span className="text-[0.6rem] font-bold uppercase tracking-wider text-red-400 block leading-tight">
                Energy Target
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-white leading-none">
                  {displayedDiet.calories || 2200}
                </span>
                <span className="text-[0.7rem] text-zinc-400 font-bold">kcal</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 divide-x divide-zinc-800 text-right">
            <div className="pl-2">
              <span className="text-[0.58rem] text-zinc-400 uppercase font-bold block leading-none">Protein</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-white leading-tight">
                {displayedDiet.protein || 140}g
              </span>
            </div>
            <div className="pl-2 sm:pl-3">
              <span className="text-[0.58rem] text-zinc-400 uppercase font-bold block leading-none">Carbs</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-white leading-tight">
                {displayedDiet.carbs || 220}g
              </span>
            </div>
            <div className="pl-2 sm:pl-3">
              <span className="text-[0.58rem] text-zinc-400 uppercase font-bold block leading-none">Water</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-blue-400 leading-tight">
                {displayedDiet.waterLiters || '3.5L'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar: Meal Quick-Tabs & View Toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[0.68rem] font-black uppercase tracking-wider text-zinc-500">
            {meals.length} Daily Meals
          </span>

          {/* Table vs Accordion View Toggle */}
          <div className="flex items-center rounded-xl bg-zinc-100 p-0.5 border border-zinc-200/80">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[0.65rem] font-bold transition ${
                viewMode === 'table'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Compact Table Matrix"
            >
              <TableIcon className="size-3 text-red-600" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[0.65rem] font-bold transition ${
                viewMode === 'cards'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Expandable Cards"
            >
              <List className="size-3 text-red-600" />
              <span>Cards</span>
            </button>
          </div>
        </div>

        {/* Horizontal Quick-Select Meal Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveMealTab('all')}
            className={`shrink-0 rounded-xl px-2.5 py-1 text-[0.68rem] font-bold transition active:scale-95 ${
              activeMealTab === 'all'
                ? 'bg-red-600 text-white shadow-xs shadow-red-600/30'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300'
            }`}
          >
            All Meals ({meals.length})
          </button>
          {meals.map((m, idx) => {
            const isSelected = activeMealTab === String(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveMealTab(String(idx))}
                className={`shrink-0 flex items-center gap-1 rounded-xl px-2.5 py-1 text-[0.68rem] font-bold transition active:scale-95 ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-xs shadow-red-600/30'
                    : 'bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-300'
                }`}
              >
                <span>{m.slot}</span>
                {m.time && (
                  <span
                    className={`font-mono text-[0.6rem] ${
                      isSelected ? 'text-red-200' : 'text-zinc-400'
                    }`}
                  >
                    {m.time}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. TABLE VIEW: Compact, Structured, High-Density Matrix   */}
      {/* ========================================================= */}
      {viewMode === 'table' ? (
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-150 bg-zinc-50/90 text-[0.65rem] font-black uppercase tracking-wider text-zinc-500">
                  <th className="py-2.5 px-3 w-[28%] sm:w-[22%]">Time / Meal</th>
                  <th className="py-2.5 px-3">What to Eat & Portions</th>
                  <th className="py-2.5 px-3 hidden sm:table-cell w-[30%]">Guidance / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {visibleMeals.map((meal, mIdx) => {
                  const actualIndex = activeMealTab === 'all' ? mIdx : Number(activeMealTab);
                  return (
                    <tr
                      key={actualIndex}
                      className="hover:bg-red-50/30 transition-colors align-top"
                    >
                      {/* Column 1: Time & Meal Name */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-zinc-950 text-white font-mono text-[0.62rem] font-bold">
                            {actualIndex + 1}
                          </span>
                          <span className="font-extrabold text-zinc-950 text-xs leading-tight">
                            {meal.slot}
                          </span>
                        </div>
                        {meal.time && (
                          <div className="mt-1 flex items-center gap-1 text-[0.65rem] font-mono font-bold text-red-600">
                            <Clock className="size-2.5" />
                            <span>{meal.time}</span>
                          </div>
                        )}
                        {/* Mobile view inline notes */}
                        {meal.notes && (
                          <p className="sm:hidden text-[0.62rem] text-zinc-500 italic mt-1 leading-tight">
                            💡 {meal.notes}
                          </p>
                        )}
                      </td>

                      {/* Column 2: Food Items & Portions */}
                      <td className="py-2 px-3 space-y-1.5">
                        {meal.items?.map((item, iIdx) => (
                          <div
                            key={iIdx}
                            className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 leading-snug"
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-zinc-900 text-xs">
                                • {item.food}
                              </span>
                              {item.notes && (
                                <span className="text-[0.65rem] text-zinc-400 ml-1.5">
                                  ({item.notes})
                                </span>
                              )}
                              {item.alternatives && (
                                <span className="block text-[0.65rem] text-red-600 font-medium pl-3">
                                  Alt: {item.alternatives}
                                </span>
                              )}
                            </div>
                            {item.quantity && (
                              <span className="shrink-0 rounded-md bg-zinc-100 border border-zinc-200/80 px-1.5 py-0.5 text-[0.62rem] font-mono font-bold text-zinc-700">
                                {item.quantity}
                              </span>
                            )}
                          </div>
                        ))}
                      </td>

                      {/* Column 3: Guidance / Notes (Desktop / Tablet) */}
                      <td className="py-2.5 px-3 hidden sm:table-cell text-[0.68rem] text-zinc-600 leading-relaxed">
                        {meal.notes ? (
                          <span className="inline-flex items-start gap-1">
                            <span className="text-amber-500 font-bold shrink-0">💡</span>
                            <span>{meal.notes}</span>
                          </span>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* 2. CARD ACCORDION VIEW: Collapsible Zero-Scroll Friendly  */
        /* ========================================================= */
        <div className="space-y-2">
          {visibleMeals.map((meal, mIdx) => {
            const actualIndex = activeMealTab === 'all' ? mIdx : Number(activeMealTab);
            const isOpen = expandedSlots[actualIndex] !== false;

            return (
              <div
                key={actualIndex}
                className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-xs transition"
              >
                {/* Collapsible Trigger Header */}
                <button
                  type="button"
                  onClick={() => toggleSlot(actualIndex)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-zinc-50 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-lg bg-zinc-950 text-white font-mono text-[0.68rem] font-bold">
                      {actualIndex + 1}
                    </span>
                    <div>
                      <h3 className="text-xs font-black text-zinc-950">{meal.slot}</h3>
                      <span className="text-[0.62rem] text-zinc-400">
                        {meal.items?.length || 0} items
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {meal.time && (
                      <span className="flex items-center gap-1 rounded-full bg-red-50 text-red-600 border border-red-200/80 px-2 py-0.5 text-[0.62rem] font-mono font-bold">
                        <Clock className="size-2.5" /> {meal.time}
                      </span>
                    )}
                    {isOpen ? (
                      <ChevronDown className="size-4 text-zinc-400" />
                    ) : (
                      <ChevronRight className="size-4 text-zinc-400" />
                    )}
                  </div>
                </button>

                {/* Collapsible Food Items Body */}
                {isOpen && (
                  <div className="px-3 pb-3 pt-1 border-t border-zinc-100 space-y-1.5 bg-zinc-50/50">
                    {meal.items?.map((item, iIdx) => (
                      <div
                        key={iIdx}
                        className="rounded-xl bg-white border border-zinc-200/80 p-2 flex items-start justify-between gap-2 text-xs shadow-2xs"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-900 leading-tight">{item.food}</p>
                          {item.notes && (
                            <p className="text-[0.62rem] text-zinc-500 mt-0.5">{item.notes}</p>
                          )}
                          {item.alternatives && (
                            <p className="text-[0.62rem] text-red-600 font-medium mt-0.5">
                              Alt: {item.alternatives}
                            </p>
                          )}
                        </div>
                        {item.quantity && (
                          <span className="shrink-0 rounded-md bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 text-[0.62rem] font-mono font-bold text-zinc-700">
                            {item.quantity}
                          </span>
                        )}
                      </div>
                    ))}

                    {meal.notes && (
                      <p className="text-[0.62rem] text-zinc-500 italic pt-1 pl-1">
                        💡 {meal.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
