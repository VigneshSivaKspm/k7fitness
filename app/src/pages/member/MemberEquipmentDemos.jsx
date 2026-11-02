import { useEffect, useState } from 'react';
import {
  ChevronRight,
  Dumbbell,
  Eye,
  Flame,
  Info,
  Play,
  Search,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react';
import { listEquipment } from '../../services/equipmentService';
import MachineDemoModal from '../../components/equipment/MachineDemoModal';

const CATEGORIES = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Cardio', 'Functional'];

export default function MemberEquipmentDemos() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [activeDemo, setActiveDemo] = useState(null);

  useEffect(() => {
    listEquipment()
      .then(setEquipmentList)
      .finally(() => setLoading(false));
  }, []);

  const filtered = equipmentList.filter((item) => {
    const matchCat =
      selectedCat === 'All' ||
      item.category?.toLowerCase() === selectedCat.toLowerCase();
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.name?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.exercises?.some((ex) => ex.name?.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-sm">
          <Dumbbell className="size-4.5 text-red-500" />
        </div>
        <div>
          <h1 className="text-base font-black text-zinc-950">Machine & Exercise Demos</h1>
          <p className="text-[0.68rem] text-zinc-500">Visual form guides and equipment setup</p>
        </div>
      </div>

      {/* Hero Badge */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 text-white p-4 shadow-lg border border-zinc-900">
        <div className="pointer-events-none absolute -right-6 -bottom-6 size-28 rounded-full bg-red-600/20 blur-2xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-red-400 block">
              Gym Masterclass
            </span>
            <h2 className="text-sm font-black text-white mt-0.5">Explore Gym Machines & Form</h2>
            <p className="text-[0.68rem] text-zinc-400 mt-1 max-w-[240px]">
              Tap any machine to see how it works, how to adjust pins, and step-by-step exercise demos.
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-red-600 text-white shadow-md shadow-red-600/30">
            <Play className="size-5 fill-white" />
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search machine (e.g. Cable, Squat, Bench)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-zinc-200 bg-white pl-9 pr-3 py-2 text-xs font-bold text-zinc-900 placeholder:text-zinc-400 placeholder:font-normal shadow-2xs focus:border-red-500 focus:outline-none"
        />
      </div>

      {/* Muscle Category Filter Chips (Horizontal Scroll) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCat(cat)}
            className={`shrink-0 rounded-2xl px-3 py-1.5 text-xs font-bold transition ${
              selectedCat === cat
                ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                : 'bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Equipment Cards List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-zinc-400 font-medium">
          Loading studio equipment…
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((item) => {
            const animSrc =
              item.animationUrl ||
              item.gifUrl ||
              item.exercises?.find((e) => e.animationUrl || e.gifUrl)?.animationUrl ||
              item.exercises?.find((e) => e.animationUrl || e.gifUrl)?.gifUrl;

            return (
              <div
                key={item.id}
                onClick={() => setActiveDemo(item)}
                className="rounded-3xl border border-zinc-200/90 bg-white p-4 shadow-sm shadow-zinc-200/40 hover:border-zinc-300 hover:shadow-md transition cursor-pointer select-none space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {animSrc ? (
                      <div className="relative size-14 rounded-2xl bg-zinc-950 overflow-hidden shrink-0 border border-zinc-800 shadow-sm ring-2 ring-red-500/20">
                        <img
                          src={encodeURI(animSrc)}
                          alt={item.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-red-600/90 text-white text-[0.52rem] font-black uppercase text-center py-0.5 tracking-tighter">
                          DEMO LOOP
                        </div>
                      </div>
                    ) : item.imageUrl ? (
                      <div className="size-14 rounded-2xl bg-zinc-900 overflow-hidden shrink-0 border border-zinc-200">
                        <img
                          src={encodeURI(item.imageUrl)}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex size-14 items-center justify-center rounded-2xl bg-zinc-950 text-white font-bold shrink-0">
                        <Dumbbell className="size-5 text-red-500" />
                      </div>
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-red-50 text-red-600 text-[0.62rem] font-bold px-1.5 py-0.5 uppercase tracking-wide">
                          {item.category}
                        </span>
                        {animSrc && (
                          <span className="rounded-md bg-red-600 text-white text-[0.58rem] font-black px-1.5 py-0.5 uppercase tracking-tight shadow-2xs">
                            🎬 60fps Form
                          </span>
                        )}
                        <span className="text-[0.65rem] text-zinc-400 font-medium">
                          {item.quantity || 1} in studio
                        </span>
                      </div>
                      <h3 className="font-extrabold text-sm text-zinc-950 mt-1 leading-tight">
                        {item.name}
                      </h3>
                    </div>
                  </div>

                  <span className="flex size-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition shrink-0">
                    <ChevronRight className="size-4" />
                  </span>
                </div>

              {/* Possible Exercises List Pills */}
              {item.exercises?.length > 0 && (
                <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[0.68rem] font-bold text-zinc-500">
                    <span className="uppercase tracking-wider">Possible Exercises:</span>
                    <span className="text-red-600 font-bold">{item.exercises.length} moves</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {item.exercises.map((ex, i) => (
                      <span
                        key={ex.id || i}
                        className="rounded-lg bg-white border border-zinc-200 px-2 py-0.5 text-[0.65rem] font-bold text-zinc-800"
                      >
                        {ex.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Quick Tap Action */}
              <div className="flex items-center justify-between pt-1 text-[0.68rem] font-bold text-red-600">
                <span className="flex items-center gap-1">
                  <Play className="size-3 fill-red-600" /> Tap to view real-time demo & form guide
                </span>
                <span>Details →</span>
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center px-4">
          <Dumbbell className="mx-auto size-9 text-zinc-300" />
          <p className="mt-2 text-xs font-bold text-zinc-800">No equipment found</p>
          <p className="text-[0.7rem] text-zinc-400 mt-0.5">
            Try choosing a different muscle filter or search term.
          </p>
        </div>
      )}

      {/* Interactive Machine & Exercise Demo Modal */}
      <MachineDemoModal
        equipment={activeDemo}
        open={Boolean(activeDemo)}
        onClose={() => setActiveDemo(null)}
      />
    </div>
  );
}
