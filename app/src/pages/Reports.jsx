import { useState } from 'react';
import { CalendarClock, Download, FileSpreadsheet, Receipt, Sparkles, UserCheck, Users } from 'lucide-react';
import { Card, PageHeader } from '../components/ui/Layout';
import Button from '../components/ui/Button';
import BarChart, { ShareBars } from '../components/ui/BarChart';
import { ErrorState, SkeletonRows } from '../components/ui/Feedback';
import { TextField } from '../components/ui/Field';
import { getDashboardStats, getMethodBreakdown, getMonthlyCollections, getMonthlyNewMembers } from '../services/reportService';
import { fetchAllTrainees, listByExpiry } from '../services/traineeService';
import { fetchPaymentsInRange } from '../services/paymentService';
import { listAllRecentAttendance } from '../services/attendanceService';
import { useAsync, useDocumentTitle } from '../hooks/useAsync';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { PAYMENT_METHODS, paymentMethodLabel } from '../constants/options';
import { addDays, daysUntil, endOfDay, formatMonth, formatTime, parseDateInput, startOfDay, startOfMonth, toDateInput, todayInput } from '../utils/dates';
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
  useDocumentTitle('Reports & Excel Exports');
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
      toast.success(`Exported ${n} row${n === 1 ? '' : 's'} to Excel CSV.`);
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy('');
    }
  };

  const exportTrainees = () =>
    run('trainees', async () => {
      const rows = await fetchAllTrainees();
      await downloadCsv(`K7_Fitness_Members_${todayInput()}.csv`, [
        { header: 'Member ID', value: (t) => t.memberId },
        { header: 'Name', value: (t) => t.fullName },
        { header: 'Phone', value: (t) => t.phone },
        { header: 'Email', value: (t) => t.email || '' },
        { header: 'Gender', value: (t) => t.gender || '' },
        { header: 'Age', value: (t) => t.age || '' },
        { header: 'Height (cm)', value: (t) => t.height || '' },
        { header: 'Weight (kg)', value: (t) => t.weight || '' },
        { header: 'Body Type', value: (t) => t.bodyType || '' },
        { header: 'Fitness Goal', value: (t) => t.goal || '' },
        { header: 'Program Type', value: (t) => t.planType === 'personal_training' ? 'Personal Training (PT)' : 'General Training (GT)' },
        { header: 'Assigned Trainer', value: (t) => t.assignedTrainerName || 'None' },
        { header: 'Plan', value: (t) => t.currentPlanName || '' },
        { header: 'Joined', value: (t) => toDateInput(t.joiningDate) },
        { header: 'Start', value: (t) => toDateInput(t.membershipStart) },
        { header: 'Expiry', value: (t) => toDateInput(t.membershipExpiry) },
        { header: 'Membership status', value: (t) => getMembershipStatus(t, settings.expiryAlertDays) },
        { header: 'Total fee (₹)', value: (t) => t.totalFee || 0 },
        { header: 'Paid (₹)', value: (t) => t.totalPaid || 0 },
        { header: 'Pending (₹)', value: (t) => t.pendingAmount || 0 },
        { header: 'Payment status', value: (t) => getPaymentStatus(t) },
        { header: 'Attendance Count', value: (t) => t.attendanceCount || 0 },
        { header: 'Workout plan', value: (t) => t.workoutPlanName || 'None' },
        { header: 'Diet plan', value: (t) => t.dietPlanName || 'None' },
        { header: 'Blood Group', value: (t) => t.bloodGroup || '' },
        { header: 'Address', value: (t) => t.address || '' },
        { header: 'Emergency Phone', value: (t) => t.emergencyPhone || '' },
      ], rows);
      return rows.length;
    });

  const exportPayments = () =>
    run('payments', async () => {
      const f = parseDateInput(from);
      const t = parseDateInput(to);
      if (!f || !t || t < f) throw Object.assign(new Error('Choose a valid date range.'), { userFacing: true });
      const rows = await fetchPaymentsInRange(startOfDay(f), endOfDay(t));
      await downloadCsv(`K7_Fitness_Payments_${from}_to_${to}.csv`, [
        { header: 'Receipt No', value: (p) => p.receiptNo },
        { header: 'Date', value: (p) => toDateInput(p.paymentDate) },
        { header: 'Member ID', value: (p) => p.memberId },
        { header: 'Member Name', value: (p) => p.traineeName },
        { header: 'Membership Plan', value: (p) => p.planName },
        { header: 'Amount (₹)', value: (p) => p.amount },
        { header: 'Payment Method', value: (p) => paymentMethodLabel(p.method) },
        { header: 'Reference / UTR', value: (p) => p.reference || '' },
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
      await downloadCsv(`K7_Fitness_Renewals_${todayInput()}.csv`, [
        { header: 'Member ID', value: (t) => t.memberId },
        { header: 'Name', value: (t) => t.fullName },
        { header: 'Phone', value: (t) => t.phone },
        { header: 'Program', value: (t) => t.planType === 'personal_training' ? 'Personal Training' : 'General Training' },
        { header: 'Assigned Trainer', value: (t) => t.assignedTrainerName || 'None' },
        { header: 'Plan', value: (t) => t.currentPlanName },
        { header: 'Expiry Date', value: (t) => toDateInput(t.membershipExpiry) },
        { header: 'Days remaining', value: (t) => daysUntil(t.membershipExpiry) },
        { header: 'Outstanding Fee (₹)', value: (t) => t.pendingAmount || 0 },
        { header: 'Membership Status', value: (t) => getMembershipStatus(t, settings.expiryAlertDays) },
      ], rows);
      return rows.length;
    });

  const exportAttendance = () =>
    run('attendance', async () => {
      const rows = await listAllRecentAttendance(1500);
      await downloadCsv(`K7_Fitness_Attendance_${todayInput()}.csv`, [
        { header: 'Date', value: (a) => a.date },
        { header: 'Member ID', value: (a) => a.memberId },
        { header: 'Member Name', value: (a) => a.traineeName },
        { header: 'Status', value: (a) => a.status === 'checked_out' ? 'Checked Out' : 'Checked In' },
        { header: 'Check In Time', value: (a) => a.checkInTime ? formatTime(a.checkInTime) : '' },
        { header: 'Check Out Time', value: (a) => a.checkOutTime ? formatTime(a.checkOutTime) : '' },
        { header: 'Duration (Minutes)', value: (a) => a.durationMinutes || '' },
        { header: 'Marked By', value: (a) => a.markedByName || a.markedBy || 'Staff' },
      ], rows);
      return rows.length;
    });

  const exportMasterAll = () =>
    run('master', async () => {
      // 1. Members
      const members = await fetchAllTrainees();
      await downloadCsv(`K7_Fitness_Master_Members_${todayInput()}.csv`, [
        { header: 'Member ID', value: (t) => t.memberId },
        { header: 'Name', value: (t) => t.fullName },
        { header: 'Phone', value: (t) => t.phone },
        { header: 'Email', value: (t) => t.email || '' },
        { header: 'Gender', value: (t) => t.gender || '' },
        { header: 'Age', value: (t) => t.age || '' },
        { header: 'Height (cm)', value: (t) => t.height || '' },
        { header: 'Weight (kg)', value: (t) => t.weight || '' },
        { header: 'Body Type', value: (t) => t.bodyType || '' },
        { header: 'Fitness Goal', value: (t) => t.goal || '' },
        { header: 'Program Type', value: (t) => t.planType === 'personal_training' ? 'Personal Training (PT)' : 'General Training (GT)' },
        { header: 'Assigned Trainer', value: (t) => t.assignedTrainerName || 'None' },
        { header: 'Plan', value: (t) => t.currentPlanName || '' },
        { header: 'Joined', value: (t) => toDateInput(t.joiningDate) },
        { header: 'Start', value: (t) => toDateInput(t.membershipStart) },
        { header: 'Expiry', value: (t) => toDateInput(t.membershipExpiry) },
        { header: 'Status', value: (t) => getMembershipStatus(t, settings.expiryAlertDays) },
        { header: 'Total Fee (₹)', value: (t) => t.totalFee || 0 },
        { header: 'Paid (₹)', value: (t) => t.totalPaid || 0 },
        { header: 'Pending (₹)', value: (t) => t.pendingAmount || 0 },
        { header: 'Payment Status', value: (t) => getPaymentStatus(t) },
        { header: 'Attendance Count', value: (t) => t.attendanceCount || 0 },
        { header: 'Workout Plan', value: (t) => t.workoutPlanName || 'None' },
        { header: 'Diet Plan', value: (t) => t.dietPlanName || 'None' },
        { header: 'Blood Group', value: (t) => t.bloodGroup || '' },
        { header: 'Address', value: (t) => t.address || '' },
        { header: 'Emergency Contact', value: (t) => t.emergencyPhone || '' },
      ], members);

      // 2. Payments (last 60 days default)
      const payments = await fetchPaymentsInRange(startOfDay(addDays(new Date(), -60)), endOfDay(new Date()));
      await downloadCsv(`K7_Fitness_Master_Payments_${todayInput()}.csv`, [
        { header: 'Receipt No', value: (p) => p.receiptNo },
        { header: 'Date', value: (p) => toDateInput(p.paymentDate) },
        { header: 'Member ID', value: (p) => p.memberId },
        { header: 'Member Name', value: (p) => p.traineeName },
        { header: 'Membership Plan', value: (p) => p.planName },
        { header: 'Amount (₹)', value: (p) => p.amount },
        { header: 'Payment Method', value: (p) => paymentMethodLabel(p.method) },
        { header: 'Reference / UTR', value: (p) => p.reference || '' },
        { header: 'Status', value: (p) => p.status },
        { header: 'Received By', value: (p) => p.receivedByName },
      ], payments);

      // 3. Renewals
      const [upcoming, expired] = await Promise.all([
        listByExpiry({ from: startOfDay(), to: endOfDay(addDays(new Date(), 30)), max: 1000 }),
        listByExpiry({ from: null, to: new Date(startOfDay().getTime() - 1), max: 1000 }),
      ]);
      const renewals = [...expired.items, ...upcoming.items];
      await downloadCsv(`K7_Fitness_Master_Renewals_${todayInput()}.csv`, [
        { header: 'Member ID', value: (t) => t.memberId },
        { header: 'Name', value: (t) => t.fullName },
        { header: 'Phone', value: (t) => t.phone },
        { header: 'Program', value: (t) => t.planType === 'personal_training' ? 'Personal Training' : 'General Training' },
        { header: 'Assigned Trainer', value: (t) => t.assignedTrainerName || 'None' },
        { header: 'Plan', value: (t) => t.currentPlanName },
        { header: 'Expiry Date', value: (t) => toDateInput(t.membershipExpiry) },
        { header: 'Days remaining', value: (t) => daysUntil(t.membershipExpiry) },
        { header: 'Outstanding Fee (₹)', value: (t) => t.pendingAmount || 0 },
      ], renewals);

      return members.length + payments.length + renewals.length;
    });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports & Excel Exports"
        description="Revenue, growth metrics, and comprehensive Excel sheets download for gym management and records."
        actions={
          <Button
            variant="primary"
            icon={FileSpreadsheet}
            onClick={exportMasterAll}
            loading={busy === 'master'}
            disabled={Boolean(busy)}
            className="shadow-sm shadow-brand/20"
          >
            Export All to Excel
          </Button>
        }
      />

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

      <Card
        title="Excel Sheets & Data Exports"
        description="Download ready-to-open Excel sheets (.csv with UTF-8 BOM encoding for ₹ and Indian names) for your accountants or offline backup."
      >
        {/* Master One-Click Banner */}
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-brand/20 bg-brand/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-sm shadow-brand/20">
              <FileSpreadsheet className="size-6" />
            </span>
            <div>
              <p className="font-bold text-zinc-900">Master Gym Export (1-Click)</p>
              <p className="text-xs text-zinc-600">
                Downloads full Excel sheets for All Members (GT/PT & Trainers), Payments, and Renewals Schedule simultaneously.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            icon={Download}
            onClick={exportMasterAll}
            loading={busy === 'master'}
            disabled={Boolean(busy)}
            className="shrink-0"
          >
            Download All Excel Sheets
          </Button>
        </div>

        <div className="divide-y divide-zinc-100">
          <ExportRow
            icon={Users}
            title="All members (Full Details)"
            description="Complete profile: General Training vs Personal Training, Assigned Trainer, body measurements (height/weight/body type), fees, and validity."
          >
            <Button variant="secondary" icon={Download} onClick={exportTrainees} loading={busy === 'trainees'} disabled={Boolean(busy)}>
              Export members
            </Button>
          </ExportRow>

          <ExportRow
            icon={Receipt}
            title="Payments ledger"
            description="Every payment in the selected date range with receipt numbers, mode of payment, and staff receiver."
          >
            <TextField label="From" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="w-40" />
            <TextField label="To" type="date" value={to} min={from} max={todayInput()} onChange={(e) => setTo(e.target.value)} className="w-40" />
            <Button variant="secondary" icon={Download} onClick={exportPayments} loading={busy === 'payments'} disabled={Boolean(busy)}>
              Export payments
            </Button>
          </ExportRow>

          <ExportRow
            icon={CalendarClock}
            title="Renewals & fee dues"
            description="Expired memberships plus upcoming expirations in the next 30 days with outstanding amounts."
          >
            <Button variant="secondary" icon={Download} onClick={exportRenewals} loading={busy === 'renewals'} disabled={Boolean(busy)}>
              Export renewals
            </Button>
          </ExportRow>

          <ExportRow
            icon={UserCheck}
            title="Daily attendance log"
            description="Recent member check-in and check-out records, attendance times, and session durations."
          >
            <Button variant="secondary" icon={Download} onClick={exportAttendance} loading={busy === 'attendance'} disabled={Boolean(busy)}>
              Export attendance
            </Button>
          </ExportRow>
        </div>
      </Card>
    </div>
  );
}
