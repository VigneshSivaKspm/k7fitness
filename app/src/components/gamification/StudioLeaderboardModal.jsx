import { useState } from 'react';
import { Award, Check, ChevronDown, ChevronRight, Crown, Flame, Info, Medal, Shield, Sparkles, Star, Trophy, Users, X, Zap } from 'lucide-react';
import { getTierInfo } from '../../services/gamificationService';

export default function StudioLeaderboardModal({ isOpen, onClose, members = [], currentMemberId }) {
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' | 'allTime'
  const [showRules, setShowRules] = useState(false);

  if (!isOpen) return null;

  const top3 = members.slice(0, 3);
  const remaining = members.slice(3);
  const userRankObj = members.find((m) => m.id === currentMemberId || m.isCurrent);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[90vh] sm:max-h-[85vh] bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-zinc-200">
        
        {/* Top Header */}
        <div className="relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-5 text-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="size-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="flex size-7 items-center justify-center rounded-lg bg-red-600 text-white shadow-md shadow-red-600/50">
              <Trophy className="size-4" />
            </span>
            <span className="text-[0.68rem] font-black uppercase tracking-wider text-red-400">
              K7 Studio Arena
            </span>
          </div>

          <h2 className="text-lg font-black text-white">Competitive Leaderboard</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Train hard, stay consistent, and claim the Titan Crown.
          </p>

          {/* Timeframe Tabs */}
          <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-white/10 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('weekly')}
              className={`rounded-lg py-1.5 transition text-center cursor-pointer ${
                activeTab === 'weekly' ? 'bg-red-600 text-white shadow' : 'text-zinc-300 hover:text-white'
              }`}
            >
              Weekly Sprint
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('allTime')}
              className={`rounded-lg py-1.5 transition text-center cursor-pointer ${
                activeTab === 'allTime' ? 'bg-red-600 text-white shadow' : 'text-zinc-300 hover:text-white'
              }`}
            >
              All-Time Titans
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Olympic Podium Display (Top 3) */}
          {top3.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-white p-4 shadow-sm">
              <span className="text-[0.65rem] font-black uppercase tracking-wider text-zinc-400 block text-center mb-3">
                Current Studio Podium
              </span>

              <div className="grid grid-cols-3 gap-2 items-end pt-2 pb-1">
                {/* 2nd Place (Silver) */}
                {top3[1] && (
                  <div className="flex flex-col items-center text-center">
                    <span className="text-lg mb-1">🥈</span>
                    <div className="size-11 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 font-black text-sm flex items-center justify-center border-2 border-slate-300 shadow">
                      {top3[1].fullName?.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[0.7rem] font-extrabold text-zinc-900 truncate max-w-[85px] mt-1.5">
                      {top3[1].fullName}
                    </span>
                    <span className="font-mono text-[0.65rem] font-black text-slate-700">
                      {top3[1].score} pts
                    </span>
                    <div className="mt-1.5 w-full bg-slate-200 rounded-t-lg py-1 text-[0.65rem] font-black text-slate-800">
                      #2
                    </div>
                  </div>
                )}

                {/* 1st Place (Gold Crown) */}
                {top3[0] && (
                  <div className="flex flex-col items-center text-center -mt-3">
                    <div className="flex items-center gap-0.5 text-amber-500 mb-0.5 animate-bounce">
                      <Crown className="size-5 fill-amber-400" />
                    </div>
                    <div className="size-13 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 text-amber-950 font-black text-base flex items-center justify-center border-2 border-yellow-300 shadow-md ring-2 ring-yellow-400/50">
                      {top3[0].fullName?.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-black text-zinc-950 truncate max-w-[95px] mt-1.5">
                      {top3[0].fullName}
                    </span>
                    <span className="font-mono text-xs font-black text-red-600">
                      {top3[0].score} pts
                    </span>
                    <div className="mt-1.5 w-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-t-lg py-2 text-[0.7rem] font-black text-amber-950 shadow">
                      #1 TITAN
                    </div>
                  </div>
                )}

                {/* 3rd Place (Bronze) */}
                {top3[2] && (
                  <div className="flex flex-col items-center text-center">
                    <span className="text-lg mb-1">🥉</span>
                    <div className="size-10 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 text-white font-black text-xs flex items-center justify-center border-2 border-amber-700 shadow">
                      {top3[2].fullName?.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[0.7rem] font-extrabold text-zinc-900 truncate max-w-[85px] mt-1.5">
                      {top3[2].fullName}
                    </span>
                    <span className="font-mono text-[0.65rem] font-black text-amber-800">
                      {top3[2].score} pts
                    </span>
                    <div className="mt-1.5 w-full bg-amber-100 rounded-t-lg py-1 text-[0.65rem] font-black text-amber-900">
                      #3
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User's Current Live Standing Banner */}
          {userRankObj && (
            <div className="rounded-2xl border-2 border-red-500 bg-red-50/70 p-3.5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-red-600 text-white font-black font-mono text-sm shadow">
                  #{userRankObj.rank}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-zinc-950">YOUR STANDING</span>
                    <span className="rounded bg-red-600 text-white text-[0.6rem] font-bold px-1 py-0.2">YOU</span>
                  </div>
                  <p className="text-[0.68rem] text-zinc-600 font-medium">
                    {userRankObj.tier?.name} • {userRankObj.streak}d streak
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-base font-black text-red-600 block">
                  {userRankObj.score} pts
                </span>
                {userRankObj.rank > 1 && members[userRankObj.rank - 2] && (
                  <span className="text-[0.6rem] font-bold text-zinc-500 block">
                    {Math.max(5, members[userRankObj.rank - 2].score - userRankObj.score)} pts behind #{userRankObj.rank - 1}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Full Studio Ranking List */}
          <div className="space-y-1.5">
            <span className="text-[0.65rem] font-black uppercase tracking-wider text-zinc-400 block px-1">
              Studio Standings ({members.length} Athletes)
            </span>

            {members.map((m) => {
              const isCurrent = m.isCurrent || m.id === currentMemberId;
              const tier = getTierInfo(m.score);

              return (
                <div
                  key={m.id}
                  className={`flex items-center justify-between gap-3 rounded-2xl border p-3 transition ${
                    isCurrent
                      ? 'border-red-400 bg-red-50/50 shadow-sm ring-1 ring-red-400/50'
                      : 'border-zinc-200/90 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`flex size-6 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-black ${
                      m.rank === 1
                        ? 'bg-amber-400 text-amber-950'
                        : m.rank === 2
                        ? 'bg-slate-300 text-slate-800'
                        : m.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      {m.rank}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-black truncate max-w-[130px] ${isCurrent ? 'text-red-700' : 'text-zinc-950'}`}>
                          {m.fullName}
                        </span>
                        {isCurrent && (
                          <span className="rounded bg-red-600 text-white text-[0.55rem] font-black px-1">YOU</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[0.62rem] font-bold text-zinc-500 flex items-center gap-0.5">
                          <Flame className="size-3 text-amber-500 fill-amber-500 inline" />
                          {m.streak}d
                        </span>
                        <span className="text-[0.62rem] font-bold text-zinc-400">•</span>
                        <span className={`text-[0.62rem] font-extrabold ${tier.textColor}`}>
                          {tier.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-sm font-black text-zinc-950 block">
                      {m.score}
                    </span>
                    <span className="text-[0.6rem] font-bold text-zinc-400 uppercase">
                      Points
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Collapsible Rules: How Points Are Earned */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowRules(!showRules)}
              className="flex w-full items-center justify-between p-3.5 text-xs font-black text-zinc-800 hover:bg-zinc-100 transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Info className="size-4 text-red-600" />
                <span>How Points & Ratings Are Calculated</span>
              </span>
              <ChevronDown className={`size-4 text-zinc-400 transition-transform ${showRules ? 'rotate-180' : ''}`} />
            </button>

            {showRules && (
              <div className="p-3.5 pt-0 text-[0.68rem] text-zinc-600 space-y-2 border-t border-zinc-200/60 leading-relaxed">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-black shrink-0">+15 PTS</span>
                  <span>Daily studio attendance check-in.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-black shrink-0">+10 PTS</span>
                  <span>Quality workout duration (checked in for 45+ minutes).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-black shrink-0">+5 PTS</span>
                  <span>Each completed exercise checked off in the workout tracker.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-600 font-black shrink-0">+30 PTS</span>
                  <span>Day Complete Bonus: Clearing all 8 daily exercises!</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-black shrink-0">+100 PTS</span>
                  <span>6-Day Titan Streak: Training all 6 days (Mon to Sat) without missing.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-zinc-950 hover:bg-red-600 active:scale-[0.98] py-3 text-xs font-black text-white transition shadow-md cursor-pointer"
          >
            Back to Training
          </button>
        </div>
      </div>
    </div>
  );
}
