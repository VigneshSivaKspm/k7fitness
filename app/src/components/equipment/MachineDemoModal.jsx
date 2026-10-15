import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  ExternalLink,
  Flame,
  Info,
  Layers,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Video,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { getEmbedVideoUrl } from '../ui/VideoUpload';

export default function MachineDemoModal({ equipment, open, onClose }) {
  if (!open || !equipment) return null;

  const exercises = equipment.exercises || [];
  const [selectedExIndex, setSelectedExIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('exercises'); // 'exercises' | 'setup'
  const [viewMode, setViewMode] = useState('video'); // 'video' | 'tempo'

  const currentExercise = exercises[selectedExIndex] || exercises[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-5 backdrop-blur-sm overflow-y-auto animate-in fade-in-50 duration-150">
      <div className="w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white shadow-2xl text-zinc-900 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Banner */}
        <div className="relative bg-zinc-950 text-white p-5 border-b border-zinc-900 shrink-0 overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -bottom-10 size-40 rounded-full bg-red-600/25 blur-3xl" />
          
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-red-600/30 text-red-400 border border-red-500/40 px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider">
                  {equipment.category || 'Gym Equipment'}
                </span>
                <span className="rounded-full bg-white/10 text-zinc-300 px-2.5 py-0.5 text-[0.68rem] font-mono">
                  Qty: {equipment.quantity || 1} available
                </span>
              </div>

              <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
                {equipment.name}
              </h2>
              {equipment.brand && (
                <p className="text-xs text-zinc-400 mt-0.5">Model: {equipment.brand}</p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="size-8 flex items-center justify-center rounded-full bg-white/10 text-zinc-300 hover:bg-white/20 hover:text-white transition"
              aria-label="Close demo"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mt-4 flex items-center gap-2 relative z-10">
            <button
              type="button"
              onClick={() => setActiveTab('exercises')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'exercises'
                  ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                  : 'bg-white/10 text-zinc-300 hover:bg-white/20'
              }`}
            >
              <Dumbbell className="size-3.5" /> Possible Exercises ({exercises.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('setup')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'setup'
                  ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                  : 'bg-white/10 text-zinc-300 hover:bg-white/20'
              }`}
            >
              <Wrench className="size-3.5" /> Machine Setup & Safety
            </button>
          </div>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: POSSIBLE EXERCISES & REALTIME DEMO */}
          {activeTab === 'exercises' && (
            <div className="space-y-4">
              {/* Exercise Selector Chips */}
              {exercises.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {exercises.map((ex, idx) => (
                    <button
                      key={ex.id || idx}
                      type="button"
                      onClick={() => setSelectedExIndex(idx)}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        selectedExIndex === idx
                          ? 'bg-zinc-950 text-white shadow-sm'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                      }`}
                    >
                      <span className="flex size-4 items-center justify-center rounded-full bg-red-600 text-[0.6rem] font-bold text-white">
                        {idx + 1}
                      </span>
                      {ex.name}
                    </button>
                  ))}
                </div>
              )}

              {currentExercise ? (
                <div className="space-y-4">
                  {/* Exercise Title Card */}
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-red-100 text-red-700 font-bold text-[0.68rem] px-2 py-0.5 uppercase tracking-wide">
                          {currentExercise.difficulty || 'All Levels'}
                        </span>
                        <span className="text-xs font-bold text-zinc-800">
                          Target: <strong className="text-red-600 font-black">{currentExercise.targetMuscle}</strong>
                        </span>
                      </div>
                      <h3 className="text-base font-black text-zinc-950 mt-1">
                        {currentExercise.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-xl px-3 py-1.5 shadow-2xs shrink-0">
                      <Sparkles className="size-4 text-amber-500" />
                      <span className="text-xs font-bold text-zinc-800">Pro Form Guide</span>
                    </div>
                  </div>

                  {/* Visual Simulation / Video Demonstration Card */}
                  {(() => {
                    const activeVideoUrl =
                      currentExercise?.videoUrl ||
                      currentExercise?.video?.url ||
                      equipment?.videoUrl ||
                      equipment?.video?.url;
                    const hasVideo = Boolean(activeVideoUrl);
                    const isYouTube = hasVideo && (activeVideoUrl.includes('youtube.com') || activeVideoUrl.includes('youtu.be'));

                    return (
                      <div className="relative overflow-hidden rounded-2xl bg-zinc-950 text-white p-5 border border-zinc-900 shadow-inner">
                        <div className="flex items-center justify-between mb-3 border-b border-zinc-800/80 pb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                            <Play className="size-3.5 fill-red-400 text-red-400" /> Real-time Movement Execution Demo
                          </span>
                          {hasVideo ? (
                            <div className="flex items-center rounded-lg bg-zinc-900 p-0.5 text-[0.65rem] font-bold">
                              <button
                                type="button"
                                onClick={() => setViewMode('video')}
                                className={`rounded px-2 py-0.5 transition ${viewMode === 'video' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                              >
                                Video Demo
                              </button>
                              <button
                                type="button"
                                onClick={() => setViewMode('tempo')}
                                className={`rounded px-2 py-0.5 transition ${viewMode === 'tempo' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                              >
                                Rep Cadence
                              </button>
                            </div>
                          ) : (
                            <span className="text-[0.68rem] text-zinc-400 font-mono">Continuous Tension</span>
                          )}
                        </div>

                        {hasVideo && viewMode === 'video' ? (
                          <div className="relative overflow-hidden rounded-xl bg-black aspect-video w-full my-2 flex items-center justify-center border border-zinc-800">
                            {isYouTube ? (
                              <iframe
                                src={getEmbedVideoUrl(activeVideoUrl)}
                                title={`${currentExercise.name} Demo`}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                src={activeVideoUrl}
                                controls
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-contain"
                              />
                            )}
                          </div>
                        ) : (
                          <div className="py-4 text-center">
                            <div className="inline-flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-900 border border-zinc-800/80 max-w-sm w-full">
                              <div className="size-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 mb-2 animate-bounce">
                                <Dumbbell className="size-8" />
                              </div>
                              <p className="text-xs font-bold text-zinc-200">{currentExercise.name}</p>
                              <p className="text-[0.68rem] text-zinc-400 mt-1">
                                Tempo: <strong className="text-emerald-400">1s Contraction</strong> · <strong className="text-amber-400">1s Squeeze</strong> · <strong className="text-sky-400">3s Eccentric Return</strong>
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Pro Cue Callout */}
                        {currentExercise.cues && (
                          <div className="mt-3 rounded-xl bg-white/10 p-3 text-xs text-zinc-200 border border-white/5 flex items-start gap-2">
                            <Flame className="size-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-white font-bold">Trainer Form Cue: </strong>
                              <span>“{currentExercise.cues}”</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Step-by-Step Instructions */}
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
                      <CheckCircle2 className="size-4 text-emerald-600" /> Step-by-Step Movement Instructions
                    </h4>

                    {currentExercise.setup && (
                      <div className="rounded-xl bg-zinc-50 p-3 text-xs text-zinc-700">
                        <strong className="text-zinc-950 font-bold block mb-1">1. Starting Setup & Stance:</strong>
                        <p className="leading-relaxed">{currentExercise.setup}</p>
                      </div>
                    )}

                    {currentExercise.execution && (
                      <div className="rounded-xl bg-zinc-50 p-3 text-xs text-zinc-700">
                        <strong className="text-zinc-950 font-bold block mb-1">2. Movement Execution:</strong>
                        <div className="whitespace-pre-line leading-relaxed">{currentExercise.execution}</div>
                      </div>
                    )}
                  </div>

                  {/* Common Mistakes Warning */}
                  {currentExercise.mistakes && (
                    <div className="rounded-2xl border border-red-200 bg-red-50/70 p-4 text-xs text-red-900">
                      <div className="flex items-center gap-1.5 font-bold text-red-700 mb-1">
                        <AlertTriangle className="size-4 text-red-600" /> Common Mistakes to Avoid:
                      </div>
                      <p className="leading-relaxed text-red-800">{currentExercise.mistakes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No specific exercises registered for this machine yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MACHINE SETUP, PINS & SAFETY */}
          {activeTab === 'setup' && (
            <div className="space-y-4 text-xs">
              {/* Machine Overview & Image */}
              {equipment.imageUrl && (
                <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100">
                  <img
                    src={equipment.imageUrl}
                    alt={equipment.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="font-black text-sm">{equipment.name}</p>
                    <p className="text-[0.65rem] text-zinc-300">Commercial Standard Gymnasium Equipment</p>
                  </div>
                </div>
              )}

              {/* Machine Setup Guide */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
                  <Wrench className="size-4 text-zinc-800" /> How to Adjust & Set Up Machine
                </h4>
                <p className="text-zinc-700 leading-relaxed">
                  {equipment.setupGuide ||
                    'Adjust seat height and weight selector pins to match your torso height and strength level. Always test unweighted range of motion first.'}
                </p>
              </div>

              {/* Crucial Safety Rules */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-amber-600" /> Safety Notes & Injury Prevention
                </h4>
                <p className="text-amber-800 leading-relaxed">
                  {equipment.safetyNotes ||
                    'Ensure weight pins are pushed 100% into the stack. Never let weights slam down at the end of a rep.'}
                </p>
              </div>

              {/* Equipment Hygiene Rule */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 text-zinc-600 flex items-center gap-3">
                <Info className="size-5 text-zinc-400 shrink-0" />
                <p className="text-[0.72rem]">
                  Please wipe down equipment pads with gym disinfectant spray and paper towels after finishing your sets to keep it sanitized for fellow members.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-3 flex items-center justify-between shrink-0">
          <span className="text-[0.68rem] text-zinc-500 font-medium">
            K7 Fitness Studio · Equipment Guide
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-900 transition"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
}
