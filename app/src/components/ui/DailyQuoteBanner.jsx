import { useState } from 'react';
import { Quote, RefreshCw } from 'lucide-react';
import { getDailyQuote, getRandomQuote } from '../../constants/quotes';
import { useSettings } from '../../context/SettingsContext';

export default function DailyQuoteBanner({ className = '', theme = 'dark' }) {
  const [currentQuote, setCurrentQuote] = useState(() => getDailyQuote());
  const [isRotating, setIsRotating] = useState(false);
  const { settings } = useSettings?.() || {};

  const handleNextQuote = () => {
    setIsRotating(true);
    setTimeout(() => {
      let next = getRandomQuote();
      if (next.id === currentQuote.id) next = getRandomQuote();
      setCurrentQuote(next);
      setIsRotating(false);
    }, 200);
  };

  const isLight = theme === 'light';
  const gymName = settings?.gymName || 'K7 Fitness Studio & Gym';
  const displayAuthor =
    !currentQuote.author || currentQuote.author === 'K7 Fitness'
      ? gymName
      : currentQuote.author;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-3 sm:px-4 sm:py-3 transition-all ${
        isLight
          ? 'border-zinc-200/90 bg-white shadow-sm shadow-zinc-200/50 text-zinc-900'
          : 'border-brand/20 bg-gradient-to-r from-ink via-zinc-900 to-ink shadow-md shadow-brand/5 text-white'
      } ${className}`}
    >
      {/* Background glow accent */}
      <div
        className={`pointer-events-none absolute -right-6 -top-6 size-28 rounded-full blur-2xl ${
          isLight ? 'bg-red-500/10' : 'bg-brand/20'
        }`}
        aria-hidden="true"
      />

      <div className="relative flex items-center justify-between gap-3">
        {/* Left: Sleek Quote Icon & Quote text */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`flex size-8 shrink-0 items-center justify-center rounded-xl shadow-xs ${
              isLight
                ? 'bg-zinc-950 text-white shadow-zinc-950/15'
                : 'bg-gradient-to-br from-brand to-brand-bright text-white shadow-brand/40'
            }`}
          >
            <Quote className={`size-4 ${isLight ? 'text-red-500 fill-red-500/20' : 'text-white'}`} />
          </div>

          <p
            className={`text-xs sm:text-sm font-semibold tracking-wide italic transition-opacity duration-200 min-w-0 leading-snug ${
              isLight ? 'text-zinc-900' : 'text-zinc-100'
            } ${isRotating ? 'opacity-30' : 'opacity-100'}`}
          >
            “{currentQuote.quote}”
            <span
              className={`not-italic text-[0.7rem] sm:text-xs font-normal ml-2 inline-block ${
                isLight ? 'text-zinc-500' : 'text-zinc-400'
              }`}
            >
              — {displayAuthor}
            </span>
          </p>
        </div>

        {/* Right: Only the icon for changing quote */}
        <button
          type="button"
          onClick={handleNextQuote}
          title="Change quote"
          aria-label="Change quote"
          className={`flex size-8 shrink-0 items-center justify-center rounded-xl border transition active:scale-90 ${
            isLight
              ? 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600'
              : 'border-white/10 bg-white/5 text-zinc-300 hover:border-brand/40 hover:bg-brand/10 hover:text-white'
          }`}
        >
          <RefreshCw
            className={`size-3.5 ${isLight ? 'text-red-600' : 'text-brand-bright'} ${
              isRotating ? 'animate-spin' : ''
            }`}
          />
        </button>
      </div>
    </div>
  );
}
