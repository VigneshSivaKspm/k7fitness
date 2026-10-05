import { useState } from 'react';
import { CalendarClock, Download, Receipt, Users } from 'lucide-react';
import { Card, PageHeader } from '../components/ui/Layout';
import Button from '../components/ui/Button';
import BarChart, { ShareBars } from '../components/ui/BarChart';
import { ErrorState, SkeletonRows } from '../components/ui/Feedback';
import { TextField } from '../components/ui/Field';
import { getDashboardStats, getMethodBreakdown, getMonthlyCollections, getMonthlyNewMembers } from '../services/reportService';
import { fetchAllTrainees, listByExpiry } from '../services/traineeService';
import { fetchPaymentsInRange } from '../services/paymentService';
import { useAsync, useDocumentTitle } from '../hooks/useAsync';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { PAYMENT_METHODS, paymentMethodLabel } from '../constants/options';
import { addDays, daysUntil, endOfDay, formatMonth, parseDateInput, startOfDay, startOfMonth, toDateInput, todayInput } from '../utils/dates';
import { formatNumber } from '../utils/format';
import { getMembershipStatus, getPaymentStatus } from '../utils/status';
import { downloadCsv } from '../utils/csv';
import { friendlyError } from '../utils/errors';

function ExportRow({ icon: Icon, title, description, children }) {
  return (
    <div className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-zinc-900">{title}</p>
        <p className="text-sm text-zinc-500">{description}</p>
      </div>
      <div className="flex flex-wrap items-end gap-2">{children}</div>
    </div>
  );
}

