import { useParams } from 'react-router';
import PrintShell from '../../components/PrintShell';
import Badge from '../../components/ui/Badge';
import { ErrorState, PageLoader } from '../../components/ui/Feedback';
import { getPayment } from '../../services/paymentService';
import { useAsync, useDocumentTitle } from '../../hooks/useAsync';
import { useSettings } from '../../context/SettingsContext';
import { paymentMethodLabel } from '../../constants/options';
import { formatDate, formatDateTime } from '../../utils/dates';
import { formatPhone } from '../../utils/format';

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-6 py-2.5 text-sm">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-right font-medium text-zinc-900">{value || '—'}</dd>
    </div>
  );
}

export default function ReceiptPage() {
  const { paymentId } = useParams();
  const { money, settings } = useSettings();
  const { data: p, loading, error } = useAsync(() => getPayment(paymentId), [paymentId]);
  useDocumentTitle(p ? `Receipt ${p.receiptNo}` : 'Receipt');

  if (loading) return <PageLoader />;
  if (error || !p) return <ErrorState message={error || 'This receipt could not be found.'} />;

  return (
    <PrintShell title="Payment receipt" subtitle={`Receipt ${p.receiptNo}`} footer={settings.receiptFooter}>
      {p.status === 'void' && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <Badge tone="danger">VOID</Badge> This payment was voided{p.voidReason ? `: ${p.voidReason}` : ''}. It is not valid as proof of payment.
        </div>
      )}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Received from</p>
          <p className="mt-1 text-lg font-semibold text-zinc-900">{p.traineeName}</p>
          <p className="text-sm text-zinc-500">
            Member ID {p.memberId}
            {p.traineePhone && ` · ${formatPhone(p.traineePhone)}`}
          </p>
        </div>
        <div className="rounded-xl bg-zinc-50 px-5 py-3 text-left ring-1 ring-zinc-200 sm:text-right">
          <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Amount paid</p>
          <p className={`tabular text-3xl font-bold ${p.status === 'void' ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>{money(p.amount)}</p>
        </div>
      </div>

      <dl className="mt-6 divide-y divide-zinc-100 border-y border-zinc-100">
        <Row label="Receipt number" value={p.receiptNo} />
        <Row label="Payment date" value={formatDate(p.paymentDate)} />
        <Row label="Membership" value={p.planName} />
        <Row label="Payment method" value={paymentMethodLabel(p.method)} />
        {p.reference && <Row label="Reference" value={p.reference} />}
        {p.notes && <Row label="Notes" value={p.notes} />}
        <Row label="Received by" value={p.receivedByName} />
        <Row label="Recorded on" value={formatDateTime(p.createdAt)} />
      </dl>

      <div className="mt-10 flex justify-end">
        <div className="w-48 border-t border-zinc-300 pt-2 text-center text-xs text-zinc-500">Authorised signature</div>
      </div>
    </PrintShell>
  );
}
