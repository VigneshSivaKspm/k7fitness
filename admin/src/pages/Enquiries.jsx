import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Inbox, Mail, MessageCircle, Phone, Trash2, UserPlus } from 'lucide-react';
import { PageHeader, DetailList } from '../components/ui/Layout';
import Button from '../components/ui/Button';
import Tabs from '../components/ui/Tabs';
import Modal from '../components/ui/Modal';
import DataTable from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import { StatusBadge } from '../components/ui/Badge';
import { EmptyState, ErrorState } from '../components/ui/Feedback';
import { SelectField, TextArea } from '../components/ui/Field';
import { deleteEnquiry, listEnquiries, updateEnquiry } from '../services/enquiryService';
import { usePagedList } from '../hooks/usePagedList';
import { useDocumentTitle } from '../hooks/useAsync';
import { useReminders } from '../hooks/useReminders';
import { useSettings } from '../context/SettingsContext';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';
import { ENQUIRY_STATUS } from '../constants/options';
import { formatDateTime, timeAgo } from '../utils/dates';
import { formatPhone, telLink } from '../utils/format';
import { friendlyError } from '../utils/errors';

const FILTERS = [{ value: 'all', label: 'All' }, ...Object.entries(ENQUIRY_STATUS).map(([value, s]) => ({ value, label: s.label }))];

function EnquiryDialog({ enquiry, open, onClose, onUpdated, onDeleted }) {
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const reminders = useReminders();
  const [status, setStatus] = useState('new');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (enquiry) {
      setStatus(enquiry.status || 'new');
      setNotes(enquiry.internalNotes || '');
    }
  }, [enquiry]);

  if (!enquiry) return null;
  const dirty = status !== enquiry.status || notes !== (enquiry.internalNotes || '');

  const save = async () => {
    setBusy(true);
    try {
      await updateEnquiry(enquiry.id, { status, internalNotes: notes.trim() });
      toast.success('Enquiry updated.');
      onUpdated({ ...enquiry, status, internalNotes: notes.trim() });
      onClose();
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const convert = async () => {
    try {
      if (enquiry.status !== 'converted') {
        await updateEnquiry(enquiry.id, { status: 'converted', internalNotes: notes.trim() });
        onUpdated({ ...enquiry, status: 'converted' });
      }
      onClose();
      navigate('/trainees/new', { state: { prefill: { fullName: enquiry.name, phone: enquiry.phone, email: enquiry.email || '' } } });
    } catch (err) {
      toast.error(friendlyError(err));
    }
  };

  const remove = () =>
    confirm({
      title: 'Delete enquiry?',
      message: `The enquiry from ${enquiry.name} will be permanently deleted. Use this for spam only. Otherwise mark it as Closed.`,
      confirmText: 'Delete',
      onConfirm: async () => {
        await deleteEnquiry(enquiry.id, enquiry.name);
        toast.success('Enquiry deleted.');
        onDeleted(enquiry.id);
        onClose();
      },
    });

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={enquiry.name}
      description={`Received ${formatDateTime(enquiry.createdAt)}`}
      footer={
        <>
          <Button variant="danger-ghost" icon={Trash2} onClick={remove} className="sm:mr-auto">
            Delete
          </Button>
          <Button variant="secondary" icon={UserPlus} onClick={convert}>
            Add as trainee
          </Button>
          <Button onClick={save} loading={busy} disabled={!dirty}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Button variant="secondary" icon={Phone} href={telLink(enquiry.phone)}>
            Call
          </Button>
          <Button variant="secondary" icon={MessageCircle} href={reminders.enquiry(enquiry)}>
            WhatsApp
          </Button>
          {enquiry.email && (
            <Button variant="secondary" icon={Mail} href={`mailto:${enquiry.email}`} className="col-span-2 sm:col-span-1">
              Email
            </Button>
          )}
        </div>
        <DetailList
          items={[
            { label: 'Phone', value: formatPhone(enquiry.phone) },
            { label: 'Email', value: enquiry.email },
            { label: 'Interested in', value: enquiry.interest },
            { label: 'Source', value: enquiry.source === 'website' ? 'Website form' : enquiry.source },
            { label: 'Message', value: enquiry.message, full: true },
          ]}
        />
        <div className="grid gap-4 border-t border-zinc-100 pt-5">
          <SelectField label="Status" options={FILTERS.slice(1)} value={status} onChange={(e) => setStatus(e.target.value)} />
          <TextArea label="Internal notes" optional placeholder="e.g. Called on Monday, visiting Saturday 7 am" maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} hint="Only visible to staff." />
        </div>
      </div>
    </Modal>
  );
}

