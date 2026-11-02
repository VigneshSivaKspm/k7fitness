import { useEffect, useRef, useState } from 'react';
import { getSection, saveSection } from '../services/websiteService';
import { deleteFile } from '../services/storageService';
import { useToast } from '../context/ToastContext';
import { friendlyError } from '../utils/errors';
import { focusFirstError } from '../utils/validation';

/**
 * Load/save helper for singleton website sections (hero, about, contact).
 * `toForm(doc)` maps Firestore → form state, `toDoc(form)` maps back.
 * `imagePaths(doc)` lists storage paths owned by the section so replaced
 * images are cleaned up after a successful save.
 */
export function useSectionForm(id, { defaults, toForm, toDoc, validate, imagePaths = () => [], onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(null);
  const [state, setState] = useState({ loading: true, error: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const mapping = useRef({ defaults, toForm });
  mapping.current = { defaults, toForm };

  useEffect(() => {
    getSection(id)
      .then((doc) => {
        setSaved(doc || {});
        setForm(mapping.current.toForm({ ...mapping.current.defaults, ...(doc || {}) }));
        setState({ loading: false, error: '' });
      })
      .catch((err) => setState({ loading: false, error: friendlyError(err) }));
  }, [id]);

  const set = (key) => (e) => {
    const value = e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e;
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
  };

  const save = async (e) => {
    e?.preventDefault();
    if (busy) return;
    const errs = validate ? validate(form) : {};
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error('Please fix the highlighted fields.');
      return focusFirstError(errs);
    }
    setBusy(true);
    try {
      const doc = toDoc(form);
      await saveSection(id, doc);
      const keep = new Set(imagePaths(doc));
      imagePaths(saved || {})
        .filter((p) => p && !keep.has(p))
        .forEach((p) => deleteFile(p).catch(() => {}));
      setSaved(doc);
      onSaved?.(doc);
      toast.success('Website content updated successfully.');
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return { form, setForm, set, save, errors, busy, ...state };
}
