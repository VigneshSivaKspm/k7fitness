import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, ArrowRight, CheckCircle2, Clock, Dumbbell, Flame, Sparkles, Zap } from 'lucide-react';
import { calculateEquipmentTraffic, calculateGymBusyTimings, GYM_SLOTS } from '../../services/trafficService';
import { workoutService } from '../../services/planTemplateService';
import { useToast } from '../../context/ToastContext';
import Button from '../ui/Button';

export default function GymTrafficHeatmap({ onTemplateCreated, currentSlotId, memberMode = false }) {
  const toast = useToast();
  const [slotData, setSlotData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlotId, setSelectedSlotId] = useState(currentSlotId || '06:30 PM');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    calculateGymBusyTimings()
      .then((data) => {
        setSlotData(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeSlot = slotData.find((s) => s.id === selectedSlotId) || slotData[6] || GYM_SLOTS[6];
  const equipmentStatus = calculateEquipmentTraffic(activeSlot?.hour || 18.5, activeSlot?.utilization || 75);

  const handleGenerateOptimizedPlan = async () => {
    setGenerating(true);
    try {
      const isPeak = activeSlot?.crowdStatus === 'peak' || activeSlot?.crowdStatus === 'busy';
      const templateName = isPeak
        ? `Anti-Crowd Peak Workout (${activeSlot.id} Rush)`
        : `Full-Machine Power Workout (${activeSlot.id} Calm)`;

      const newTemplate = {
        name: templateName,
        goal: isPeak ? 'Fat Loss & Conditioning (Zero Waiting)' : 'Strength & Muscle Hypertrophy',
        level: 'All Levels',
        description: isPeak
          ? `Specially balanced for gym rush hours at ${activeSlot.label}. Uses free-weight dumbbell stations and bodyweight complexes to bypass machine queues.`
          : `Tailored for off-peak training at ${activeSlot.label}. Leverages full cable stations and heavy squat racks with zero queue delay.`,
        days: [
          {
            name: isPeak ? 'Day 1: Dumbbell Superflow (No Equipment Queue)' : 'Day 1: Heavy Compound Machine Power',
            exercises: isPeak
              ? [
                  { name: 'Dumbbell Incline/Flat Bench Press', sets: 4, reps: '10-12', notes: 'Single bench setup; no waiting' },
                  { name: 'Dumbbell Standing Overhead Press', sets: 3, reps: '12', notes: 'Delts power' },
                  { name: 'Goblet Squats & Walking Lunges', sets: 4, reps: '15 reps', notes: 'Bypasses squat rack line' },
                  { name: 'Dumbbell Bent-over Rows', sets: 4, reps: '12', notes: 'Back density' },
                  { name: 'Push-up & Core Finisher', sets: 3, reps: 'To failure', notes: 'Zero machine wait' },
                ]
              : [
                  { name: 'Olympic Barbell Flat Bench', sets: 4, reps: '8-10', notes: 'Prime chest compound' },
                  { name: 'Dual Cable Crossover Flyes', sets: 4, reps: '12-15', notes: 'Chest contraction' },
                  { name: 'Power Squat Rack Back Squats', sets: 4, reps: '8-10', notes: 'Full depth' },
                  { name: 'Lat Pulldown (Wide Grip)', sets: 4, reps: '10-12', notes: 'Back width' },
                  { name: '45-Degree Leg Press', sets: 3, reps: '12', notes: 'Quad overload' },
                ],
          },
        ],
      };

      const id = await workoutService.createTemplate(newTemplate);
      toast.success(`Generated and saved "${templateName}" template!`);
      if (onTemplateCreated) onTemplateCreated(id);
    } catch (err) {
      toast.error('Could not generate timing-optimized plan.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Activity className="size-4" />
            </span>
            <h3 className="text-base font-bold text-zinc-900">
              Gym Busy Timings & Machine Availability
            </h3>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time traffic heatmap calculated from member arrival schedules and equipment inventory.
          </p>
        </div>

        {!memberMode && (
          <Button
            variant="secondary"
            size="sm"
            icon={Sparkles}
            onClick={handleGenerateOptimizedPlan}
            loading={generating}
            className="text-xs shrink-0 hover:border-brand hover:text-brand"
          >
            Create Timing-Optimized Chart
          </Button>
        )}
      </div>

      {/* Hourly Crowd Heatmap Bars */}
      <div>
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-2 font-medium">
          <span>Click a time slot to check machine traffic:</span>
          <div className="flex items-center gap-3 text-[0.7rem]">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500" /> Low
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-amber-500" /> Moderate
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-orange-500" /> Busy
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-red-600 animate-pulse" /> Peak Rush
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {slotData.map((slot) => {
            const isSelected = selectedSlotId === slot.id;
            const isPeak = slot.crowdStatus === 'peak';
            const isBusy = slot.crowdStatus === 'busy';
            const isMod = slot.crowdStatus === 'moderate';

            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => setSelectedSlotId(slot.id)}
                className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition relative overflow-hidden ${
                  isSelected
                    ? 'border-brand bg-brand/5 shadow-sm ring-1 ring-brand'
                    : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-xs font-bold text-zinc-900">
                    {slot.labelShort}
                  </span>
                  <span
                    className={`size-2 rounded-full ${
                      isPeak
                        ? 'bg-red-600'
                        : isBusy
                        ? 'bg-orange-500'
                        : isMod
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                </div>

                <div className="mt-2 w-full">
                  <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isPeak
                          ? 'bg-red-600'
                          : isBusy
                          ? 'bg-orange-500'
                          : isMod
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(15, slot.utilization)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-1.5 flex items-center justify-between w-full text-[0.68rem] text-zinc-500 font-medium">
                  <span className="capitalize">{slot.crowdStatus}</span>
                  <span className="font-bold text-zinc-700">{slot.activeMembers} gymmers</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Slot Detailed Machine Availability Breakdown */}
      <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-zinc-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
              Selected Slot: <span className="text-brand">{activeSlot.label}</span>
            </h4>
            <span
              className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                activeSlot.crowdStatus === 'peak'
                  ? 'bg-red-100 text-red-700'
                  : activeSlot.crowdStatus === 'busy'
                  ? 'bg-orange-100 text-orange-700'
                  : activeSlot.crowdStatus === 'moderate'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {activeSlot.crowdStatus === 'peak' ? '🔥 Peak Rush Hour' : `${activeSlot.crowdStatus} crowd`}
            </span>
          </div>

          <p className="text-xs text-zinc-500">
            Estimated occupancy: <strong className="text-zinc-900">{activeSlot.utilization}%</strong> (~{activeSlot.activeMembers} active members)
          </p>
        </div>

        {/* Equipments Table / Grid */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 pt-1">
          {equipmentStatus.map((eq) => {
            const isHighWait = eq.status === 'high_wait';
            const isModerate = eq.status === 'moderate';

            return (
              <div
                key={eq.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-200/80 bg-white text-xs shadow-2xs"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-semibold text-zinc-900 truncate">{eq.name}</p>
                  <p className="text-[0.7rem] text-zinc-400 mt-0.5">
                    {eq.freeUnits}/{eq.quantity} units free
                  </p>
                </div>

                <div className="text-right shrink-0">
                  {isHighWait ? (
                    <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-[0.68rem] font-bold text-red-700 border border-red-200">
                      <Flame className="size-3 text-red-500" /> ~{eq.waitMinutes}m wait
                    </span>
                  ) : isModerate ? (
                    <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[0.68rem] font-bold text-amber-700 border border-amber-200">
                      ~{eq.waitMinutes}m wait
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[0.68rem] font-bold text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="size-3 text-emerald-600" /> Free / Ready
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Traffic Adaptation Advice */}
        <div className="mt-2 rounded-lg border border-brand/20 bg-brand/5 p-3 flex items-start gap-2.5 text-xs text-zinc-700">
          <Zap className="size-4 shrink-0 text-brand mt-0.5" />
          <div className="min-w-0">
            <span className="font-bold text-zinc-900">Timing-based Workout Recommendation: </span>
            {activeSlot.crowdStatus === 'peak' || activeSlot.crowdStatus === 'busy' ? (
              <span>
                During this peak slot ({activeSlot.labelShort}), high wait times are expected on Bench Press & Cable Crossover (~15m wait). <strong>Recommendation:</strong> Use the Anti-Crowd Dumbbell routine or circuit training to complete your workout 30% faster without standing in line!
              </span>
            ) : (
              <span>
                This is a quiet, comfortable time slot. All machines, squat racks, and cable crossover stations have zero queue. Perfect for heavy progressive overload training.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
