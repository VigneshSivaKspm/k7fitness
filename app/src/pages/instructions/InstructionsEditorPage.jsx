import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  Plus,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/Layout';
import Button from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/Feedback';
import { useToast } from '../../context/ToastContext';
import {
  DEFAULT_INSTRUCTIONS,
  getGymInstructions,
  saveGymInstructions,
} from '../../services/equipmentService';
import { uid } from '../../utils/format';

export default function InstructionsEditorPage() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getGymInstructions()
      .then((data) => setCategories(data))
      .catch(() => toast.error('Failed to load gym instructions.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveGymInstructions(categories);
      toast.success('Gym guidelines and instructions saved for all members!');
    } catch {
      toast.error('Failed to save instructions.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setCategories(DEFAULT_INSTRUCTIONS);
    toast.info('Restored default standard gym instructions. Click Save to persist.');
  };

  const addCategory = () => {
    setCategories([
      ...categories,
      {
        id: uid(),
        title: 'New Guideline Category',
        icon: 'ShieldCheck',
        badge: 'Notice',
        items: [
          {
            title: 'Rule title',
            desc: 'Describe the policy, step-by-step guideline or etiquette requirement.',
          },
        ],
      },
    ]);
  };

  const removeCategory = (catIdx) => {
    setCategories(categories.filter((_, idx) => idx !== catIdx));
  };

  const addItemToCat = (catIdx) => {
    const updated = [...categories];
    updated[catIdx].items.push({
      title: '',
      desc: '',
    });
    setCategories(updated);
  };

  const removeItemFromCat = (catIdx, itemIdx) => {
    const updated = [...categories];
    updated[catIdx].items = updated[catIdx].items.filter((_, idx) => idx !== itemIdx);
    setCategories(updated);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Member Instructions & Gym Guidelines"
        description="Configure gym operating rules, equipment safety instructions, and etiquette shown to all members in their portal."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Sparkles}
              onClick={handleResetDefaults}
            >
              Reset Standards
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={addCategory}
            >
              Add Category
            </Button>
            <Button
              size="sm"
              icon={Save}
              onClick={handleSave}
              loading={saving}
            >
              Save Instructions
            </Button>
          </div>
        }
      />

      {/* Categories & Rules */}
      <div className="space-y-6">
        {categories.map((cat, catIdx) => (
          <div
            key={cat.id || catIdx}
            className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs space-y-4"
          >
            {/* Category Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-3 flex-1">
                <span className="flex size-9 items-center justify-center rounded-xl bg-zinc-950 text-white shrink-0">
                  <ShieldCheck className="size-4.5 text-red-500" />
                </span>
                <input
                  type="text"
                  value={cat.title}
                  onChange={(e) => {
                    const next = [...categories];
                    next[catIdx].title = e.target.value;
                    setCategories(next);
                  }}
                  className="font-black text-sm text-zinc-950 border-b border-transparent hover:border-zinc-300 focus:border-brand focus:outline-none w-full max-w-md py-1"
                  placeholder="Category Title"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={cat.badge || 'Guideline'}
                  onChange={(e) => {
                    const next = [...categories];
                    next[catIdx].badge = e.target.value;
                    setCategories(next);
                  }}
                  className="rounded-md bg-red-50 border border-red-200 text-red-700 text-[0.68rem] font-bold px-2 py-0.5 max-w-[100px] text-center"
                  placeholder="Badge"
                />
                <button
                  type="button"
                  onClick={() => removeCategory(catIdx)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-600 transition"
                  title="Remove category"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>

            {/* Instruction Items */}
            <div className="space-y-3">
              {cat.items?.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3.5 space-y-2 relative"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const next = [...categories];
                        next[catIdx].items[itemIdx].title = e.target.value;
                        setCategories(next);
                      }}
                      placeholder="Guideline Title (e.g. Always Re-rack weights)"
                      className="w-full bg-transparent font-bold text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeItemFromCat(catIdx, itemIdx)}
                      className="text-zinc-400 hover:text-red-600 p-1"
                      title="Delete rule"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    value={item.desc}
                    onChange={(e) => {
                      const next = [...categories];
                      next[catIdx].items[itemIdx].desc = e.target.value;
                      setCategories(next);
                    }}
                    placeholder="Provide details, rationale, or steps for this rule..."
                    className="w-full bg-white rounded-xl border border-zinc-200 px-3 py-1.5 text-xs text-zinc-700 placeholder:text-zinc-400 focus:border-brand focus:outline-none"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() => addItemToCat(catIdx)}
                className="w-full py-2 border border-dashed border-zinc-300 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 transition flex items-center justify-center gap-1.5"
              >
                <Plus className="size-3.5" /> Add Rule to this Category
              </button>
            </div>
          </div>
        ))}

        {/* Floating Save Button */}
        <div className="flex justify-end pt-3">
          <Button size="md" icon={Save} onClick={handleSave} loading={saving}>
            Save All Changes Live
          </Button>
        </div>
      </div>
    </div>
  );
}
