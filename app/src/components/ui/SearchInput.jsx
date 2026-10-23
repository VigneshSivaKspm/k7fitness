import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

/** Debounced search box. Calls onSearch(term) after the user pauses typing. */
export default function SearchInput({ value = '', onSearch, placeholder = 'Search…', delay = 350, className = '', autoFocus }) {
  const [term, setTerm] = useState(value);

  useEffect(() => setTerm(value), [value]);

  useEffect(() => {
    if (term === value) return undefined;
    const t = setTimeout(() => onSearch(term), delay);
    return () => clearTimeout(t);
  }, [term, value, delay, onSearch]);

  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoFocus={autoFocus}
        className="input pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden"
        placeholder={placeholder}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch(term)}
        aria-label={placeholder}
      />
      {term && (
        <button
          type="button"
          onClick={() => {
            setTerm('');
            onSearch('');
          }}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
