import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Dumbbell,
  Eye,
  Flame,
  Layers,
  LayoutGrid,
  List,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Video,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/Layout';
import Button from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/Feedback';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import {
  deleteExercise,
  listEquipment,
  listExercises,
  saveExercise,
  seedDefaultExercises,
} from '../../services/equipmentService';
import MachineDemoModal from '../../components/equipment/MachineDemoModal';
import VideoUpload from '../../components/ui/VideoUpload';
import { uid } from '../../utils/format';

const MUSCLE_GROUPS = [
  'All',
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Cardio',
  'Full Body',
];

const STANDARD_EQUIPMENT_OPTIONS = [
  { id: 'free_weights', name: 'Free Weights / Dumbbells' },
  { id: 'barbell', name: 'Olympic Barbell & Weight Plates' },
  { id: 'bodyweight', name: 'Bodyweight / Floor Mat' },
  { id: 'kettlebell', name: 'Kettlebells' },
  { id: 'resistance_bands', name: 'Resistance Bands' },
  { id: 'none', name: 'No Equipment Required' },
];

export default function ExercisesPage() {
  const toast = useToast();
  const confirm = useConfirm();

  const [exercises, setExercises] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [selectedMachineFilter, setSelectedMachineFilter] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'

  // Modal states
  const [editorItem, setEditorItem] = useState(null);
  const [demoItem, setDemoItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [exs, eqs] = await Promise.all([listExercises(), listEquipment()]);
      setExercises(exs);
      setEquipmentList(eqs);
    } catch {
      toast.error('Failed to load exercises.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSeed = async () => {
    const ok = await confirm({
      title: 'Load Starter Exercise Library?',
      message: 'This will seed comprehensive form cues, execution steps, and default exercises.',
      confirmText: 'Load Exercises',
    });
    if (!ok) return;

    try {
      await seedDefaultExercises();
      toast.success('Starter exercise library loaded successfully.');
      await loadData();
    } catch {
      toast.error('Failed to seed exercises.');
    }
  };

  const handleDelete = async (item) => {
    const ok = await confirm({
      title: `Delete ${item.name}?`,
      message: 'This will permanently remove this exercise from the catalog.',
      confirmText: 'Delete Exercise',
      confirmTone: 'danger',
    });
    if (!ok) return;

    try {
      await deleteExercise(item.id);
      toast.success('Exercise deleted.');
      setExercises((prev) => prev.filter((e) => e.id !== item.id));
    } catch {
      toast.error('Failed to delete exercise.');
    }
  };

  const handleOpenAdd = () => {
    setEditorItem({
      id: uid(),
      name: '',
      targetMuscle: '',
      muscleGroup: 'Chest',
      difficulty: 'Beginner',
      equipmentId: equipmentList[0]?.id || 'free_weights',
      equipmentName: equipmentList[0]?.name || 'Free Weights / Dumbbells',
      setup: '',
      execution: '',
      mistakes: '',
      cues: '',
      videoUrl: '',
      videoPath: '',
      tempo: '1s Contraction · 1s Squeeze · 3s Eccentric',
    });
  };

  const handleOpenEdit = (item) => {
    setEditorItem({
      ...item,
    });
  };

  const handleSaveEditor = async (e) => {
    e.preventDefault();
    if (!editorItem.name.trim()) {
      toast.error('Exercise name is required.');
      return;
    }
    setSaving(true);
    try {
      await saveExercise(editorItem);
      toast.success('Exercise saved successfully.');
      setEditorItem(null);
      await loadData();
    } catch {
      toast.error('Failed to save exercise.');
    } finally {
      setSaving(false);
    }
  };

  // Helper to open live demo for this exercise
  const handleOpenLiveDemo = (exercise) => {
    // Wrap exercise inside a dummy equipment structure so MachineDemoModal can display it
    const matchingEquipment = equipmentList.find((eq) => eq.id === exercise.equipmentId);
    setDemoItem({
      name: exercise.equipmentName || matchingEquipment?.name || 'Exercise Demo',
      brand: matchingEquipment?.brand || 'Gym Standards',
      category: exercise.muscleGroup,
      quantity: matchingEquipment?.quantity || 1,
      setupGuide: matchingEquipment?.setupGuide || exercise.setup,
      safetyNotes: matchingEquipment?.safetyNotes || exercise.mistakes,
      videoUrl: exercise.videoUrl || matchingEquipment?.videoUrl,
      exercises: [exercise],
    });
  };

  // Filtered List
  const filtered = exercises.filter((item) => {
    const matchMuscle =
      selectedMuscle === 'All' ||
      item.muscleGroup?.toLowerCase() === selectedMuscle.toLowerCase();
    const matchMachine =
      selectedMachineFilter === 'All' ||
      item.equipmentId === selectedMachineFilter ||
      item.equipmentName === selectedMachineFilter;
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.name?.toLowerCase().includes(q) ||
      item.targetMuscle?.toLowerCase().includes(q) ||
      item.equipmentName?.toLowerCase().includes(q) ||
      item.muscleGroup?.toLowerCase().includes(q);
    return matchMuscle && matchMachine && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Exercises Library"
        description="Add gym exercises, specify the required machine or equipment, configure real-time demonstration videos, and train members with proper form."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Sparkles}
              onClick={handleSeed}
              title="Load starter exercises"
            >
              Load Starter Library
            </Button>
            <Button size="sm" icon={Plus} onClick={handleOpenAdd}>
              Add Exercise
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="size-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search exercises, target muscles, or machines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 bg-white pl-9 pr-3 py-2 text-xs font-semibold placeholder:text-zinc-400 focus:border-red-500 focus:outline-none"
          />
        </div>

        {/* Machine Selector Dropdown & View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-zinc-500 whitespace-nowrap hidden sm:inline">
              Machine:
            </span>
            <select
              value={selectedMachineFilter}
              onChange={(e) => setSelectedMachineFilter(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-800 focus:border-red-500 focus:outline-none max-w-[190px] truncate"
            >
              <option value="All">All Machines & Equipments</option>
              {equipmentList.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name}
                </option>
              ))}
              {STANDARD_EQUIPMENT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center rounded-xl border border-zinc-200 bg-white p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'list'
                  ? 'bg-zinc-950 text-white shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="List View"
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'grid'
                  ? 'bg-zinc-950 text-white shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Muscle Group Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {MUSCLE_GROUPS.map((group) => (
          <button
            key={group}
            type="button"
            onClick={() => setSelectedMuscle(group)}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              selectedMuscle === group
                ? 'bg-zinc-950 text-white shadow-sm'
                : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      {/* Exercises Render Area */}
      {loading ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 mb-3">
            <Dumbbell className="size-6" />
          </div>
          <h3 className="text-sm font-extrabold text-zinc-900">No exercises found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            {search || selectedMuscle !== 'All' || selectedMachineFilter !== 'All'
              ? 'Try adjusting your search filters or muscle category.'
              : 'Add your gym exercises and link them to your machines and equipment.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button size="sm" icon={Plus} onClick={handleOpenAdd}>
              Add Exercise
            </Button>
            <Button size="sm" variant="secondary" icon={Sparkles} onClick={handleSeed}>
              Load Starter Library
            </Button>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        /* High-density Modern List View */
        <div className="rounded-3xl border border-zinc-200 bg-white overflow-hidden shadow-xs divide-y divide-zinc-100">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-50/70 transition"
            >
              <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                {/* Movement Icon */}
                <div className="flex size-12 sm:size-14 items-center justify-center rounded-2xl bg-zinc-950 text-white shrink-0 shadow-sm shadow-zinc-950/20">
                  <Flame className="size-6 text-red-500" />
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-red-50 text-red-600 font-extrabold text-[0.62rem] px-2 py-0.5 uppercase tracking-wide ring-1 ring-red-100">
                      {item.muscleGroup || 'General'}
                    </span>
                    <span className="rounded-md bg-zinc-100 text-zinc-700 font-bold text-[0.62rem] px-2 py-0.5">
                      {item.difficulty || 'Beginner'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 text-zinc-800 text-[0.65rem] font-bold px-2 py-0.5 border border-zinc-200">
                      <Wrench className="size-3 text-zinc-500" /> {item.equipmentName || 'Free Weights / Custom'}
                    </span>
                    {item.videoUrl && (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[0.65rem]">
                        <Video className="size-3" /> Video Demo Ready
                      </span>
                    )}
                  </div>

                  <h3 className="font-black text-sm text-zinc-950 truncate">
                    {item.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600">
                    {item.targetMuscle && (
                      <span>
                        Target: <strong className="text-red-600 font-bold">{item.targetMuscle}</strong>
                      </span>
                    )}
                    {item.cues && (
                      <span className="text-zinc-500 italic truncate max-w-md">
                        “{item.cues}”
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Right */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Play}
                  onClick={() => handleOpenLiveDemo(item)}
                >
                  Live Demo
                </Button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 transition border border-zinc-200"
                  title="Edit exercise"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  className="p-2 rounded-xl text-zinc-400 hover:bg-red-50 hover:text-red-600 transition border border-zinc-200"
                  title="Delete exercise"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Grid View */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Header Chips */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-lg bg-red-50 text-red-600 font-extrabold text-[0.65rem] px-2 py-0.5 uppercase tracking-wide ring-1 ring-red-100">
                      {item.muscleGroup || 'General'}
                    </span>
                    <span className="rounded-lg bg-zinc-100 text-zinc-700 font-bold text-[0.65rem] px-2 py-0.5">
                      {item.difficulty || 'Beginner'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition"
                      title="Edit exercise"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      title="Delete exercise"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-black text-zinc-950 mt-2.5 leading-snug group-hover:text-red-600 transition">
                  {item.name}
                </h3>

                {/* Target Muscle */}
                {item.targetMuscle && (
                  <p className="text-xs font-semibold text-zinc-600 mt-1">
                    Target: <span className="text-red-600 font-bold">{item.targetMuscle}</span>
                  </p>
                )}

                {/* Used Machine / Equipment Tag */}
                <div className="mt-3 rounded-2xl bg-zinc-50 border border-zinc-100 p-2.5 flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-xl bg-zinc-200/70 text-zinc-800 shrink-0">
                    <Wrench className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[0.6rem] font-bold uppercase tracking-wider text-zinc-400 block leading-tight">
                      Equipment Used
                    </span>
                    <span className="text-xs font-bold text-zinc-900 truncate block">
                      {item.equipmentName || 'Free Weights / Custom'}
                    </span>
                  </div>
                </div>

                {/* Trainer Cue Snippet */}
                {item.cues && (
                  <div className="mt-2.5 rounded-xl bg-amber-50/70 border border-amber-100 p-2 text-[0.7rem] text-amber-900 flex items-start gap-1.5">
                    <Flame className="size-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">“{item.cues}”</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[0.68rem] font-mono text-zinc-400">
                  {item.videoUrl ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <Video className="size-3" /> Video Demo Ready
                    </span>
                  ) : (
                    'Realtime Tempo Demo'
                  )}
                </span>

                <Button
                  size="sm"
                  variant="secondary"
                  icon={Play}
                  onClick={() => handleOpenLiveDemo(item)}
                >
                  Live Demo
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live Demo Modal Viewer */}
      {demoItem && (
        <MachineDemoModal
          equipment={demoItem}
          open={Boolean(demoItem)}
          onClose={() => setDemoItem(null)}
        />
      )}

      {/* Add / Edit Exercise Modal */}
      {editorItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-5 md:p-6 backdrop-blur-xs">
          <div className="w-full max-w-2xl md:max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-zinc-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Sticky Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-150 bg-zinc-50/80 shrink-0">
              <div className="min-w-0 pr-4">
                <h2 className="text-base font-extrabold text-zinc-950 flex items-center gap-2">
                  <Flame className="size-5 text-red-600 shrink-0" />
                  <span className="truncate">{editorItem.id ? 'Edit Exercise' : 'Add New Exercise'}</span>
                </h2>
                <p className="text-xs text-zinc-500 truncate">
                  Define the movement execution, select which gym machine is used, and attach a demo video.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditorItem(null)}
                className="size-8 flex shrink-0 items-center justify-center rounded-full bg-zinc-200/70 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 transition"
                title="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEditor} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Exercise Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Exercise Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Barbell Back Squat, Incline Dumbbell Press..."
                      value={editorItem.name}
                      onChange={(e) => setEditorItem({ ...editorItem, name: e.target.value })}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs font-bold focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  {/* Target Muscle */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Target Muscle(s) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Quads, Glutes & Hamstrings"
                      value={editorItem.targetMuscle}
                      onChange={(e) => setEditorItem({ ...editorItem, targetMuscle: e.target.value })}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  {/* Primary Muscle Group */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Muscle Category
                    </label>
                    <select
                      value={editorItem.muscleGroup}
                      onChange={(e) => setEditorItem({ ...editorItem, muscleGroup: e.target.value })}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold focus:border-red-500 focus:outline-none bg-white"
                    >
                      {MUSCLE_GROUPS.filter((g) => g !== 'All').map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  {/* Used Machine / Equipment Selector */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Select Machine / Equipment Used *
                    </label>
                    <select
                      value={editorItem.equipmentId}
                      onChange={(e) => {
                        const selectedVal = e.target.value;
                        const eqObj =
                          equipmentList.find((eq) => eq.id === selectedVal) ||
                          STANDARD_EQUIPMENT_OPTIONS.find((opt) => opt.id === selectedVal);
                        setEditorItem({
                          ...editorItem,
                          equipmentId: selectedVal,
                          equipmentName: eqObj?.name || 'Custom Equipment',
                        });
                      }}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs font-bold focus:border-red-500 focus:outline-none bg-white"
                    >
                      <optgroup label="Studio Machines & Equipments">
                        {equipmentList.map((eq) => (
                          <option key={eq.id} value={eq.id}>
                            {eq.name} ({eq.category})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Free Weights & Other">
                        {STANDARD_EQUIPMENT_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <p className="text-[0.68rem] text-zinc-400 mt-1">
                      Pick from the gym machines registered in "Machines & Equipments", or choose free weights / bodyweight.
                    </p>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={editorItem.difficulty}
                      onChange={(e) => setEditorItem({ ...editorItem, difficulty: e.target.value })}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold focus:border-red-500 focus:outline-none bg-white"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  {/* Trainer Cue */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Trainer Form Cue
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Screw your feet into the ground"
                      value={editorItem.cues}
                      onChange={(e) => setEditorItem({ ...editorItem, cues: e.target.value })}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  {/* Video Demo Upload */}
                  <div className="sm:col-span-2">
                    <VideoUpload
                      label="Real-time Demo Video"
                      hint="Upload an MP4/WebM video of this exercise execution or paste a YouTube / Shorts link"
                      value={editorItem.videoUrl ? { url: editorItem.videoUrl, path: editorItem.videoPath } : null}
                      onChange={(v) =>
                        setEditorItem({
                          ...editorItem,
                          videoUrl: v?.url || '',
                          videoPath: v?.path || '',
                        })
                      }
                      folder="public/equipment_demos"
                    />
                  </div>

                  {/* Setup & Stance */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Starting Stance & Setup
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Step under bar, grip bar firmly, unrack with chest upright..."
                      value={editorItem.setup}
                      onChange={(e) => setEditorItem({ ...editorItem, setup: e.target.value })}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  {/* Execution */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Step-by-Step Movement Execution
                    </label>
                    <textarea
                      rows={3}
                      placeholder="1. Inhale and brace core&#10;2. Lower hips back and down to parallel&#10;3. Drive up through midfoot"
                      value={editorItem.execution}
                      onChange={(e) => setEditorItem({ ...editorItem, execution: e.target.value })}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  {/* Common Mistakes */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                      Common Mistakes to Avoid
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Knees caving in or rounding lower back"
                      value={editorItem.mistakes}
                      onChange={(e) => setEditorItem({ ...editorItem, mistakes: e.target.value })}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Sticky Footer Actions */}
              <div className="px-5 sm:px-6 py-3.5 border-t border-zinc-150 bg-zinc-50/80 flex items-center justify-end gap-2.5 shrink-0">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditorItem(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>
                  Save Exercise
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
