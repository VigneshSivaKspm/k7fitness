import { CheckCircle2 } from 'lucide-react';
import { BODY_TYPES } from '../../constants/options';
import { BodyTypeSvg } from './BodyTypeArt';

export default function BodyTypeSelector({ gender = 'male', value = '', onChange }) {
  const g = gender === 'female' ? 'female' : 'male';
  const types = BODY_TYPES[g] || BODY_TYPES.male;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Body Type ({g === 'female' ? 'Female' : 'Male'} Silhouettes)
        </label>
        <span className="text-[0.7rem] text-zinc-500 dark:text-zinc-400">Tap to select matching frame</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {types.map((t) => {
          const selected = value === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={`relative flex flex-col items-center rounded-2xl border p-4 text-center transition-all ${
                selected
                  ? 'border-red-500 bg-red-50 ring-2 ring-red-500/30 shadow-md dark:border-red-500 dark:bg-red-500/10 dark:ring-red-500/40'
                  : 'border-zinc-200 bg-zinc-50/60 hover:border-zinc-300 hover:bg-white text-zinc-700 dark:border-white/10 dark:bg-zinc-900/40 dark:hover:border-white/20 dark:hover:bg-zinc-800/80 dark:text-zinc-300'
              }`}
            >
              {selected && (
                <div className="absolute right-3 top-3 rounded-full bg-red-600 p-1 text-white shadow-sm">
                  <CheckCircle2 className="size-3.5" />
                </div>
              )}

              {/* Vector Silhouette Art */}
              <div className={`my-2 transition-transform duration-300 ${selected ? 'scale-105 text-red-600 dark:text-red-400' : 'text-zinc-400 dark:text-zinc-500 opacity-80'}`}>
                <BodyTypeSvg gender={g} type={t.id} className="h-28 w-auto" />
              </div>

              {/* Details */}
              <h4 className={`text-sm font-bold ${selected ? 'text-zinc-900 dark:text-white' : 'text-zinc-800 dark:text-zinc-200'}`}>
                {t.label}
              </h4>
              <p className="text-[0.7rem] font-semibold text-red-600 dark:text-red-400">{t.subtitle}</p>
              <p className="mt-1 text-[0.7rem] leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-2">
                {t.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
