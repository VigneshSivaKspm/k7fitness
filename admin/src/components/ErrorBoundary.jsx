import { Component } from 'react';

/** Last-resort guard so an unexpected render error never leaves a blank screen. */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error(error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    const chunkError = /dynamically imported module|Loading chunk/i.test(this.state.error?.message || '');
    return (
      <div className="flex min-h-svh items-center justify-center bg-canvas p-6">
        <div className="card max-w-md p-8 text-center">
          <img src="/brand/k7-mark.svg" alt="" className="mx-auto h-10 rounded bg-ink p-1.5" />
          <h1 className="mt-5 text-lg font-semibold text-zinc-900">
            {chunkError ? 'A new version is available' : 'Something went wrong'}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            {chunkError
              ? 'The admin panel was updated. Reload to get the latest version.'
              : 'An unexpected error occurred. Your data is safe. Reload the page to continue.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex h-10 items-center rounded-lg bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
