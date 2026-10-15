import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, ImagePlus, Images, LoaderCircle, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/ui/Layout';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Switch from '../../components/ui/Switch';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback';
import { TextField } from '../../components/ui/Field';
import { moveItem } from '../../components/ui/ReorderButtons';
import { createItem, deleteItem, listItems, reorderItems, setItemFields, updateItem } from '../../services/websiteService';
import { uploadImage } from '../../services/storageService';
import { useAsync, useDocumentTitle } from '../../hooks/useAsync';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import { ACCEPTED_IMAGE_TYPES } from '../../utils/image';
import { friendlyError } from '../../utils/errors';

const MAX_BATCH = 12;

function EditDialog({ item, categories, open, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(() => ({ title: item?.title || '', category: item?.category || '', caption: item?.caption || '', active: item?.active !== false }));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (item) setForm({ title: item.title || '', category: item.category || '', caption: item.caption || '', active: item.active !== false });
  }, [item]);

  if (!item) return null;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await updateItem('gallery', item.id, {
        title: form.title.trim().slice(0, 80),
        category: form.category.trim().slice(0, 40),
        caption: form.caption.trim().slice(0, 200),
        active: form.active,
      });
      toast.success('Website content updated successfully.');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      as="form"
      onSubmit={save}
      title="Edit image details"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            Save
          </Button>
        </>
      }
    >
      <img src={item.imageUrl} alt="" className="mb-4 max-h-60 w-full rounded-xl object-cover" />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Title" optional maxLength={80} value={form.title} onChange={set('title')} hint="Also used as image alt text." />
        <TextField label="Category" optional list="gallery-categories" maxLength={40} placeholder="e.g. Transformations" value={form.category} onChange={set('category')} />
        <TextField label="Caption" optional className="sm:col-span-2" maxLength={200} value={form.caption} onChange={set('caption')} />
        <Switch className="sm:col-span-2" checked={form.active} onChange={set('active')} label="Show on website" />
      </div>
      <datalist id="gallery-categories">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </Modal>
  );
}

