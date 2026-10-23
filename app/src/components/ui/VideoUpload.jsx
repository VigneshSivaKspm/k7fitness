import { useRef, useState } from 'react';
import { Video, LoaderCircle, RefreshCw, Trash2, Link as LinkIcon, UploadCloud, Play } from 'lucide-react';
import { uploadVideo, deleteFile } from '../../services/storageService';
import { friendlyError } from '../../utils/errors';

/**
 * Helper to check if a URL is a YouTube link and convert to embed format
 */
export function getEmbedVideoUrl(url) {
  if (!url) return '';
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  return url;
}

/**
 * Video picker supporting both direct MP4/WebM uploads to Firebase Storage
 * and external video links (YouTube, Vimeo, MP4 URLs).
 * value: { url: string, path?: string } | string | null
 */
export default function VideoUpload({
  value,
  onChange,
  folder = 'public/equipment_demos',
  label = 'Demo Video',
  hint = 'Upload MP4/WebM video or paste a YouTube / video link',
  className = '',
}) {
  const inputRef = useRef(null);
  const sessionUploads = useRef(new Set());
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('upload'); // 'upload' | 'url'
  const [urlInput, setUrlInput] = useState(typeof value === 'string' ? value : value?.url || '');

  const videoUrl = typeof value === 'string' ? value : value?.url || '';
  const videoPath = typeof value === 'object' ? value?.path : '';

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

    // Check size (e.g. limit to 60MB for fast uploads)
    if (file.size > 60 * 1024 * 1024) {
      setError('Video file is too large. Please select a video under 60MB, or paste a YouTube link.');
      return;
    }

    setError('');
    setProgress(0);
    try {
      const uploaded = await uploadVideo(file, folder, { onProgress: setProgress });
      sessionUploads.current.add(uploaded.path);
      discardIfTemporary(videoPath);
      onChange({ url: uploaded.url, path: uploaded.path });
    } catch (err) {
      setError(friendlyError(err, 'Video upload failed. Please try again or use a YouTube link.'));
    } finally {
      setProgress(null);
    }
  };

  const remove = () => {
    discardIfTemporary(videoPath);
    onChange(null);
    setUrlInput('');
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      remove();
      return;
    }
    onChange({ url: urlInput.trim(), path: '' });
  };

  const uploading = progress !== null;
  const isYouTube = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        {label && <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">{label}</p>}
        
        {/* Toggle between File Upload and URL link */}
        {!videoUrl && (
          <div className="flex items-center rounded-lg bg-zinc-100 p-0.5 text-[0.68rem] font-bold">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`rounded-md px-2 py-0.5 transition ${mode === 'upload' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`rounded-md px-2 py-0.5 transition ${mode === 'url' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              Paste Link
            </button>
          </div>
        )}
      </div>

      {videoUrl ? (
        /* Video Preview Card */
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-950 aspect-video w-full flex items-center justify-center">
          {isYouTube ? (
            <iframe
              src={getEmbedVideoUrl(videoUrl)}
              title="Demo Video Preview"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={videoUrl}
              controls
              playsInline
              loop
              muted
              className="w-full h-full object-contain"
            />
          )}

          {/* Action overlay */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-black/70 p-1.5 text-white backdrop-blur-md hover:bg-black transition"
              title="Replace video"
            >
              <RefreshCw className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={remove}
              className="rounded-lg bg-red-600/90 p-1.5 text-white backdrop-blur-md hover:bg-red-600 transition"
              title="Remove video"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
            className="hidden"
            onChange={onPick}
          />
        </div>
      ) : mode === 'upload' ? (
        /* Direct Video File Dropzone */
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-6 text-center cursor-pointer hover:border-red-500 hover:bg-red-50/20 transition ${
            uploading ? 'pointer-events-none opacity-80' : ''
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
            className="hidden"
            onChange={onPick}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <LoaderCircle className="size-7 text-red-600 animate-spin" />
              <p className="text-xs font-bold text-zinc-800">Uploading Video ({progress}%)...</p>
              <div className="w-44 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[0.65rem] text-zinc-500">Please keep this window open</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-1">
              <div className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100">
                <UploadCloud className="size-5" />
              </div>
              <p className="text-xs font-bold text-zinc-900 mt-1">
                Click to upload demonstration video
              </p>
              <p className="text-[0.68rem] text-zinc-500">
                Supports MP4, WebM, MOV (up to 60MB)
              </p>
            </div>
          )}
        </div>
      ) : (
        /* URL / YouTube Link input */
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
              <LinkIcon className="size-3.5" />
            </span>
            <input
              type="url"
              placeholder="Paste YouTube, Vimeo, or MP4 link..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlSubmit())}
              className="w-full rounded-xl border border-zinc-200 bg-white pl-8 pr-3 py-2 text-xs font-medium focus:border-red-500 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="rounded-xl bg-zinc-950 px-3 py-2 text-xs font-bold text-white hover:bg-zinc-800 transition shrink-0"
          >
            Attach Link
          </button>
        </div>
      )}

      {error && <p className="text-[0.68rem] text-red-600 font-semibold">{error}</p>}
      {hint && !videoUrl && <p className="text-[0.68rem] text-zinc-400">{hint}</p>}
    </div>
  );
}
