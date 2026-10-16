import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Copy, Pencil, Plus, Printer, Trash2, UserPlus } from 'lucide-react';
import { PageHeader } from '../ui/Layout';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import SearchInput from '../ui/SearchInput';
import DropdownMenu from '../ui/DropdownMenu';
import { EmptyState, ErrorState, SkeletonRows } from '../ui/Feedback';
import { useAsync, useDocumentTitle } from '../../hooks/useAsync';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/dates';
import { friendlyError } from '../../utils/errors';
import AssignToMemberDialog from './AssignToMemberDialog';

/**
 * Shared list screen for workout and diet templates.
 * config: { service, kind, title, description, icon, basePath, meta(t) => string[] , starters }
 */
export default function TemplateList({ config }) {
  useDocumentTitle(config.title);
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [assignTarget, setAssignTarget] = useState(null);
  const { data, loading, error, reload } = useAsync(() => config.service.listTemplates(), []);

  const [selectedGoal, setSelectedGoal] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data || []).filter((t) => {
      const matchSearch =
        !q ||
        [t.name, t.goal, t.level, t.description].some((f) =>
          (f || '').toLowerCase().includes(q)
        );
      const matchGoal =
        selectedGoal === 'All' ||
        (t.goal || '').toLowerCase() === selectedGoal.toLowerCase();
      const matchLevel =
        selectedLevel === 'All' ||
        (t.level || '').toLowerCase() === selectedLevel.toLowerCase();
      return matchSearch && matchGoal && matchLevel;
    });
  }, [data, search, selectedGoal, selectedLevel]);

  const duplicate = async (t) => {
    try {
      const id = await config.service.duplicateTemplate(t);
      toast.success('Template duplicated.');
      navigate(`${config.basePath}/${id}`);
    } catch (err) {
      toast.error(friendlyError(err));
    }
  };

  const remove = (t) =>
    confirm({
      title: 'Delete template?',
      message: `“${t.name}” will be deleted. Members who already have this plan assigned keep their copy.`,
      confirmText: 'Delete template',
      onConfirm: async () => {
        await config.service.deleteTemplate(t);
        toast.success('Template deleted.');
        reload({ silent: true });
      },
    });

  return (
    <>
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          <Button to={`${config.basePath}/new`} icon={Plus}>
            New template
          </Button>
        }
      />
      <div className="card overflow-hidden">
        {(data?.length || 0) > 0 && (
          <div className="border-b border-zinc-100 p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <SearchInput
                value={search}
                onSearch={setSearch}
                delay={0}
                placeholder="Search templates by name, goal or level..."
                className="flex-1"
              />
            </div>

            {/* Filter Pills for Goal and Level */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-50">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                <span className="font-bold text-zinc-400 text-[0.68rem] uppercase tracking-wider mr-1">
                  Level / Target:
                </span>
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevel(lvl)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      selectedLevel === lvl
                        ? 'bg-zinc-950 text-white shadow-2xs'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                <span className="font-bold text-zinc-400 text-[0.68rem] uppercase tracking-wider mr-1">
                  Goal:
                </span>
                {(config.kind === 'diet'
                  ? ['All', 'Weight loss', 'Muscle gain', 'High protein', 'General fitness']
                  : ['All', 'Fat loss', 'Muscle gain', 'General fitness', 'Endurance']
                ).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGoal(g)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      selectedGoal === g
                        ? 'bg-red-600 text-white shadow-2xs'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading && !data ? (
          <SkeletonRows rows={4} />
        ) : !items.length ? (
          <EmptyState
            icon={config.icon}
            title={data?.length ? 'No templates match your search filters' : `No ${config.kind} templates yet`}
            description={data?.length ? 'Try resetting level or goal filters.' : config.emptyHint}
            action={
              <Button to={`${config.basePath}/new`} icon={Plus}>
                Create template
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-px bg-zinc-100 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((t) => {
              const is6DayWorkout = config.kind === 'workout' && t.days?.length === 6;
              const is5DayWorkout = config.kind === 'workout' && t.days?.length === 5;
              const is6DayDiet = config.kind === 'diet' && t.meals?.length === 6;

              return (
                <li key={t.id} className="group relative bg-white p-5 transition hover:bg-brand-50/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <button type="button" onClick={() => navigate(`${config.basePath}/${t.id}`)} className="min-w-0 flex-1 text-left">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="flex size-10 items-center justify-center rounded-xl bg-ink text-white group-hover:bg-brand transition-colors">
                            <config.icon className="size-5" />
                          </span>
                          {is6DayWorkout && (
                            <span className="rounded-full bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 text-[0.65rem] font-black uppercase tracking-wide">
                              6-Day Mon–Sat Workchart (8 Ex/Day)
                            </span>
                          )}
                          {is5DayWorkout && (
                            <span className="rounded-full bg-zinc-50 text-zinc-600 border border-zinc-200 px-2.5 py-0.5 text-[0.65rem] font-black uppercase tracking-wide">
                              5-Day Mon–Fri Workchart
                            </span>
                          )}
                          {is6DayDiet && (
                            <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[0.65rem] font-black uppercase tracking-wide">
                              6-Day Mon–Sat Food Chart
                            </span>
                          )}
                        </div>

                        <span className="block font-black text-sm text-zinc-900 group-hover:text-brand leading-snug">
                          {t.name}
                        </span>

                        <span className="mt-1.5 flex flex-wrap gap-1.5">
                          {config.meta(t).filter(Boolean).map((m) => (
                            <Badge key={m}>{m}</Badge>
                          ))}
                        </span>

                        {t.description && (
                          <span className="mt-2 line-clamp-2 block text-xs text-zinc-500 leading-relaxed">
                            {t.description}
                          </span>
                        )}

                        {/* Monday to Saturday Workout Schedule Preview */}
                        {t.days && t.days.length > 0 && (
                          <div className="mt-3 rounded-2xl bg-zinc-50 border border-zinc-150 p-2.5 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[0.62rem] font-black uppercase tracking-wider text-zinc-400 block">
                                Weekly Schedule ({t.days.length} Days · Mon–Sat)
                              </span>
                              <span className="text-[0.6rem] font-bold text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">
                                Sunday Rest
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {t.days.map((d, idx) => (
                                <span
                                  key={d.id || idx}
                                  className="rounded-md bg-white border border-zinc-200 px-1.5 py-0.5 text-[0.62rem] font-bold text-zinc-700 truncate max-w-[210px]"
                                  title={`${d.title} (${d.exercises?.length || 0} exercises)`}
                                >
                                  {d.title?.split('·')[0]?.trim() || `Day ${idx + 1}`}: {d.title?.split('·')[1]?.trim() || ''}
                                  {d.exercises?.length ? ` (${d.exercises.length} ex)` : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Monday to Saturday Diet Schedule Preview */}
                        {t.meals && t.meals.length > 0 && (
                          <div className="mt-3 rounded-2xl bg-zinc-50 border border-zinc-150 p-2.5 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[0.62rem] font-black uppercase tracking-wider text-zinc-400 block">
                                Weekly Nutrition ({t.meals.length} Days · Mon–Sat)
                              </span>
                              <span className="text-[0.6rem] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
                                Clean Diet
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {t.meals.map((m, idx) => (
                                <span
                                  key={m.id || idx}
                                  className="rounded-md bg-white border border-zinc-200 px-1.5 py-0.5 text-[0.62rem] font-bold text-zinc-700 truncate max-w-[200px]"
                                  title={m.slot}
                                >
                                  {m.slot?.split('·')[0]?.trim() || `Day ${idx + 1}`}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <span className="mt-3 block text-[0.68rem] text-zinc-400">Updated {formatDate(t.updatedAt)}</span>
                      </button>
                      <DropdownMenu
                        items={[
                          { label: 'Assign to Member', icon: UserPlus, onClick: () => setAssignTarget(t) },
                          { label: 'Edit', icon: Pencil, to: `${config.basePath}/${t.id}` },
                          { label: 'Duplicate', icon: Copy, onClick: () => duplicate(t) },
                          { label: 'Print', icon: Printer, to: `/print/${config.kind}/template/${t.id}` },
                          { divider: true },
                          { label: 'Delete', icon: Trash2, tone: 'danger', onClick: () => remove(t) },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-[0.68rem] text-zinc-400 font-medium">
                      {config.kind === 'workout'
                        ? `${t.days?.length || 6}-Day Master Workchart (Mon–Sat · 8 Ex/Day)`
                        : '6-Day Nutrition Blueprint (Mon–Sat)'}
                    </span>
                    <Button
                      variant="secondary"
                      size="xs"
                      icon={UserPlus}
                      onClick={() => setAssignTarget(t)}
                      className="hover:border-brand hover:text-brand"
                    >
                      Assign to Member
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <AssignToMemberDialog
        template={assignTarget}
        kind={config.kind}
        open={Boolean(assignTarget)}
        onClose={() => setAssignTarget(null)}
        onDone={reload}
      />
    </>
  );
}