export default function GalleryPage() {
  useDocumentTitle('Website: Gallery');
  const toast = useToast();
  const confirm = useConfirm();
  const inputRef = useRef(null);
  const { data, loading, error, reload } = useAsync(() => listItems('gallery'), []);
  const [items, setItems] = useState([]);
  const [uploads, setUploads] = useState([]); // [{ id, name, progress, error }]
  const [editing, setEditing] = useState(null);
  const [category, setCategory] = useState('');

  useEffect(() => setItems(data || []), [data]);
  const categories = useMemo(() => [...new Set(items.map((i) => i.category).filter(Boolean))], [items]);

  const onFiles = async (e) => {
    const files = [...(e.target.files || [])].slice(0, MAX_BATCH);
    e.target.value = '';
    if (!files.length) return;
    let order = items.reduce((m, i) => Math.max(m, (i.displayOrder ?? 0) + 1), 0);
    const queue = files.map((f, i) => ({ id: `${Date.now()}-${i}`, name: f.name, progress: 0, error: '' }));
    setUploads((u) => [...u, ...queue]);
    let ok = 0;
    // Sequential uploads keep mobile connections stable.
    for (let i = 0; i < files.length; i++) {
      const qid = queue[i].id;
      try {
        const { url, path } = await uploadImage(files[i], 'public/gallery', {
          onProgress: (p) => setUploads((u) => u.map((x) => (x.id === qid ? { ...x, progress: p } : x))),
        });
        await createItem('gallery', { imageUrl: url, imagePath: path, title: '', category: category.trim(), caption: '', active: true }, order++);
        setUploads((u) => u.filter((x) => x.id !== qid));
        ok++;
      } catch (err) {
        setUploads((u) => u.map((x) => (x.id === qid ? { ...x, error: friendlyError(err, 'Upload failed.') } : x)));
      }
    }
    if (ok) {
      toast.success(`${ok} image${ok === 1 ? '' : 's'} added to the gallery.`);
      reload({ silent: true });
    }
  };

  const move = async (index, dir) => {
    const next = moveItem(items, index, dir);
    setItems(next);
    try {
      await reorderItems('gallery', next);
    } catch (err) {
      toast.error(friendlyError(err));
      reload({ silent: true });
    }
  };

  const toggle = async (item) => {
    setItems((list) => list.map((i) => (i.id === item.id ? { ...i, active: !item.active } : i)));
    try {
      await setItemFields('gallery', item.id, { active: !item.active });
    } catch (err) {
      toast.error(friendlyError(err));
      reload({ silent: true });
    }
  };

  const remove = (item) =>
    confirm({
      title: 'Remove image?',
      message: 'The image will be deleted from the gallery and storage. This cannot be undone.',
      confirmText: 'Remove image',
      onConfirm: async () => {
        await deleteItem('gallery', item);
        setItems((list) => list.filter((i) => i.id !== item.id));
        toast.success('Image removed.');
      },
    });

  return (
    <>
      <PageHeader
        back={{ to: '/website', label: 'Website' }}
        title="Gallery"
        description="Upload gym photos and transformations. Images are optimised automatically before upload."
        actions={
          <Button icon={ImagePlus} onClick={() => inputRef.current?.click()}>
            Upload images
          </Button>
        }
      />
      <input ref={inputRef} type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} multiple className="hidden" onChange={onFiles} aria-label="Upload gallery images" />

      <div className="card mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <TextField
          label="Category for new uploads"
          optional
          list="gallery-categories-upload"
          className="sm:w-72"
          placeholder="e.g. Transformations"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <datalist id="gallery-categories-upload">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <p className="text-xs text-zinc-500 sm:pb-3">Up to {MAX_BATCH} images at a time · JPG, PNG or WebP · large photos are resized to 1920px.</p>
      </div>

      {uploads.length > 0 && (
        <ul className="card mb-5 divide-y divide-zinc-100" aria-live="polite">
          {uploads.map((u) => (
            <li key={u.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              {u.error ? <span className="size-4 shrink-0 rounded-full bg-red-500" /> : <LoaderCircle className="size-4 shrink-0 animate-spin text-brand" />}
              <span className="min-w-0 flex-1 truncate text-zinc-700">{u.name}</span>
              {u.error ? (
                <>
                  <span className="text-xs text-red-600">{u.error}</span>
                  <button type="button" className="text-xs font-semibold text-zinc-500 hover:text-zinc-900" onClick={() => setUploads((x) => x.filter((y) => y.id !== u.id))}>
                    Dismiss
                  </button>
                </>
              ) : (
                <span className="flex w-28 items-center gap-2">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200">
                    <span className="block h-full rounded-full bg-brand transition-all" style={{ width: `${u.progress}%` }} />
                  </span>
                  <span className="tabular w-8 text-right text-xs text-zinc-500">{u.progress}%</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {error ? (
        <div className="card">
          <ErrorState message={error} onRetry={reload} />
        </div>
      ) : loading && !data ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : !items.length ? (
        <div className="card">
          <EmptyState
            icon={Images}
            title="Your gallery is empty"
            description="Upload photos of your gym, equipment and member transformations. The gallery section appears on the website once you add images."
            action={
              <Button icon={ImagePlus} onClick={() => inputRef.current?.click()}>
                Upload images
              </Button>
            }
          />
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item, i) => (
            <li key={item.id} className={`card group overflow-hidden ${item.active ? '' : 'opacity-60'}`}>
              <button type="button" onClick={() => setEditing(item)} className="relative block aspect-square w-full overflow-hidden bg-zinc-100">
                <img src={item.imageUrl} alt={item.title || 'Gallery image'} loading="lazy" className="size-full object-cover transition duration-300 group-hover:scale-105" />
                {!item.active && <span className="absolute top-2 left-2 rounded-md bg-ink/80 px-2 py-0.5 text-[0.7rem] font-semibold text-white">Hidden</span>}
                {item.category && <span className="absolute bottom-2 left-2 max-w-[80%] truncate rounded-md bg-white/90 px-2 py-0.5 text-[0.7rem] font-semibold text-zinc-800">{item.category}</span>}
              </button>
              <div className="flex items-center justify-between gap-1 p-1.5">
                <span className="flex">
                  <Button size="icon-sm" variant="ghost" icon={ArrowLeft} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move earlier" />
                  <Button size="icon-sm" variant="ghost" icon={ArrowRight} disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Move later" />
                </span>
                <span className="flex">
                  <Button size="icon-sm" variant="ghost" icon={item.active ? Eye : EyeOff} onClick={() => toggle(item)} aria-label={item.active ? 'Hide from website' : 'Show on website'} />
                  <Button size="icon-sm" variant="ghost" icon={Pencil} onClick={() => setEditing(item)} aria-label="Edit details" />
                  <Button size="icon-sm" variant="danger-ghost" icon={Trash2} onClick={() => remove(item)} aria-label="Remove image" />
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <EditDialog key={editing?.id || 'closed'} item={editing} categories={categories} open={Boolean(editing)} onClose={() => setEditing(null)} onSaved={() => reload({ silent: true })} />
    </>
  );
}
