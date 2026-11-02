import { useState } from 'react';
import { Award, Check, Lock, Sparkles } from 'lucide-react';
import { evaluateBadges } from '../../services/gamificationService';

export default function BadgesShelf({ trainee, attendanceList = [], workoutStats = {} }) {
  const badges = evaluateBadges(trainee, attendanceList, workoutStats);
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="rounded-3xl border border-zinc-200/90 bg-white p-4 sm:p-5 shadow-sm shadow-zinc-200/40">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm shadow-amber-500/40">
            <Award className="size-4" />
          </span>
          <div>
            <h3 className="text-xs font-black text-zinc-950 uppercase tracking-tight">
              Trophy Cabinet & Badges
            </h3>
            <p className="text-[0.68rem] text-zinc-500">
              Unlock exclusive athletic achievements
            </p>
          </div>
        </div>

        <div className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[0.68rem] font-black text-amber-800">
          {unlockedCount} / {badges.length} Unlocked
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`relative flex flex-col items-center text-center p-3 rounded-2xl border transition ${
              b.unlocked
                ? 'border-amber-300/80 bg-gradient-to-b from-amber-50/70 to-white shadow-sm'
                : 'border-zinc-200/60 bg-zinc-50/50 opacity-60'
            }`}
          >
            {/* Status Dot */}
            <span className="absolute top-2 right-2">
              {b.unlocked ? (
                <span className="flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[0.55rem]">
                  <Check className="size-2.5 stroke-[3]" />
                </span>
              ) : (
                <span className="flex size-4 items-center justify-center rounded-full bg-zinc-200 text-zinc-400">
                  <Lock className="size-2.5" />
                </span>
              )}
            </span>

            {/* Icon */}
            <div className={`size-11 rounded-2xl flex items-center justify-center text-xl mb-1.5 transition ${
              b.unlocked
                ? 'bg-amber-100/80 ring-2 ring-amber-300/60 shadow-sm'
                : 'bg-zinc-200/60 grayscale'
            }`}>
              {b.icon}
            </div>

            <h4 className="text-xs font-black text-zinc-900 leading-tight">
              {b.title}
            </h4>
            <span className="text-[0.6rem] font-bold text-red-600 block mt-0.5">
              +{b.points} PTS
            </span>
            <p className="text-[0.6rem] text-zinc-500 mt-1 line-clamp-2 leading-tight">
              {b.description}
            </p>

            <span className={`mt-2 rounded-md px-1.5 py-0.5 text-[0.58rem] font-black uppercase tracking-wider ${
              b.unlocked
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-zinc-200 text-zinc-600'
            }`}>
              {b.progress}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
