import { useId } from 'react';

/**
 * Label + control + hint/error wrapper. Passes id / aria attributes to the
 * single child control via render-prop or cloneless pattern:
 *   <Field label="Name" error={e}>{(p) => <input {...p} className="input" />}</Field>
 */
export default function Field({ label, error, hint, required, optional, className = '', children, id: idProp }) {
  const autoId = useId();
  const id = idProp || autoId;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const controlProps = { id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy };

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
          {required && <span className="ml-0.5 text-brand">*</span>}
          {optional && <span className="ml-1.5 text-xs font-normal text-zinc-400">Optional</span>}
        </label>
      )}
      {typeof children === 'function' ? children(controlProps) : children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[0.8rem] font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[0.8rem] text-zinc-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Convenience inputs built on Field. */
export function TextField({ label, error, hint, required, optional, className, ...props }) {
  return (
    <Field label={label} error={error} hint={hint} required={required} optional={optional} className={className}>
      {(p) => <input className="input" {...p} {...props} />}
    </Field>
  );
}

export function TextArea({ label, error, hint, required, optional, className, rows = 3, ...props }) {
  return (
    <Field label={label} error={error} hint={hint} required={required} optional={optional} className={className}>
      {(p) => <textarea className="input min-h-20 resize-y" rows={rows} {...p} {...props} />}
    </Field>
  );
}

export function SelectField({ label, error, hint, required, optional, className, options = [], placeholder, ...props }) {
  return (
    <Field label={label} error={error} hint={hint} required={required} optional={optional} className={className}>
      {(p) => (
        <select className="input" {...p} {...props}>
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

/** Currency amount input with a symbol prefix. */
export function MoneyField({ label, error, hint, required, className, symbol = '₹', ...props }) {
  return (
    <Field label={label} error={error} hint={hint} required={required} className={className}>
      {(p) => (
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm font-medium text-zinc-500">
            {symbol}
          </span>
          <input className="input tabular pl-8" type="number" inputMode="decimal" min="0" step="any" {...p} {...props} />
        </div>
      )}
    </Field>
  );
}
