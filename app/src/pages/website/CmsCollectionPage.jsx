import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/ui/Layout';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Switch from '../../components/ui/Switch';
import DropdownMenu from '../../components/ui/DropdownMenu';
import ReorderButtons, { moveItem } from '../../components/ui/ReorderButtons';
import { EmptyState, ErrorState, SkeletonRows } from '../../components/ui/Feedback';
import CmsItemDialog from '../../components/cms/CmsItemDialog';
import { CMS_COLLECTIONS } from '../../components/cms/cmsConfigs';
import { deleteItem, listItems, reorderItems, setItemFields } from '../../services/websiteService';
import { useAsync, useDocumentTitle } from '../../hooks/useAsync';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import { daysUntil, formatDate } from '../../utils/dates';
import { friendlyError } from '../../utils/errors';
import { mediaUrl } from '../../utils/format';
import NotFound from '../NotFound';

function offerState(o) {
  if (!o.active) return { label: 'Hidden', tone: 'neutral' };
  if (o.endDate && daysUntil(o.endDate) < 0) return { label: 'Expired', tone: 'danger' };
  if (o.startDate && daysUntil(o.startDate) > 0) return { label: 'Scheduled', tone: 'warning' };
  return { label: 'Live', tone: 'success' };
}

/** /website/programs | trainers | testimonials | offers */
export default function CmsCollectionPage() {
  const { collection } = useParams();
  const config = CMS_COLLECTIONS[collection];
  useDocumentTitle(config ? `Website: ${config.title}` : 'Not found');
  if (!config) return <NotFound />;
  return <CollectionManager key={collection} config={config} />;
}

function CollectionManager({ config }) {
  const confirm = useConfirm();
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => listItems(config.collection), [config.collection]);
  const [items, setItems] = useState([]);
  const [dialog, setDialog] = useState(null); // { item } | { item: null }

  useEffect(() => setItems(data || []), [data]);

  const toggle = async (item) => {
    setItems((list) => list.map((i) => (i.id === item.id ? { ...i, active: !item.active } : i)));
    try {
      await setItemFields(config.collection, item.id, { active: !item.active });
      toast.success('Website content updated successfully.');
    } catch (err) {
      toast.error(friendlyError(err));
      reload({ silent: true });
    }
  };

  const move = async (index, dir) => {
    const next = moveItem(items, index, dir);
    setItems(next);
    try {
      await reorderItems(config.collection, next);
    } catch (err) {
      toast.error(friendlyError(err));
      reload({ silent: true });
    }
  };

  const remove = (item) =>
    confirm({
      title: `Delete ${config.singular}?`,
      message: `“${item[config.titleKey]}” will be permanently removed from the website${item[config.imageKey] ? ', including its image' : ''}. To hide it temporarily, switch it off instead.`,
      confirmText: 'Delete',
      onConfirm: async () => {
        await deleteItem(config.collection, item);
        toast.success(`${config.singular[0].toUpperCase()}${config.singular.slice(1)} deleted.`);
        reload({ silent: true });
      },
    });

  const nextOrder = items.reduce((m, i) => Math.max(m, (i.displayOrder ?? 0) + 1), 0);
  const Icon = config.icon;

  return (
    <>
      <PageHeader
        back={{ to: '/website', label: 'Website' }}
        title={config.title}
        description={config.description}
        actions={
          <Button icon={Plus} onClick={() => setDialog({ item: null })}>
            Add {config.singular}
          </Button>
        }
      />
      <div className="card overflow-hidden">
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading && !data ? (
          <SkeletonRows rows={4} />
        ) : !items.length ? (
          <EmptyState
            icon={Icon}
            title={`No ${config.title.toLowerCase()} yet`}
            description={`This section stays hidden on the website until you add a ${config.singular}.`}
            action={
              <Button icon={Plus} onClick={() => setDialog({ item: null })}>
                Add {config.singular}
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-zinc-100">
            {items.map((item, i) => {
              const state = config.collection === 'offers' ? offerState(item) : null;
              return (
                <li key={item.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                  {config.reorder && <ReorderButtons index={i} count={items.length} onMove={move} label={item[config.titleKey]} />}
                  <button type="button" onClick={() => setDialog({ item })} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    {item[config.imageKey] ? (
                      <img src={mediaUrl(item[config.imageKey])} alt="" loading="lazy" className="size-12 shrink-0 rounded-lg object-cover ring-1 ring-zinc-200" />
                    ) : (
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-400">
                        <Icon className="size-5" />
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className={`block truncate font-semibold ${item.active ? 'text-zinc-900' : 'text-zinc-400'}`}>{item[config.titleKey]}</span>
                      <span className="block truncate text-xs text-zinc-500">
                        {config.collection === 'offers' ? `${formatDate(item.startDate)} – ${formatDate(item.endDate)}` : config.subtitle(item)}
                      </span>
                    </span>
                  </button>
                  {state && <Badge tone={state.tone} dot className="hidden sm:inline-flex">{state.label}</Badge>}
                  <Switch size="sm" checked={item.active} onChange={() => toggle(item)} label={<span className="sr-only">Show on website</span>} />
                  <DropdownMenu
                    items={[
                      { label: 'Edit', icon: Pencil, onClick: () => setDialog({ item }) },
                      { label: 'Delete', icon: Trash2, tone: 'danger', onClick: () => remove(item) },
                    ]}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <CmsItemDialog
        key={dialog ? dialog.item?.id || 'new' : 'closed'}
        config={config}
        item={dialog?.item || null}
        open={Boolean(dialog)}
        onClose={() => setDialog(null)}
        onSaved={() => reload({ silent: true })}
        nextOrder={nextOrder}
      />
    </>
  );
}