export default function Enquiries() {
  useDocumentTitle('Enquiries');
  const [params, setParams] = useSearchParams();
  const status = FILTERS.some((f) => f.value === params.get('status')) ? params.get('status') : 'all';
  const { refreshBadges } = useSettings();
  const toast = useToast();
  const [open, setOpen] = useState(null);

  const fetchPage = useCallback(({ cursor }) => listEnquiries({ status, cursor, pageSize: 20 }), [status]);
  const list = usePagedList(fetchPage, [fetchPage]);

  const quickStatus = async (e, value) => {
    try {
      await updateEnquiry(e.id, { status: value });
      list.patch(e.id, { status: value });
      refreshBadges();
    } catch (err) {
      toast.error(friendlyError(err));
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (e) => (
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-semibold text-zinc-900">
            {e.status === 'new' && <span className="size-2 shrink-0 rounded-full bg-brand" aria-label="New" />}
            {e.name}
          </p>
          {e.message && <p className="max-w-xs truncate text-xs text-zinc-500">{e.message}</p>}
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', render: (e) => <span className="whitespace-nowrap">{formatPhone(e.phone)}</span> },
    { key: 'interest', header: 'Interest', render: (e) => e.interest || <span className="text-zinc-400">—</span> },
    { key: 'date', header: 'Date', render: (e) => <span className="whitespace-nowrap" title={formatDateTime(e.createdAt)}>{timeAgo(e.createdAt)}</span> },
    {
      key: 'status',
      header: 'Status',
      stopPropagation: true,
      render: (e) => (
        <select
          className="input !h-8 !w-36 !py-0 text-xs font-semibold"
          value={e.status}
          onChange={(ev) => quickStatus(e, ev.target.value)}
          aria-label={`Status for ${e.name}`}
        >
          {FILTERS.slice(1).map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Enquiries" description="Leads from the website enquiry form. Follow up fast. Every call counts." />
      <div className="card overflow-hidden">
        <div className="border-b border-zinc-100 p-4 sm:p-5">
          <Tabs variant="pill" tabs={FILTERS} value={status} onChange={(v) => setParams(v === 'all' ? {} : { status: v }, { replace: true })} />
        </div>
        {list.error ? (
          <ErrorState message={list.error} onRetry={list.reload} />
        ) : (
          <DataTable
            columns={columns}
            rows={list.items}
            loading={list.loading}
            onRowClick={setOpen}
            renderCard={(e) => (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-semibold text-zinc-900">
                    {e.status === 'new' && <span className="size-2 shrink-0 rounded-full bg-brand" />}
                    {e.name}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {formatPhone(e.phone)}
                    {e.interest && ` · ${e.interest}`}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">{timeAgo(e.createdAt)}</p>
                </div>
                <StatusBadge kind="enquiry" status={e.status} />
              </div>
            )}
            empty={
              <EmptyState
                icon={Inbox}
                title={status === 'all' ? 'No enquiries yet' : `No ${ENQUIRY_STATUS[status]?.label.toLowerCase()} enquiries`}
                description={status === 'all' ? 'When visitors submit the enquiry form on your website, they’ll appear here.' : undefined}
              />
            }
          />
        )}
        <Pagination page={list.page} hasPrev={list.hasPrev} hasNext={list.hasMore} onPrev={list.prev} onNext={list.next} loading={list.loading} />
      </div>
      <EnquiryDialog
        enquiry={open}
        open={Boolean(open)}
        onClose={() => setOpen(null)}
        onUpdated={(e) => {
          list.patch(e.id, e);
          refreshBadges();
        }}
        onDeleted={(id) => {
          list.remove(id);
          refreshBadges();
        }}
      />
    </>
  );
}
