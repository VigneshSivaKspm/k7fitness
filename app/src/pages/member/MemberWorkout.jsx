import { useEffect, useState } from 'react';
import {
  Activity,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Flame,
  Layers,
  Printer,
  RotateCcw,
  Sparkles,
  Timer,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getTrainee } from '../../services/traineeService';
import { workoutService } from '../../services/planTemplateService';
import { fitnessGoalLabel } from '../../constants/options';

// Built-in sample routine based on goal for instant demonstration if none assigned yet
const SAMPLE_WORKOUTS = {
  muscle_building: {
    name: 'K7 Hypertrophy & Muscle Split',
    goal: 'Muscle Building',
    level: 'Intermediate',
    description: 'Designed for progressive overload and muscle hypertrophy across major muscle groups.',
    days: [
      {
        title: 'Day 1: Chest & Triceps',
        notes: 'Focus on full range of motion and 2-second eccentric lower.',
        exercises: [
          { name: 'Barbell Flat Bench Press', sets: '4', reps: '8-10', weight: 'Progressive', rest: '90s', instructions: 'Drive through feet, retract scapula' },
          { name: 'Incline Dumbbell Press', sets: '3', reps: '10-12', weight: 'Moderate', rest: '75s', instructions: '30 degree bench angle' },
          { name: 'Cable Chest Flyes', sets: '3', reps: '12-15', weight: 'Light/Mod', rest: '60s', instructions: 'Peak contraction squeeze' },
          { name: 'Rope Tricep Pushdown', sets: '4', reps: '12', weight: 'Moderate', rest: '60s', instructions: 'Flare rope out at bottom' },
          { name: 'Overhead Dumbbell Extension', sets: '3', reps: '10-12', weight: 'Moderate', rest: '60s', instructions: 'Keep elbows tucked' },
        ],
      },
      {
        title: 'Day 2: Back & Biceps',
        notes: 'Squeeze back muscles at peak contraction; pull with elbows.',
        exercises: [
          { name: 'Barbell Deadlifts', sets: '4', reps: '6-8', weight: 'Heavy', rest: '120s', instructions: 'Keep neutral spine and engage core' },
          { name: 'Wide-Grip Lat Pulldown', sets: '4', reps: '10-12', weight: 'Moderate', rest: '75s', instructions: 'Pull to upper chest' },
          { name: 'Seated Cable Row', sets: '3', reps: '10-12', weight: 'Moderate', rest: '60s', instructions: 'Pause 1s at torso' },
          { name: 'Standing Barbell Bicep Curls', sets: '4', reps: '10-12', weight: 'Moderate', rest: '60s', instructions: 'No swinging' },
          { name: 'Incline Dumbbell Hammer Curls', sets: '3', reps: '12', weight: 'Light/Mod', rest: '60s', instructions: 'Focus on brachialis & forearms' },
        ],
      },
      {
        title: 'Day 3: Legs & Core Power',
        notes: 'Warm up hip mobility thoroughly before squatting.',
        exercises: [
          { name: 'Barbell Back Squats', sets: '4', reps: '8-10', weight: 'Heavy', rest: '120s', instructions: 'Hit parallel safely' },
          { name: 'Leg Press (45 Degree)', sets: '3', reps: '12-15', weight: 'Moderate', rest: '90s', instructions: 'Full depth without rounding' },
          { name: 'Romanian Dumbbell Deadlifts', sets: '4', reps: '10-12', weight: 'Moderate', rest: '75s', instructions: 'Hinge hips backward' },
          { name: 'Leg Curl Machine', sets: '3', reps: '15', weight: 'Moderate', rest: '60s', instructions: 'Control return' },
          { name: 'Hanging Knee Raises', sets: '3', reps: '15-20', weight: 'Bodyweight', rest: '45s', instructions: 'Avoid swinging' },
        ],
      },
      {
        title: 'Day 4: Shoulders & Abs',
        notes: 'Strict form overhead; protect rotator cuffs.',
        exercises: [
          { name: 'Seated Overhead Dumbbell Press', sets: '4', reps: '8-10', weight: 'Moderate', rest: '90s', instructions: 'Elbows slightly forward' },
          { name: 'Dumbbell Lateral Raises', sets: '4', reps: '12-15', weight: 'Light', rest: '60s', instructions: 'Lead with elbows' },
          { name: 'Face Pulls with Rope', sets: '4', reps: '15', weight: 'Light/Mod', rest: '60s', instructions: 'High elbows to eye level' },
          { name: 'Plank Hold', sets: '3', reps: '60 sec', weight: 'Bodyweight', rest: '45s', instructions: 'Squeeze glutes and abs' },
        ],
      },
    ],
  },
  default: {
    name: 'K7 Total Conditioning & Fitness Split',
    goal: 'Weight Loss & Conditioning',
    level: 'All Levels',
    description: 'Balanced full body resistance split with metabolic conditioning for optimal fat loss and body toning.',
    days: [
      {
        title: 'Day 1: Upper Body Sculpt & Core',
        notes: 'Keep rest intervals brisk to sustain elevated calorie burn.',
        exercises: [
          { name: 'Dumbbell Chest Press', sets: '3', reps: '12-15', weight: 'Moderate', rest: '60s', instructions: 'Shoulder blades back' },
          { name: 'Seated Lat Pulldown', sets: '3', reps: '12-15', weight: 'Moderate', rest: '60s', instructions: 'Control eccentric' },
          { name: 'Dumbbell Shoulder Press', sets: '3', reps: '12', weight: 'Moderate', rest: '60s', instructions: 'Full lockout overhead' },
          { name: 'Bicycle Crunches', sets: '3', reps: '20', weight: 'Bodyweight', rest: '45s', instructions: 'Opposite elbow to knee' },
        ],
      },
      {
        title: 'Day 2: Lower Body Power & Glutes',
        notes: 'Focus on hip drive and controlled tempo.',
        exercises: [
          { name: 'Goblet Squats with Dumbbell', sets: '4', reps: '12-15', weight: 'Moderate', rest: '60s', instructions: 'Weight in heels' },
          { name: 'Dumbbell Romanian Deadlifts', sets: '3', reps: '12', weight: 'Moderate', rest: '60s', instructions: 'Hamstrings stretch' },
          { name: 'Walking Lunges', sets: '3', reps: '12/leg', weight: 'Light/Mod', rest: '45s', instructions: 'Drive with lead leg' },
          { name: 'Glute Bridges', sets: '3', reps: '15', weight: 'Moderate', rest: '45s', instructions: 'Squeeze at top' },
        ],
      },
      {
        title: 'Day 3: HIIT Cardio & Core Shred',
        notes: 'Maximum energy expenditure day.',
        exercises: [
          { name: 'Kettlebell Swings', sets: '4', reps: '20', weight: 'Moderate', rest: '45s', instructions: 'Snap hips' },
          { name: 'Mountain Climbers', sets: '4', reps: '30 sec', weight: 'Bodyweight', rest: '30s', instructions: 'Keep hips level' },
          { name: 'Battle Ropes', sets: '4', reps: '30 sec', weight: 'Moderate', rest: '45s', instructions: 'Explosive effort' },
          { name: 'Treadmill Interval Walk', sets: '1', reps: '15 min', weight: 'Cardio', rest: '—', instructions: 'Incline walk' },
        ],
      },
    ],
  },
};

