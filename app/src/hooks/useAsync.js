import { useCallback, useEffect, useRef, useState } from 'react';
import { friendlyError } from '../utils/errors';

/** Runs an async loader on mount / when deps change, exposing data, loading, error and reload. */
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const requestId = useRef(0);

  const run = useCallback(async ({ silent = false } = {}) => {
    const id = ++requestId.current;
    if (!silent) setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const data = await loaderRef.current();
      if (id === requestId.current) setState({ data, loading: false, error: '' });
      return data;
    } catch (err) {
      if (id === requestId.current) setState((s) => ({ ...s, loading: false, error: friendlyError(err, 'Could not load data.') }));
      return null;
    }
  }, []);

  useEffect(() => {
    run();
  }, deps);

  const setData = useCallback((updater) => {
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }));
  }, []);

  return { ...state, reload: run, setData };
}

/** Sets document.title for the current page. */
export function useDocumentTitle(title) {
  useEffect(() => {
    if (title) document.title = `${title} · K7 Admin`;
  }, [title]);
}
