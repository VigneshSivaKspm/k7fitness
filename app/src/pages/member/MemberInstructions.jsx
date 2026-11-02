import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  HelpCircle,
  Info,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { getGymInstructions } from '../../services/equipmentService';

export default function MemberInstructions() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getGymInstructions()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  const filtered = categories
    .map((cat) => ({
      ...cat,
      items: (cat.items || []).filter((item) => {
        const q = search.toLowerCase().trim();
        return (
          !q ||
          item.title?.toLowerCase().includes(q) ||
          item.desc?.toLowerCase().includes(q) ||
          cat.title?.toLowerCase().includes(q)
        );
      }),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-sm">
          <ShieldCheck className="size-4.5 text-red-500" />
        </div>
        <div>
          <h1 className="text-base font-black text-zinc-950">Gym Rules & Instructions</h1>
          <p className="text-[0.68rem] text-zinc-500">Official guidelines, safety & etiquette</p>
        </div>
      </div>

      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 text-white p-4 shadow-lg border border-zinc-900">
        <div className="pointer-events-none absolute -right-6 -bottom-6 size-28 rounded-full bg-red-600/20 blur-2xl" />
        <div className="relative z-10">
          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-red-400 block">
            Studio Standards
          </span>
          <h2 className="text-sm font-black text-white mt-0.5">K7 Safety & Member Guidelines</h2>
          <p className="text-[0.68rem] text-zinc-400 mt-1 leading-relaxed">
            Please follow these studio instructions to maintain a clean, high-energy, and safe training environment for everyone.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search rules (e.g. weights, towels, timings)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-zinc-200 bg-white pl-9 pr-3 py-2 text-xs font-bold text-zinc-900 placeholder:text-zinc-400 placeholder:font-normal shadow-2xs focus:border-red-500 focus:outline-none"
        />
      </div>

      {/* Categories & Items List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-zinc-400 font-medium">
          Loading instructions…
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((cat, idx) => (
            <div
              key={cat.id || idx}
              className="rounded-3xl border border-zinc-200/90 bg-white p-4 sm:p-5 shadow-sm shadow-zinc-200/40 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-200">
                    <ShieldCheck className="size-4" />
                  </span>
                  <h3 className="font-extrabold text-xs text-zinc-950 uppercase tracking-wider">
                    {cat.title}
                  </h3>
                </div>
                {cat.badge && (
                  <span className="rounded-full bg-zinc-100 text-zinc-700 text-[0.65rem] font-bold px-2 py-0.5">
                    {cat.badge}
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                {cat.items?.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="rounded-2xl bg-zinc-50 border border-zinc-100 p-3 space-y-1"
                  >
                    <div className="flex items-start gap-2">
                      <span className="flex size-4.5 items-center justify-center rounded-full bg-zinc-950 text-white font-mono text-[0.6rem] font-bold shrink-0 mt-0.5">
                        {iIdx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-zinc-900 leading-snug">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-[0.7rem] text-zinc-600 pl-6 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center px-4">
          <HelpCircle className="mx-auto size-9 text-zinc-300" />
          <p className="mt-2 text-xs font-bold text-zinc-800">No matching guidelines</p>
          <p className="text-[0.7rem] text-zinc-400 mt-0.5">
            Try a different search keyword.
          </p>
        </div>
      )}
    </div>
  );
}
