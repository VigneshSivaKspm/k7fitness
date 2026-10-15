import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Copy, Pencil, Plus, Printer, Sparkles, Trash2, UserPlus } from 'lucide-react';
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
import { seedStarterTemplatesIfEmpty } from '../../services/trafficService';

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
  const [seeding, setSeeding] = useState(false);
  const { data, loading, error, reload } = useAsync(() => config.service.listTemplates(), []);

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data || []).filter((t) => !q || [t.name, t.goal, t.level].some((f) => (f || '').toLowerCase().includes(q)));
  }, [data, search]);

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

  const handleSeedStarter = async () => {
    setSeeding(true);
    try {
      await seedStarterTemplatesIfEmpty(config.kind);
      toast.success(`Starter ${config.kind} templates ready!`);
      reload();
    } catch (err) {
      toast.error('Failed to load starter templates.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <>
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          <div className="flex items-center gap-2">
            {(!data || data.length === 0) && (
              <Button
                variant="secondary"
                icon={Sparkles}
                onClick={handleSeedStarter}
                loading={seeding}
              >
                Load Starters
              </Button>
            )}
            <Button to={`${config.basePath}/new`} icon={Plus}>
              New template
            </Button>
          </div>
        }
      />
      <div className="card overflow-hidden">
        {(data?.length || 0) > 0 && (
          <div className="border-b border-zinc-100 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <SearchInput
              value={search}
              onSearch={setSearch}
              delay={0}
              placeholder="Search templates by name, goal or level"
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              icon={Sparkles}
              onClick={handleSeedStarter}
              loading={seeding}
              className="text-xs text-zinc-500 hover:text-brand"
            >
              Add Standard Starters
            </Button>
          </div>
        )}
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading && !data ? (
          <SkeletonRows rows={4} />
        ) : !items.length ? (
          <EmptyState
            icon={config.icon}
            title={data?.length ? 'No templates match your search' : `No ${config.kind} templates yet`}
            description={data?.length ? undefined : config.emptyHint}
            action={
              <div className="flex items-center gap-2">
                <Button variant="secondary" icon={Sparkles} onClick={handleSeedStarter} loading={seeding}>
                  Load Starter Templates
                </Button>
                <Button to={`${config.basePath}/new`} icon={Plus}>
                  Create template
                </Button>
              </div>
            }
          />
        ) : (
          <ul className="grid gap-px bg-zinc-100 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((t) => (
              <li key={t.id} className="group relative bg-white p-5 transition hover:bg-brand-50/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <button type="button" onClick={() => navigate(`${config.basePath}/${t.id}`)} className="min-w-0 flex-1 text-left">
                      <span className="mb-2 flex size-10 items-center justify-center rounded-xl bg-ink text-white group-hover:bg-brand transition-colors">
                        <config.icon className="size-5" />
                      </span>
                      <span className="block truncate font-semibold text-zinc-900 group-hover:text-brand">{t.name}</span>
                      <span className="mt-1 flex flex-wrap gap-1.5">
                        {config.meta(t).filter(Boolean).map((m) => (
                          <Badge key={m}>{m}</Badge>
                        ))}
                      </span>
                      {t.description && <span className="mt-2 line-clamp-2 block text-sm text-zinc-500">{t.description}</span>}
                      <span className="mt-3 block text-xs text-zinc-400">Updated {formatDate(t.updatedAt)}</span>
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
                  <span className="text-[0.7rem] text-zinc-400 font-medium">Reusable template</span>
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
            ))}
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