export default function MemberWorkout() {
  const { member } = useAuth();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState({});
  const [viewMode, setViewMode] = useState('tracker'); // 'tracker' | 'chart'

  useEffect(() => {
    if (!member?.id) return;
    let cancelled = false;

    async function loadWorkout() {
      try {
        const trainee = await getTrainee(member.id);
        if (trainee?.workoutAssignmentId && !cancelled) {
          const w = await workoutService.getAssignment(trainee.workoutAssignmentId);
          if (!cancelled && w) {
            setWorkout(w);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load workout', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadWorkout();
    return () => {
      cancelled = true;
    };
  }, [member?.id]);

  const displayedWorkout = workout || (member?.goal === 'muscle_building' ? SAMPLE_WORKOUTS.muscle_building : SAMPLE_WORKOUTS.default);
  const isSample = !workout;

  const days = displayedWorkout.days || [];
  const currentDay = days[activeDayIndex] || days[0];

  const toggleExercise = (dayIdx, exIdx) => {
    const key = `${dayIdx}_${exIdx}`;
    setCompletedExercises((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const currentDayExercises = currentDay?.exercises || [];
  const currentDayCompletedCount = currentDayExercises.filter((_, idx) => completedExercises[`${activeDayIndex}_${idx}`]).length;
  const progressPercent = currentDayExercises.length > 0 ? Math.round((currentDayCompletedCount / currentDayExercises.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-red-600 text-white shadow-sm shadow-red-600/30">
            <Dumbbell className="size-4.5" />
          </div>
          <div>
            <h1 className="text-base font-black text-zinc-950">Workout Routine</h1>
            <p className="text-[0.68rem] text-zinc-500 truncate max-w-[170px]">
              {displayedWorkout.name}
            </p>
          </div>
        </div>

        {/* View Switcher: Interactive Day Tracker vs Full Chart */}
        <div className="flex rounded-2xl border border-zinc-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode('tracker')}
            className={`px-2.5 py-1 text-[0.68rem] font-bold rounded-xl transition ${
              viewMode === 'tracker'
                ? 'bg-zinc-950 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Session
          </button>
          <button
            type="button"
            onClick={() => setViewMode('chart')}
            className={`px-2.5 py-1 text-[0.68rem] font-bold rounded-xl transition ${
              viewMode === 'chart'
                ? 'bg-zinc-950 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            All Days
          </button>
        </div>
      </div>


      {/* VIEW MODE 1: DAY SESSION TRACKER */}
      {viewMode === 'tracker' && (
        <div className="space-y-3">
          {/* Day Selector Chips (Horizontal Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {days.map((d, idx) => (
              <button
                key={d.id || idx}
                type="button"
                onClick={() => setActiveDayIndex(idx)}
                className={`flex shrink-0 items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-bold transition ${
                  activeDayIndex === idx
                    ? 'border-red-600 bg-red-600 text-white shadow-sm shadow-red-600/30'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
                }`}
              >
                <span className={`flex size-4 items-center justify-center rounded-full text-[0.6rem] font-black ${activeDayIndex === idx ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-800'}`}>
                  {idx + 1}
                </span>
                <span className="truncate max-w-[110px]">{d.title.replace(/Day \d+:? ?/i, '')}</span>
              </button>
            ))}
          </div>

          {/* Active Day Progress Header */}
          <div className="rounded-3xl border border-zinc-200/90 bg-white p-4 shadow-sm shadow-zinc-200/40">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-3">
              <div>
                <h3 className="text-sm font-black text-zinc-950">{currentDay?.title}</h3>
                {currentDay?.notes && (
                  <p className="text-[0.68rem] text-zinc-500 mt-0.5">{currentDay.notes}</p>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-red-600">
                  {currentDayCompletedCount}/{currentDayExercises.length}
                </span>
                <span className="text-[0.65rem] text-zinc-400 block font-medium">Done</span>
              </div>
            </div>

            {/* Exercise Checklist */}
            <div className="space-y-2">
              {currentDayExercises.map((ex, eIdx) => {
                const done = Boolean(completedExercises[`${activeDayIndex}_${eIdx}`]);
                return (
                  <div
                    key={ex.id || eIdx}
                    onClick={() => toggleExercise(activeDayIndex, eIdx)}
                    className={`flex items-start justify-between gap-3 rounded-2xl border p-3 transition cursor-pointer select-none ${
                      done
                        ? 'border-emerald-200 bg-emerald-50/70 text-zinc-500'
                        : 'border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100/70 text-zinc-900'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-lg border transition ${
                          done
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-zinc-300 bg-white'
                        }`}
                      >
                        {done && <Check className="size-3.5 stroke-[3]" />}
                      </div>

                      <div>
                        <h4 className={`text-xs font-bold leading-tight ${done ? 'line-through text-zinc-400' : 'text-zinc-950'}`}>
                          {ex.name}
                        </h4>
                        {(ex.instructions || ex.duration) && (
                          <p className="mt-0.5 text-[0.65rem] text-zinc-500">
                            {[ex.instructions, ex.duration].filter(Boolean).join(' • ')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block rounded-lg bg-zinc-950 text-white font-mono text-[0.68rem] font-bold px-2 py-0.5">
                        {ex.sets} × {ex.reps}
                      </span>
                      {ex.weight && (
                        <span className="text-[0.65rem] font-bold text-red-600 block mt-0.5">
                          {ex.weight}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: FULL ALL-DAYS WORKOUT CHART */}
      {viewMode === 'chart' && (
        <div className="space-y-3">
          {days.map((day, dIdx) => (
            <div
              key={day.id || dIdx}
              className="rounded-3xl border border-zinc-200/90 bg-white overflow-hidden shadow-sm shadow-zinc-200/40"
            >
              <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-red-600 text-[0.65rem] font-black text-white">
                    {dIdx + 1}
                  </span>
                  <h3 className="font-extrabold text-xs text-zinc-950">{day.title}</h3>
                </div>
                <span className="text-[0.65rem] font-bold text-zinc-500">
                  {day.exercises?.length || 0} moves
                </span>
              </div>

              <div className="divide-y divide-zinc-100">
                {day.exercises?.map((ex, eIdx) => (
                  <div key={ex.id || eIdx} className="p-3 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <p className="font-bold text-zinc-900 text-xs">{ex.name}</p>
                      {ex.instructions && (
                        <p className="text-[0.65rem] text-zinc-500 mt-0.5">{ex.instructions}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-zinc-900 text-xs">
                        {ex.sets} × {ex.reps}
                      </span>
                      {ex.rest && (
                        <span className="text-[0.65rem] text-zinc-400 block font-mono">
                          Rest: {ex.rest}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
