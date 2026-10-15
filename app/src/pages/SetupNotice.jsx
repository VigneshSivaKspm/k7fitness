import { assetUrl } from '../utils/format';
/** Shown when the Firebase environment variables have not been configured. */
export default function SetupNotice() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-ink p-6 text-white">
      <div className="max-w-lg rounded-2xl border border-white/10 bg-ink-2 p-8">
        <img src={assetUrl('brand/k7-mark.svg')} alt="K7" className="h-12" />
        <h1 className="mt-6 text-xl font-semibold">Firebase is not configured</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Copy <code className="rounded bg-white/10 px-1.5 py-0.5 text-zinc-200">admin/.env.example</code> to{' '}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-zinc-200">admin/.env</code>, fill in your Firebase web app
          credentials, then restart the dev server. See README.md → “Firebase setup”.
        </p>
      </div>
    </div>
  );
}