export default function Reports() {
  useDocumentTitle('Reports');
  const { money, settings } = useSettings();
  const toast = useToast();
  const [busy, setBusy] = useState('');
  const [from, setFrom] = useState(toDateInput(startOfMonth()));
  const [to, setTo] = useState(todayInput());

  const revenue = useAsync(() => getMonthlyCollections(12), []);
  const growth = useAsync(() => getMonthlyNewMembers(12), []);
  const stats = useAsync(() => getDashboardStats(settings.expiryAlertDays), [settings.expiryAlertDays]);
  const methods = useAsync(() => getMethodBreakdown(startOfMonth(), endOfDay(), PAYMENT_METHODS), []);

  const yearTotal = (revenue.data || []).reduce((s, d) => s + d.value, 0);
  const chart = (state) => (state.data || []).map((d) => ({ label: formatMonth(d.date), value: d.value }));

  const run = async (key, fn) => {
    setBusy(key);
    try {
      const n = await fn();
      toast.success(`Exported ${n} row${n === 1 ? '' : 's'}.`);
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy('');
    }
  };

  const exportTrainees = () =>
    run('trainees', async () => {
      const rows = await fetchAllTrainees();
      downloadCsv(`trainees-${todayInput()}.csv`, [
        { header: 'Member ID', value: (t) => t.memberId },
        { header: 'Name', value: (t) => t.fullName },
        { header: 'Phone', value: (t) => t.phone },
        { header: 'Email', value: (t) => t.email },
        { header: 'Gender', value: (t) => t.gender },
        { header: 'Joined', value: (t) => toDateInput(t.joiningDate) },
        { header: 'Plan', value: (t) => t.currentPlanName },
        { header: 'Start', value: (t) => toDateInput(t.membershipStart) },
        { header: 'Expiry', value: (t) => toDateInput(t.membershipExpiry) },
        { header: 'Membership status', value: (t) => getMembershipStatus(t, settings.expiryAlertDays) },
        { header: 'Total fee', value: (t) => t.totalFee },
        { header: 'Paid', value: (t) => t.totalPaid },
        { header: 'Pending', value: (t) => t.pendingAmount },
        { header: 'Payment status', value: (t) => getPaymentStatus(t) },
        { header: 'Workout plan', value: (t) => t.workoutPlanName },
        { header: 'Diet plan', value: (t) => t.dietPlanName },
      ], rows);
      return rows.length;
    });

  const exportPayments = () =>
    run('payments', async () => {
      const f = parseDateInput(from);
      const t = parseDateInput(to);
      if (!f || !t || t < f) throw Object.assign(new Error('Choose a valid date range.'), { userFacing: true });
      const rows = await fetchPaymentsInRange(startOfDay(f), endOfDay(t));
      downloadCsv(`payments-${from}-to-${to}.csv`, [
        { header: 'Receipt No', value: (p) => p.receiptNo },
        { header: 'Date', value: (p) => toDateInput(p.paymentDate) },
        { header: 'Member ID', value: (p) => p.memberId },
        { header: 'Member', value: (p) => p.traineeName },
        { header: 'Membership', value: (p) => p.planName },
        { header: 'Amount', value: (p) => p.amount },
        { header: 'Method', value: (p) => paymentMethodLabel(p.method) },
        { header: 'Reference', value: (p) => p.reference },
        { header: 'Status', value: (p) => p.status },
        { header: 'Received By', value: (p) => p.receivedByName },
      ], rows);
      return rows.length;
    });

  const exportRenewals = () =>
    run('renewals', async () => {
      const [upcoming, expired] = await Promise.all([
        listByExpiry({ from: startOfDay(), to: endOfDay(addDays(new Date(), 30)), max: 1000 }),
        listByExpiry({ from: null, to: new Date(startOfDay().getTime() - 1), max: 1000 }),
      ]);
      const rows = [...expired.items, ...upcoming.items];
      downloadCsv(`renewals-${todayInput()}.csv`, [
        { header: 'Member ID', value: (t) => t.memberId },
        { header: 'Name', value: (t) => t.fullName },
        { header: 'Phone', value: (t) => t.phone },
        { header: 'Plan', value: (t) => t.currentPlanName },
        { header: 'Expiry', value: (t) => toDateInput(t.membershipExpiry) },
        { header: 'Days remaining', value: (t) => daysUntil(t.membershipExpiry) },
        { header: 'Outstanding', value: (t) => t.pendingAmount || 0 },
      ], rows);
      return rows.length;
    });

  return (
    <div className="space-y-5">
      <PageHeader title="Reports" description="Revenue, growth and exports for your records or accountant." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Revenue (12 months)', value: revenue.loading ? '…' : money(yearTotal) },
          { label: 'Active memberships', value: stats.loading ? '…' : formatNumber(stats.data?.activeMembers) },
          { label: 'Expired memberships', value: stats.loading ? '…' : formatNumber(stats.data?.expired) },
          { label: 'Pending fees', value: stats.loading ? '…' : money(stats.data?.outstanding) },
        ].map((k) => (
          <div key={k.label} className="card p-4 sm:p-5">
            <p className="text-[0.8rem] font-medium text-zinc-500">{k.label}</p>
            <p className="tabular mt-1 text-xl font-bold text-zinc-900 sm:text-2xl">{k.value}</p>
          </div>
        ))}
      </div>

      <Card title="Monthly revenue" description="Valid payments by payment date, last 12 months">
        {revenue.error ? <ErrorState message={revenue.error} onRetry={revenue.reload} /> : revenue.loading ? <SkeletonRows rows={3} /> : <BarChart data={chart(revenue)} format={money} height={200} />}
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
        <Card title="New members by month" description="Based on joining date">
          {growth.error ? <ErrorState message={growth.error} onRetry={growth.reload} /> : growth.loading ? <SkeletonRows rows={3} /> : <BarChart data={chart(growth)} format={formatNumber} />}
        </Card>
        <Card title="This month by payment method">
          {methods.error ? (
            <ErrorState message={methods.error} onRetry={methods.reload} />
          ) : methods.loading ? (
            <SkeletonRows rows={3} />
          ) : !methods.data?.some((m) => m.value > 0) ? (
            <p className="py-8 text-center text-sm text-zinc-500">No payments this month yet.</p>
          ) : (
            <ShareBars data={methods.data.filter((m) => m.value > 0)} format={money} />
          )}
        </Card>
      </div>

      <Card title="Export data" description="Download CSV files that open in Excel or Google Sheets. Useful for backups.">
        <div className="divide-y divide-zinc-100">
          <ExportRow icon={Users} title="All trainees" description="Profile, membership and fee summary for every member.">
            <Button variant="secondary" icon={Download} onClick={exportTrainees} loading={busy === 'trainees'} disabled={Boolean(busy)}>
              Export trainees
            </Button>
          </ExportRow>
          <ExportRow icon={Receipt} title="Payments" description="Every payment in the selected date range, including voided ones.">
            <TextField label="From" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="w-40" />
            <TextField label="To" type="date" value={to} min={from} max={todayInput()} onChange={(e) => setTo(e.target.value)} className="w-40" />
            <Button variant="secondary" icon={Download} onClick={exportPayments} loading={busy === 'payments'} disabled={Boolean(busy)}>
              Export
            </Button>
          </ExportRow>
          <ExportRow icon={CalendarClock} title="Renewals" description="Expired memberships plus those expiring in the next 30 days.">
            <Button variant="secondary" icon={Download} onClick={exportRenewals} loading={busy === 'renewals'} disabled={Boolean(busy)}>
              Export renewals
            </Button>
          </ExportRow>
        </div>
      </Card>
    </div>
  );
}
