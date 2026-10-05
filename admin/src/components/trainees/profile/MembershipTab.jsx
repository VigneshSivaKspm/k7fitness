import { useState } from 'react';
import { Ban, CalendarClock, History, IndianRupee, Pencil } from 'lucide-react';
import { Card } from '../../ui/Layout';
import Button from '../../ui/Button';
import DropdownMenu from '../../ui/DropdownMenu';
import { StatusBadge } from '../../ui/Badge';
import { EmptyState, ErrorState, SkeletonRows } from '../../ui/Feedback';
import AdjustMembershipDialog from '../AdjustMembershipDialog';
import { useAsync } from '../../../hooks/useAsync';
import { cancelMembership, listTraineeMemberships } from '../../../services/membershipService';
import { useSettings } from '../../../context/SettingsContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { useToast } from '../../../context/ToastContext';
import { durationLabel, roundMoney } from '../../../utils/format';
import { formatDate } from '../../../utils/dates';
import { getMembershipRecordStatus } from '../../../utils/status';

export default function MembershipTab({ trainee, onRenew, onPayment, onChanged }) {
  const { money } = useSettings();
  const confirm = useConfirm();
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => listTraineeMemberships(trainee.id), [trainee.id, trainee.updatedAt?.toMillis?.()]);
  const [adjusting, setAdjusting] = useState(null);

  const cancel = (m) =>
    confirm({
      title: 'Cancel this membership?',
      message: (
        <>
          <p>
            <strong>{m.planName}</strong> ({formatDate(m.startDate)} – {formatDate(m.expiryDate)}) will be marked as cancelled.
          </p>
          {m.fee - m.paidAmount > 0 && <p className="mt-2">The unpaid balance of {money(m.fee - m.paidAmount)} will be waived.</p>}
          <p className="mt-2">Payments already received are kept on record.</p>
        </>
      ),
      confirmText: 'Cancel membership',
      onConfirm: async () => {
        await cancelMembership(m.id, 'Cancelled by admin');
        toast.success('Membership cancelled.');
        reload();
        onChanged();
      },
    });

  return (
    <Card
      title="Membership history"
      description="Every membership is kept, including renewals."
      bodyClassName=""
      actions={
        <Button size="sm" icon={CalendarClock} onClick={onRenew}>
          {trainee.currentMembershipId ? 'Renew' : 'Start membership'}
        </Button>
      }
    >
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !data ? (
        <SkeletonRows rows={3} />
      ) : !data?.length ? (
        <EmptyState icon={History} title="No memberships yet" description="Start a membership to begin tracking expiry and fees." />
      ) : (
        <ul className="divide-y divide-zinc-100">
          {data.map((m) => {
            const status = getMembershipRecordStatus(m);
            const due = roundMoney(m.fee - m.paidAmount);
            return (
              <li key={m.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-zinc-900">{m.planName}</p>
                    <StatusBadge kind="record" status={status} />
                    {m.type === 'renewal' && <span className="text-xs text-zinc-400">Renewal</span>}
                  </div>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    {formatDate(m.startDate)} – {formatDate(m.expiryDate)} · {durationLabel(m.duration, m.durationUnit)}
                  </p>
                  {m.notes && <p className="mt-1 text-xs text-zinc-500">{m.notes}</p>}
                  {m.status === 'cancelled' && m.originalFee !== undefined && (
                    <p className="mt-1 text-xs text-zinc-500">Original fee {money(m.originalFee)}; unpaid balance waived.</p>
                  )}
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="tabular text-right text-sm">
                    <p className="font-semibold text-zinc-900">{money(m.fee)}</p>
                    <p className={due > 0 ? 'text-red-600' : 'text-emerald-700'}>{due > 0 ? `${money(due)} due` : 'Paid'}</p>
                  </div>
                  <DropdownMenu
                    items={[
                      { label: 'Record payment', icon: IndianRupee, onClick: onPayment, hidden: due <= 0 },
                      { label: 'Adjust fee / dates', icon: Pencil, onClick: () => setAdjusting(m), hidden: m.status === 'cancelled' },
                      { label: 'Cancel membership', icon: Ban, tone: 'danger', onClick: () => cancel(m), hidden: m.status === 'cancelled' || status === 'completed' },
                    ]}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <AdjustMembershipDialog
        key={adjusting?.id || 'closed'}
        membership={adjusting}
        open={Boolean(adjusting)}
        onClose={() => setAdjusting(null)}
        onDone={() => {
          reload();
          onChanged();
        }}
      />
    </Card>
  );
}
