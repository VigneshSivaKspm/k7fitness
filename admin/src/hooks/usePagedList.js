import { useCallback, useEffect, useRef, useState } from 'react';
import { friendlyError } from '../utils/errors';

/**
 * Cursor-based pagination for Firestore lists.
 * `fetchPage({ cursor })` must resolve to { items, cursor, hasMore }.
 * A stack of cursors gives Prev/Next without ever reading the whole collection.
 * Re-fetches from page 1 whenever `deps` change.
 */
export function usePagedList(fetchPage, deps) {
  const [state, setState] = useState({ items: [], loading: true, error: '', hasMore: false });
  const [page, setPage] = useState(1);
  const cursors = useRef([null]);
  const lastCursor = useRef(null);
  const requestId = useRef(0);
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;

  const load = useCallback(async (pageIndex) => {
    const id = ++requestId.current;
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const res = await fetchRef.current({ cursor: cursors.current[pageIndex] });
      if (id !== requestId.current) return;
      lastCursor.current = res.cursor;
      setPage(pageIndex + 1);
      setState({ items: res.items, loading: false, error: '', hasMore: res.hasMore });
    } catch (err) {
      if (id !== requestId.current) return;
      setState((s) => ({ ...s, loading: false, error: friendlyError(err, 'Could not load this list.') }));
    }
  }, []);

  useEffect(() => {
    cursors.current = [null];
    load(0);
  }, deps);

  const next = useCallback(() => {
    const idx = page; // zero-based index of the next page
    cursors.current[idx] = lastCursor.current;
    load(idx);
  }, [page, load]);

  const prev = useCallback(() => {
    if (page > 1) load(page - 2);
  }, [page, load]);

  const reload = useCallback(() => load(page - 1), [page, load]);

  /** Optimistically patch an item in the current page. */
  const patch = useCallback((id, changes) => {
    setState((s) => ({ ...s, items: s.items.map((i) => (i.id === id ? { ...i, ...changes } : i)) }));
  }, []);

  const remove = useCallback((id) => {
    setState((s) => ({ ...s, items: s.items.filter((i) => i.id !== id) }));
  }, []);

  return { ...state, page, hasPrev: page > 1, next, prev, reload, patch, remove };
}
