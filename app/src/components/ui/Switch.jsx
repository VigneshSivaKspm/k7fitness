import { useId } from 'react';

export default function Switch({ checked, onChange, label, description, disabled, className = '', size = 'md' }) {
  const id = useId();
  const track = size === 'sm' ? 'h-5 w-9' : 'h-6 w-11';
  const knob = size === 'sm' ? 'size-4 data-[on=true]:translate-x-4' : 'size-5 data-[on=true]:translate-x-5';
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      {(label || description) && (
        <label htmlFor={id} className="min-w-0 cursor-pointer">
          {label && <span className="block text-sm font-medium text-zinc-800">{label}</span>}
          {description && <span className="mt-0.5 block text-[0.8rem] text-zinc-500">{description}</span>}
        </label>
      )}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={Boolean(checked)}
        aria-label={!label ? 'Toggle' : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors disabled:opacity-50 ${track} ${
          checked ? 'bg-brand' : 'bg-zinc-300'
        }`}
      >
        <span data-on={Boolean(checked)} className={`rounded-full bg-white shadow transition-transform ${knob}`} />
      </button>
    </div>
  );
}
