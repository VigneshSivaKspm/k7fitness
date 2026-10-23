import { useState } from 'react';
import { Award, ChevronRight, Flame, Shield, Sparkles, Trophy, Zap } from 'lucide-react';
import { getTierInfo } from '../../services/gamificationService';

export default function AthleteRatingCard({ score = 150, streak = 1, rank = 3, totalMembers = 15, onOpenLeaderboard }) {
  const tier = getTierInfo(score);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-250 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-4 sm:p-5 text-white shadow-xl shadow-zinc-950/20">
      {/* Background Ambient Glow */}
      <div className="absolute -top-10 -right-10 size-40 rounded-full bg-red-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 size-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Top Header: Badge, Streak & Leaderboard Button */}
      <div className="relative z-10 flex items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-red-600 text-white shadow-sm shadow-red-600/50">
            <Trophy className="size-4" />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[0.68rem] font-black uppercase tracking-wider text-red-400">
                K7 Titan Athlete Rating
              </span>
              <span className="size-1 rounded-full bg-red-500 animate-ping" />
            </div>
            <h3 className="text-xs font-extrabold text-white">Competitive Division</h3>
          </div>
        </div>

        {/* Streak Flame Pill */}
        <div className="flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-2.5 py-1 text-[0.68rem] font-black text-amber-400 border border-amber-400/20 shadow-sm">
          <Flame className="size-3.5 text-amber-400 fill-amber-400 animate-bounce" />
          <span>{streak}d Streak</span>
        </div>
      </div>

      {/* Center Score & Tier Display */}
      <div className="relative z-10 flex items-center justify-between gap-4 py-1">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow">
              {score}
            </span>
            <span className="text-xs font-bold text-zinc-400 font-mono">/ 1000 PTS</span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.68rem] font-black uppercase tracking-wide border ${tier.badgeTone}`}>
              <span>{tier.icon}</span>
              <span>{tier.name}</span>
            </span>

            <span className="text-[0.68rem] font-bold text-zinc-400">
              Rank <strong className="text-white font-mono">#{rank}</strong> of {totalMembers}
            </span>
          </div>
        </div>

        {/* Big Tier Emblem Badge */}
        <button
          type="button"
          onClick={onOpenLeaderboard}
          className="group relative flex size-14 sm:size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/15 p-2 shadow-inner hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Open Studio Leaderboard Arena"
        >
          <span className="text-2xl sm:text-3xl filter drop-shadow group-hover:scale-110 transition-transform">
            {tier.icon}
          </span>
          <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-red-600 text-white text-[0.6rem] font-black shadow">
            #{rank}
          </span>
        </button>
      </div>

      {/* Progress Bar to Next Division Tier */}
      <div className="relative z-10 mt-3 pt-2.5 border-t border-white/10">
        <div className="flex items-center justify-between text-[0.65rem] font-bold mb-1">
          <span className="text-zinc-400">
            {tier.nextTier ? (
              <>
                <strong className="text-white font-mono">{tier.pointsToNext} pts</strong> to reach{' '}
                <span className="text-red-400">{tier.nextTier.name}</span>
              </>
            ) : (
              <span className="text-amber-400 font-black">👑 Top Division Titan Champion!</span>
            )}
          </span>
          <span className="font-mono text-white/80">{tier.progressInTier}%</span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 transition-all duration-700 ease-out shadow-sm shadow-red-500/50"
            style={{ width: `${Math.max(5, tier.progressInTier)}%` }}
          />
        </div>
      </div>

      {/* Leaderboard CTA Button */}
      <button
        type="button"
        onClick={onOpenLeaderboard}
        className="relative z-10 mt-3 flex w-full items-center justify-between rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 px-3 py-2 text-xs font-bold text-white transition border border-white/10 cursor-pointer group"
      >
        <span className="flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-amber-400" />
          <span>View Studio Competition Leaderboard</span>
        </span>
        <ChevronRight className="size-4 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition" />
      </button>
    </div>
  );
}
