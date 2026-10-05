import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { CheckCircle2, Loader2, Send, TriangleAlert } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { submitEnquiry } from '../../services/enquiryService';
import { onInterestSelected } from '../../utils/interest';

const EMPTY = { name: '', phone: '', email: '', interest: '', message: '', company: '' };
const MIN_FILL_MS = 2500; // humans don't fill a form in under ~2.5s

function validate(v) {
  const errors = {};
  const name = v.name.trim();
  const digits = v.phone.replace(/\D/g, '');
  if (name.length < 2) errors.name = 'Please enter your name.';
  else if (name.length > 80) errors.name = 'Name is too long.';
  else if (!/^[\p{L} .'-]+$/u.test(name)) errors.name = 'Name can only contain letters and spaces.';
  const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  if (!/^[6-9]\d{9}$/.test(local)) errors.phone = 'Enter a valid 10-digit mobile number.';
  if (v.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) errors.email = 'Enter a valid email address.';
  if (v.message.length > 1000) errors.message = 'Please keep your message under 1000 characters.';
  return errors;
}

function Field({ id, label, error, optional, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 flex items-center justify-between text-xs font-bold tracking-[0.14em] text-silver uppercase">
        {label}
        {optional && <span className="font-medium tracking-normal text-muted normal-case">Optional</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-[#ff5c7a]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function EnquiryForm() {
  const { plans, programs } = useContent();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const startedAt = useRef(0);
  const nameRef = useRef(null);

  const interests = useMemo(
    () => [...plans.map((p) => p.name), ...programs.map((p) => p.name), 'Personal training', 'General enquiry'].filter(
      (v, i, arr) => arr.indexOf(v) === i,
    ),
    [plans, programs],
  );

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(
    () =>
      onInterestSelected((interest) => {
        setValues((v) => ({ ...v, interest }));
        setStatus({ state: 'idle', message: '' });
        setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 600);
      }),
    [],
  );

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    if (status.state === 'sending') return;
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`enq-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    // Silent bot traps: hidden honeypot field or an impossibly fast submission.
    if (values.company || Date.now() - startedAt.current < MIN_FILL_MS) {
      setStatus({ state: 'success', message: '' });
      return;
    }
    setStatus({ state: 'sending', message: '' });
    try {
      await submitEnquiry(values);
      setStatus({ state: 'success', message: '' });
      setValues(EMPTY);
    } catch (err) {
      setStatus({ state: 'error', message: err.message });
    }
  }

  if (status.state === 'success') {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-line bg-ink-card p-8 text-center" role="status">
        <span className="flex size-16 items-center justify-center rounded-full bg-brand/15 text-brand-bright">
          <CheckCircle2 className="size-8" />
        </span>
        <h3 className="mt-6 font-display text-4xl tracking-wide">Enquiry received</h3>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
          Thank you for reaching out. Our team will call you shortly to help you get started.
        </p>
        <button
          type="button"
          className="mt-8 text-sm font-bold tracking-wider text-silver uppercase underline-offset-4 hover:text-white hover:underline"
          onClick={() => {
            startedAt.current = Date.now();
            setStatus({ state: 'idle', message: '' });
          }}
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  const sending = status.state === 'sending';
  const aria = (key) => ({ 'aria-invalid': Boolean(errors[key]), 'aria-describedby': errors[key] ? `enq-${key}-error` : undefined });

  return (
    <form onSubmit={onSubmit} noValidate className="relative rounded-2xl border border-line bg-ink-card p-6 sm:p-8" aria-labelledby="enquiry-title">
      <h3 id="enquiry-title" className="font-display text-4xl tracking-wide">
        Book a free visit
      </h3>
      <p className="mt-2 text-sm text-muted">Leave your details and we’ll get back to you within a few hours.</p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field id="enq-name" label="Full name" error={errors.name}>
          <input ref={nameRef} id="enq-name" className="field-k7" autoComplete="name" maxLength={80} value={values.name} onChange={set('name')} placeholder="Your name" {...aria('name')} />
        </Field>
        <Field id="enq-phone" label="Mobile number" error={errors.phone}>
          <input id="enq-phone" className="field-k7" type="tel" inputMode="tel" autoComplete="tel" maxLength={16} value={values.phone} onChange={set('phone')} placeholder="98765 43210" {...aria('phone')} />
        </Field>
        <Field id="enq-email" label="Email" optional error={errors.email}>
          <input id="enq-email" className="field-k7" type="email" autoComplete="email" maxLength={120} value={values.email} onChange={set('email')} placeholder="you@example.com" {...aria('email')} />
        </Field>
        <Field id="enq-interest" label="Interested in" optional>
          <select id="enq-interest" className="field-k7 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2212%22%20height=%2212%22%20fill=%22none%22%20stroke=%22%238b8b8b%22%20stroke-width=%222%22%3E%3Cpath%20d=%22M2%204l4%204%204-4%22/%3E%3C/svg%3E')] bg-[position:right_1rem_center] bg-no-repeat pr-10" value={values.interest} onChange={set('interest')}>
            <option value="">Select an option</option>
            {interests.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field id="enq-message" label="Message" optional error={errors.message}>
            <textarea id="enq-message" className="field-k7 min-h-28 resize-y" maxLength={1000} value={values.message} onChange={set('message')} placeholder="Tell us about your fitness goals" {...aria('message')} />
          </Field>
        </div>
      </div>

      {/* Honeypot — hidden from people, tempting for bots */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="enq-company">Company</label>
        <input id="enq-company" tabIndex={-1} autoComplete="off" value={values.company} onChange={set('company')} />
      </div>

      {status.state === 'error' && (
        <p className="mt-5 flex items-start gap-2 rounded-xl border border-brand/40 bg-brand/10 p-3 text-sm text-white" role="alert">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-brand-bright" /> {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-4 text-sm font-bold tracking-[0.12em] text-white uppercase transition hover:bg-brand-bright active:scale-[0.99] disabled:opacity-70"
      >
        {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {sending ? 'Sending…' : 'Send enquiry'}
      </button>
      <p className="mt-3 text-center text-xs text-muted">We only use your details to contact you about your enquiry. See our{' '}
        <Link to="/privacy" className="underline underline-offset-2 hover:text-white">
          privacy policy
        </Link>
        .</p>
    </form>
  );
}
