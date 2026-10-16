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
  Trophy,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getTrainee } from '../../services/traineeService';
import { workoutService } from '../../services/planTemplateService';
import { fitnessGoalLabel } from '../../constants/options';
import { ALL_WORKOUT_TEMPLATES } from '../../constants/workoutTemplatesCatalog';
import {
  getStoredWorkoutProgress,
  saveStoredWorkoutProgress,
} from '../../services/gamificationService';

export default function MemberWorkout() {
  const { member } = useAuth();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState({});
  const [viewMode, setViewMode] = useState('tracker'); // 'tracker' | 'chart'

  // Load persisted exercise ticks
  useEffect(() => {
    if (!member?.id) return;
    const stored = getStoredWorkoutProgress(member.id);
    if (stored?.completedMap) {
      setCompletedExercises(stored.completedMap);
    }
  }, [member?.id]);

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

  const fallbackWorkout =
    (member?.goal === 'muscle_gain' || member?.goal === 'muscle_building'
      ? ALL_WORKOUT_TEMPLATES.find((t) => t.id === 'wt-beg-weight-gain-6d')
      : ALL_WORKOUT_TEMPLATES.find((t) => t.id === 'wt-beg-fat-loss-6d')) ||
    ALL_WORKOUT_TEMPLATES[0];

  const displayedWorkout = workout || fallbackWorkout;
  const isSample = !workout;

  const days = displayedWorkout.days || [];
  const currentDay = days[activeDayIndex] || days[0];

  const toggleExercise = (dayIdx, exIdx) => {
    const key = `${dayIdx}_${exIdx}`;
    setCompletedExercises((prev) => {
      const updated = {
        ...prev,
        [key]: !prev[key],
      };

      const totalExercisesDone = Object.values(updated).filter(Boolean).length;
      let daysCleared = 0;
      days.forEach((d, dI) => {
        const dExercises = d.exercises || [];
        if (dExercises.length > 0 && dExercises.every((_, eI) => updated[`${dI}_${eI}`])) {
          daysCleared++;
        }
      });

      saveStoredWorkoutProgress(member?.id, {
        totalExercisesDone,
        daysCleared,
        completedMap: updated,
      });

      return updated;
    });
  };

  const resetDayProgress = (dayIdx) => {
    setCompletedExercises((prev) => {
      const updated = { ...prev };
      const dExercises = days[dayIdx]?.exercises || [];
      dExercises.forEach((_, eI) => {
        delete updated[`${dayIdx}_${eI}`];
      });

      const totalExercisesDone = Object.values(updated).filter(Boolean).length;
      let daysCleared = 0;
      days.forEach((d, dI) => {
        const exs = d.exercises || [];
        if (exs.length > 0 && exs.every((_, eI) => updated[`${dI}_${eI}`])) {
          daysCleared++;
        }
      });

      saveStoredWorkoutProgress(member?.id, {
        totalExercisesDone,
        daysCleared,
        completedMap: updated,
      });

      return updated;
    });
  };

  const currentDayExercises = currentDay?.exercises || [];
  const currentDayCompletedCount = currentDayExercises.filter((_, idx) => completedExercises[`${activeDayIndex}_${idx}`]).length;
  const progressPercent = currentDayExercises.length > 0 ? Math.round((currentDayCompletedCount / currentDayExercises.length) * 100) : 0;
  const isDayCleared = currentDayExercises.length > 0 && currentDayCompletedCount === currentDayExercises.length;
  const totalFinishedExercises = Object.values(completedExercises).filter(Boolean).length;

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
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-2.5">
              <div>
                <h3 className="text-sm font-black text-zinc-950">{currentDay?.title}</h3>
                {currentDay?.notes && (
                  <p className="text-[0.68rem] text-zinc-500 mt-0.5">{currentDay.notes}</p>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-red-600 font-mono">
                  {currentDayCompletedCount}/{currentDayExercises.length}
                </span>
                <span className="text-[0.65rem] text-zinc-400 block font-medium">Done</span>
              </div>
            </div>

            {/* Dynamic Day Progress Bar */}
            <div className="w-full bg-zinc-100 rounded-full h-1.5 mb-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Day Cleared Achievement Celebration */}
            {isDayCleared && (
              <div className="mb-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/15 to-amber-500/10 border border-amber-300/80 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Trophy className="size-4 text-amber-500" />
                  <span className="text-xs font-black text-zinc-950 uppercase tracking-tight">
                    Day Cleared! +30 Titan Points Earned!
                  </span>
                </div>
                <p className="text-[0.68rem] text-zinc-600 mt-0.5">
                  All {currentDayExercises.length} movements completed for today. Superb discipline!
                </p>
              </div>
            )}

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
                        <div className="flex items-center gap-1.5">
                          <h4 className={`text-xs font-bold leading-tight ${done ? 'line-through text-zinc-400' : 'text-zinc-950'}`}>
                            {ex.name}
                          </h4>
                          {done && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-emerald-100 text-emerald-700 px-1 py-0.2 text-[0.6rem] font-black">
                              <Sparkles className="size-2.5" /> +5 XP
                            </span>
                          )}
                        </div>
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

            {/* Card Footer: Overall Stats & Reset */}
            <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[0.68rem] text-zinc-500">
              <div className="flex items-center gap-1.5">
                <Flame className="size-3.5 text-red-500 fill-red-500" />
                <span>Overall: <strong className="text-zinc-900 font-mono">{totalFinishedExercises} moves</strong> completed</span>
              </div>
              {currentDayCompletedCount > 0 && (
                <button
                  type="button"
                  onClick={() => resetDayProgress(activeDayIndex)}
                  className="flex items-center gap-1 text-[0.65rem] font-bold text-zinc-400 hover:text-red-600 transition cursor-pointer"
                >
                  <RotateCcw className="size-3" />
                  Reset Day
                </button>
              )}
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
