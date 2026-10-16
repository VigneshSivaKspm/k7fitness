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
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Video,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/Layout';
import Button from '../../components/ui/Button';
import GymTrafficHeatmap from '../../components/traffic/GymTrafficHeatmap';
import { PageLoader } from '../../components/ui/Feedback';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import {
  deleteEquipment,
  listEquipment,
  saveEquipment,
} from '../../services/equipmentService';
import MachineDemoModal from '../../components/equipment/MachineDemoModal';
import VideoUpload from '../../components/ui/VideoUpload';
import { uid } from '../../utils/format';

const CATEGORIES = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Cardio', 'Functional'];

export default function EquipmentPage() {
  const toast = useToast();
  const confirm = useConfirm();

  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [showTrafficHeatmap, setShowTrafficHeatmap] = useState(false);

  // Preview Demo Modal
  const [demoItem, setDemoItem] = useState(null);

  // Edit / Add Modal
  const [editorItem, setEditorItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await listEquipment();
      setEquipmentList(data);
    } catch (err) {
      toast.error('Failed to load gym equipment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = (item) => {
    confirm({
      title: `Delete ${item.name}?`,
      message: 'This will remove the machine and its exercise demos from the gym catalog.',
      confirmText: 'Delete',
      tone: 'danger',
      onConfirm: async () => {
        try {
          await deleteEquipment(item.id);
          toast.success('Equipment removed.');
          await loadData();
        } catch {
          toast.error('Failed to delete equipment.');
        }
      },
    });
  };

  const handleOpenAdd = () => {
    setEditorItem({
      id: '',
      name: '',
      category: 'Chest',
      targetMuscles: 'Chest, Triceps',
      brand: 'Technogym Pro',
      quantity: 1,
      status: 'active',
      description: '',
      setupGuide: 'Adjust seat and weight pin before starting.',
      safetyNotes: 'Always ensure weight pin is fully engaged.',
      imageUrl: '',
      exercises: [
        {
          id: uid(),
          name: '',
          targetMuscle: '',
          difficulty: 'Beginner',
          setup: '',
          execution: '',
          mistakes: '',
          cues: '',
        },
      ],
    });
  };

  const handleOpenEdit = (item) => {
    setEditorItem({
      ...item,
      targetMuscles: Array.isArray(item.targetMuscles)
        ? item.targetMuscles.join(', ')
        : item.targetMuscles || '',
      exercises: (item.exercises || []).map((ex) => ({
        ...ex,
        id: ex.id || uid(),
      })),
    });
  };

  const handleSaveEditor = async (e) => {
    e.preventDefault();
    if (!editorItem.name.trim()) {
      toast.error('Machine name is required.');
      return;
    }
    setSaving(true);
    try {
      await saveEquipment(editorItem);
      toast.success('Equipment and exercise demos saved successfully.');
      setEditorItem(null);
      await loadData();
    } catch {
      toast.error('Failed to save equipment.');
    } finally {
      setSaving(false);
    }
  };

  // Filtered List
  const filtered = equipmentList.filter((item) => {
    const matchCat =
      selectedCategory === 'All' ||
      item.category?.toLowerCase() === selectedCategory.toLowerCase();
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.name?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.exercises?.some((ex) => ex.name?.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Machines & Equipments"
        description="Manage all gym machines, strength stations, and cardio equipment with setup guides, safety protocols, and video demonstrations."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={showTrafficHeatmap ? 'primary' : 'secondary'}
              size="sm"
              icon={Flame}
              onClick={() => setShowTrafficHeatmap((s) => !s)}
              title="Toggle Live Machine Traffic & Crowd Heatmap"
            >
              {showTrafficHeatmap ? 'Hide Traffic Heatmap' : 'Machine Traffic & Heatmap'}
            </Button>
            <Button size="sm" icon={Plus} onClick={handleOpenAdd}>
              Add Machine & Equipment
            </Button>
          </div>
        }
      />

      {/* Admin Machine Busy Timings & Traffic Heatmap */}
      {showTrafficHeatmap && (
        <div className="animate-in fade-in duration-200">
          <GymTrafficHeatmap />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search machine or exercise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 py-1.5 text-xs font-medium placeholder-zinc-400 focus:border-brand focus:outline-none"
            />
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

      {/* Equipment Render Area */}
      {loading ? (
        <PageLoader />
      ) : filtered.length > 0 ? (
        viewMode === 'list' ? (
          /* High-density Modern List View */
          <div className="rounded-3xl border border-zinc-200 bg-white overflow-hidden shadow-xs divide-y divide-zinc-100">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-50/70 transition"
              >
                <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                  {/* Compact Thumbnail */}
                  <div className="relative size-16 sm:size-20 rounded-2xl bg-zinc-900 overflow-hidden shrink-0 border border-zinc-200 shadow-2xs">
                    {item.imageUrl ? (
                      <img
                        src={encodeURI(item.imageUrl)}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-zinc-600">
                        <Dumbbell className="size-7" />
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 rounded-md bg-black/85 px-1.5 py-0.2 text-[0.6rem] font-bold text-white">
                      Qty: {item.quantity || 1}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-zinc-950 text-white px-2 py-0.5 text-[0.62rem] font-extrabold uppercase tracking-wider">
                        {item.category}
                      </span>
                      {item.brand && (
                        <span className="text-[0.68rem] text-zinc-500 font-medium">
                          Model: <strong className="text-zinc-700">{item.brand}</strong>
                        </span>
                      )}
                      {item.videoUrl && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-700 text-[0.62rem] font-bold px-2 py-0.5 ring-1 ring-emerald-200">
                          <Video className="size-3" /> Video Demo
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-sm text-zinc-950 truncate">
                      {item.name}
                    </h3>

                    <p className="text-xs text-zinc-500 line-clamp-1 max-w-2xl">
                      {item.description || item.setupGuide || 'High performance gym equipment station.'}
                    </p>

                    {/* Exercises Tags */}
                    {item.exercises?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[0.68rem] font-bold text-red-600 mr-1">
                          {item.exercises.length} moves:
                        </span>
                        {item.exercises.slice(0, 4).map((ex, idx) => (
                          <span
                            key={ex.id || idx}
                            className="rounded-lg bg-zinc-100 border border-zinc-200/60 px-2 py-0.5 text-[0.65rem] font-semibold text-zinc-700 truncate max-w-[150px]"
                          >
                            {ex.name}
                          </span>
                        ))}
                        {item.exercises.length > 4 && (
                          <span className="text-[0.65rem] text-zinc-400 font-bold">
                            +{item.exercises.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Right */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={Eye}
                    onClick={() => setDemoItem(item)}
                    className="text-xs font-bold"
                  >
                    Live Demo
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 rounded-xl text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 transition border border-zinc-200"
                    title="Edit machine & exercises"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="p-2 rounded-xl text-zinc-400 hover:bg-red-50 hover:text-red-600 transition border border-zinc-200"
                    title="Delete equipment"
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
                className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Image / Header */}
                  <div className="relative h-36 w-full bg-zinc-900 overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={encodeURI(item.imageUrl)}
                        alt={item.name}
                        className="h-full w-full object-cover opacity-85 hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-zinc-900 text-zinc-700">
                        <Dumbbell className="size-12" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="rounded-lg bg-black/70 backdrop-blur-md px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-white">
                        {item.category}
                      </span>
                      <span className="rounded-lg bg-emerald-500/80 backdrop-blur-md px-2 py-0.5 text-[0.65rem] font-bold text-white">
                        Qty: {item.quantity || 1}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-extrabold text-sm text-zinc-950 leading-tight">
                      {item.name}
                    </h3>
                    {item.brand && (
                      <p className="text-[0.7rem] text-zinc-400 font-medium">Model: {item.brand}</p>
                    )}
                    <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                      {item.description || item.setupGuide || 'High performance gym equipment.'}
                    </p>

                    {/* Possible Exercises Count */}
                    <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                      <span className="text-[0.7rem] font-bold text-zinc-500 uppercase tracking-wider">
                        Possible Exercises:
                      </span>
                      <span className="rounded-full bg-red-50 text-red-600 font-extrabold text-[0.68rem] px-2 py-0.5">
                        {item.exercises?.length || 0} moves
                      </span>
                    </div>

                    {/* Exercise Tags preview */}
                    {item.exercises?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.exercises.slice(0, 3).map((ex, idx) => (
                          <span
                            key={ex.id || idx}
                            className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[0.65rem] font-medium text-zinc-700 truncate max-w-[130px]"
                          >
                            {ex.name}
                          </span>
                        ))}
                        {item.exercises.length > 3 && (
                          <span className="text-[0.65rem] text-zinc-400 font-bold self-center">
                            +{item.exercises.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 pt-0 border-t border-zinc-100 mt-2 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={Eye}
                    onClick={() => setDemoItem(item)}
                    className="text-xs font-bold"
                  >
                    Live Demo
                  </Button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 transition"
                      title="Edit machine & exercises"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-600 transition"
                      title="Delete equipment"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <Dumbbell className="mx-auto size-10 text-zinc-400" />
          <h3 className="mt-3 text-sm font-bold text-zinc-900">No equipment found</h3>
          <p className="mt-1 text-xs text-zinc-500">
            {search ? 'Try clearing your search query' : 'Click below to load standard gym equipment & demos.'}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button size="sm" icon={Plus} onClick={handleOpenAdd}>
              Add Machine Manually
            </Button>
          </div>
        </div>
      )}

      {/* Interactive Live Demo Modal */}
      <MachineDemoModal
        equipment={demoItem}
        open={Boolean(demoItem)}
        onClose={() => setDemoItem(null)}
      />

      {/* Machine & Exercises Editor Modal */}
      {editorItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-5 backdrop-blur-sm overflow-y-auto animate-in fade-in-50 duration-150">
          <div className="w-full max-w-3xl rounded-3xl border border-zinc-200 bg-white shadow-2xl text-zinc-900 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="border-b border-zinc-200 px-6 py-4 flex items-center justify-between shrink-0 bg-zinc-50">
              <div>
                <h2 className="text-base font-black text-zinc-950">
                  {editorItem.id ? `Edit ${editorItem.name}` : 'Add New Gym Machine'}
                </h2>
                <p className="text-xs text-zinc-500">
                  Configure equipment specifications and possible exercise routines.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditorItem(null)}
                className="size-8 flex items-center justify-center rounded-full bg-zinc-200/80 text-zinc-600 hover:bg-zinc-300"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditor} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Basic Machine Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Machine / Equipment Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dual Adjustable Cable Crossover"
                    value={editorItem.name}
                    onChange={(e) => setEditorItem({ ...editorItem, name: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Muscle Category
                  </label>
                  <select
                    value={editorItem.category}
                    onChange={(e) => setEditorItem({ ...editorItem, category: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold focus:border-brand focus:outline-none bg-white"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Brand / Manufacturer Model
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Technogym / LifeFitness"
                    value={editorItem.brand}
                    onChange={(e) => setEditorItem({ ...editorItem, brand: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Quantity in Studio
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editorItem.quantity}
                    onChange={(e) => setEditorItem({ ...editorItem, quantity: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Image URL or Local Path
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /gym/45-Degree Leg Press Machine.jpg or https://..."
                    value={editorItem.imageUrl}
                    onChange={(e) => setEditorItem({ ...editorItem, imageUrl: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold focus:border-brand focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <VideoUpload
                    label="Machine Overview / Demonstration Video"
                    hint="Upload an MP4/WebM video file of this machine or paste a YouTube demo link"
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

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Setup & Adjustment Guide
                  </label>
                  <textarea
                    rows={2}
                    placeholder="How to adjust seat height, pin positions, pulley angles..."
                    value={editorItem.setupGuide}
                    onChange={(e) => setEditorItem({ ...editorItem, setupGuide: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs focus:border-brand focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Safety Rules & Warnings
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Never lock knees, always test safety pins..."
                    value={editorItem.safetyNotes}
                    onChange={(e) => setEditorItem({ ...editorItem, safetyNotes: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              {/* Possible Exercises Section */}
              <div className="border-t border-zinc-200 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-zinc-950 flex items-center gap-2">
                      <Dumbbell className="size-4 text-red-600" /> Possible Exercises on this Machine ({editorItem.exercises?.length || 0})
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Add the exercises members can perform using this machine with step-by-step form guides.
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    icon={Plus}
                    onClick={() =>
                      setEditorItem({
                        ...editorItem,
                        exercises: [
                          ...(editorItem.exercises || []),
                          {
                            id: uid(),
                            name: '',
                            targetMuscle: '',
                            difficulty: 'Beginner',
                            setup: '',
                            execution: '',
                            mistakes: '',
                            cues: '',
                          },
                        ],
                      })
                    }
                  >
                    Add Exercise
                  </Button>
                </div>

                <div className="space-y-4">
                  {editorItem.exercises?.map((ex, exIdx) => (
                    <div
                      key={ex.id || exIdx}
                      className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold text-xs text-zinc-900">
                          <span className="flex size-5 items-center justify-center rounded-full bg-zinc-950 text-white text-[0.65rem] font-bold">
                            {exIdx + 1}
                          </span>
                          Exercise #{exIdx + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setEditorItem({
                              ...editorItem,
                              exercises: editorItem.exercises.filter((_, i) => i !== exIdx),
                            })
                          }
                          className="text-zinc-400 hover:text-red-600 p-1"
                          title="Remove exercise"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[0.68rem] font-bold uppercase text-zinc-600 mb-1">
                            Exercise Name *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Cable Chest Fly"
                            value={ex.name}
                            onChange={(e) => {
                              const updated = [...editorItem.exercises];
                              updated[exIdx].name = e.target.value;
                              setEditorItem({ ...editorItem, exercises: updated });
                            }}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold focus:border-brand focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[0.68rem] font-bold uppercase text-zinc-600 mb-1">
                            Target Muscle
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Lower Pecs"
                            value={ex.targetMuscle}
                            onChange={(e) => {
                              const updated = [...editorItem.exercises];
                              updated[exIdx].targetMuscle = e.target.value;
                              setEditorItem({ ...editorItem, exercises: updated });
                            }}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs focus:border-brand focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[0.68rem] font-bold uppercase text-zinc-600 mb-1">
                            Starting Stance & Setup
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Set pulleys to highest notch. Stand in staggered stance."
                            value={ex.setup}
                            onChange={(e) => {
                              const updated = [...editorItem.exercises];
                              updated[exIdx].setup = e.target.value;
                              setEditorItem({ ...editorItem, exercises: updated });
                            }}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs focus:border-brand focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[0.68rem] font-bold uppercase text-zinc-600 mb-1">
                            Step-by-Step Movement Execution
                          </label>
                          <textarea
                            rows={3}
                            placeholder="1. Bring handles together in sweeping arc&#10;2. Squeeze pecs for 1s&#10;3. Return under 3s control"
                            value={ex.execution}
                            onChange={(e) => {
                              const updated = [...editorItem.exercises];
                              updated[exIdx].execution = e.target.value;
                              setEditorItem({ ...editorItem, exercises: updated });
                            }}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs focus:border-brand focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[0.68rem] font-bold uppercase text-zinc-600 mb-1">
                            Common Mistakes to Avoid
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Leaning too far forward or using torso momentum"
                            value={ex.mistakes}
                            onChange={(e) => {
                              const updated = [...editorItem.exercises];
                              updated[exIdx].mistakes = e.target.value;
                              setEditorItem({ ...editorItem, exercises: updated });
                            }}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs focus:border-brand focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[0.68rem] font-bold uppercase text-zinc-600 mb-1">
                            Trainer Cue
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Hug a big tree"
                            value={ex.cues}
                            onChange={(e) => {
                              const updated = [...editorItem.exercises];
                              updated[exIdx].cues = e.target.value;
                              setEditorItem({ ...editorItem, exercises: updated });
                            }}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs focus:border-brand focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <VideoUpload
                            label={`Demonstration Video (${ex.name || `Exercise #${exIdx + 1}`})`}
                            hint="Upload an MP4/WebM video of this movement or paste a YouTube / Shorts link"
                            value={ex.videoUrl ? { url: ex.videoUrl, path: ex.videoPath } : null}
                            onChange={(v) => {
                              const updated = [...editorItem.exercises];
                              updated[exIdx].videoUrl = v?.url || '';
                              updated[exIdx].videoPath = v?.path || '';
                              setEditorItem({ ...editorItem, exercises: updated });
                            }}
                            folder="public/equipment_demos"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-zinc-200 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditorItem(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>
                  Save Equipment & Demos
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
