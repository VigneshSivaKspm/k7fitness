import { useRef, useState } from 'react';
import { ImagePlus, LoaderCircle, RefreshCw, Trash2 } from 'lucide-react';
import { uploadImage, deleteFile } from '../../services/storageService';
import { friendlyError } from '../../utils/errors';
import { ACCEPTED_IMAGE_TYPES } from '../../utils/image';
import { mediaUrl } from '../../utils/format';

/**
 * Image picker with client-side compression and upload progress.
 * value: { url, path } | null — onChange receives the new value.
 *
 * Files uploaded during this session and then replaced/removed are cleaned up
 * immediately. The persisted (saved) file is cleaned up by the owning service
 * when the record is saved with a different image.
 */
export default function ImageUpload({ value, onChange, folder, label, hint, aspect = 'aspect-video', maxSize = 1920, className = '', round = false }) {
  const inputRef = useRef(null);
  const sessionUploads = useRef(new Set());
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  const discardIfTemporary = (path) => {
    if (path && sessionUploads.current.has(path)) {
      sessionUploads.current.delete(path);
      deleteFile(path).catch(() => {});
    }
  };

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setProgress(0);
    try {
      const uploaded = await uploadImage(file, folder, { onProgress: setProgress, maxSize });
      sessionUploads.current.add(uploaded.path);
      discardIfTemporary(value?.path);
      onChange(uploaded);
    } catch (err) {
      setError(friendlyError(err, 'Upload failed. Please try again.'));
    } finally {
      setProgress(null);
    }
  };

  const remove = () => {
    discardIfTemporary(value?.path);
    onChange(null);
  };

  const uploading = progress !== null;

  return (
    <div className={className}>
      {label && <p className="label">{label}</p>}
      <div
        className={`relative overflow-hidden border border-dashed border-zinc-300 bg-zinc-50 ${round ? 'size-28 rounded-full' : `${aspect} w-full rounded-xl`}`}
      >
        {value?.url ? (
          <img src={mediaUrl(value.url)} alt="" className="size-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex size-full flex-col items-center justify-center gap-1.5 p-3 text-center text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700"
          >
            <ImagePlus className="size-6" />
            {!round && <span className="text-sm font-medium">Upload image</span>}
            {!round && <span className="text-xs text-zinc-400">JPG, PNG or WebP · auto-optimised</span>}
          </button>
        )}
        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/85 backdrop-blur-sm" role="status">
            <LoaderCircle className="size-6 animate-spin text-brand" />
            <div className="h-1.5 w-2/3 max-w-40 overflow-hidden rounded-full bg-zinc-200">
              <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs font-medium text-zinc-600">{progress}%</span>
          </div>
        )}
      </div>
      {value?.url && !uploading && (
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50">
            <RefreshCw className="size-3.5" /> Replace
          </button>
          <button type="button" onClick={remove} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 ring-1 ring-red-100 hover:bg-red-50">
            <Trash2 className="size-3.5" /> Remove
          </button>
        </div>
      )}
      {error ? (
        <p className="mt-1.5 text-[0.8rem] font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[0.8rem] text-zinc-500">{hint}</p>
      ) : null}
      <input ref={inputRef} type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} className="hidden" onChange={onPick} aria-label={label || 'Upload image'} />
    </div>
  );
}
