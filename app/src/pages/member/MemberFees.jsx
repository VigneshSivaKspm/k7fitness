import { useEffect, useState } from 'react';
import { CheckCircle2, Download, FileText, IndianRupee, Receipt, TriangleAlert, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getTrainee } from '../../services/traineeService';
import { listTraineePayments } from '../../services/paymentService';
import { formatDate } from '../../utils/dates';
import { roundMoney } from '../../utils/format';

export default function MemberFees() {
  const { member } = useAuth();
  const [profile, setProfile] = useState(member);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReceipt, setActiveReceipt] = useState(null);

  useEffect(() => {
    if (!member?.id) return;
    let cancelled = false;

    async function loadFees() {
      try {
        const [fresh, payList] = await Promise.all([
          getTrainee(member.id),
          listTraineePayments(member.id),
        ]);
        if (!cancelled) {
          if (fresh) setProfile(fresh);
          if (payList) setPayments(payList);
        }
      } catch (err) {
        console.error('Failed to load member fees', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFees();
    return () => {
      cancelled = true;
    };
  }, [member?.id]);

  const p = profile || member;
  const totalFee = roundMoney(p.totalFee || 0);
  const totalPaid = roundMoney(p.totalPaid || 0);
  const pending = roundMoney(p.pendingAmount || 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-sm">
          <Receipt className="size-4.5 text-red-500" />
        </div>
        <div>
          <h1 className="text-base font-black text-zinc-950">Fees & Receipts</h1>
          <p className="text-[0.68rem] text-zinc-500">Billing history and official slips</p>
        </div>
      </div>

      {/* Financial Summary Card (Pitch Black with Red & Emerald Highlights) */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 text-white p-5 shadow-lg border border-zinc-900">
        <div className="pointer-events-none absolute -right-6 -bottom-6 size-28 rounded-full bg-red-600/15 blur-2xl" />
        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 block">
          Payment Overview
        </span>
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-zinc-800/80 pt-3 text-center">
          <div>
            <span className="text-[0.65rem] text-zinc-400 block font-bold uppercase">Billed</span>
            <span className="text-sm font-black text-white font-mono">₹{totalFee}</span>
          </div>
          <div>
            <span className="text-[0.65rem] text-zinc-400 block font-bold uppercase">Paid</span>
            <span className="text-sm font-black text-emerald-400 font-mono">₹{totalPaid}</span>
          </div>
          <div>
            <span className="text-[0.65rem] text-zinc-400 block font-bold uppercase">Pending</span>
            <span className={`text-sm font-black font-mono ${pending > 0 ? 'text-red-500' : 'text-zinc-400'}`}>
              ₹{pending}
            </span>
          </div>
        </div>
      </div>

      {/* Receipts List */}
      <div className="rounded-3xl border border-zinc-200/90 bg-white overflow-hidden shadow-sm shadow-zinc-200/40">
        <div className="border-b border-zinc-100 px-4 py-3 flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950">
            Payment Receipts
          </h2>
          <span className="text-[0.68rem] font-bold text-zinc-500">
            {payments.length} {payments.length === 1 ? 'slip' : 'slips'}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-400 font-medium">
            Loading receipt records…
          </div>
        ) : payments.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {payments.map((pay) => (
              <div
                key={pay.id}
                className="flex items-center justify-between p-3.5 hover:bg-zinc-50/80 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100 shrink-0">
                    <FileText className="size-4.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-zinc-900">
                        {pay.receiptNo}
                      </span>
                      <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[0.62rem] font-bold text-zinc-600 uppercase">
                        {pay.method || 'cash'}
                      </span>
                    </div>
                    <p className="text-[0.68rem] text-zinc-500 mt-0.5">
                      {formatDate(pay.paymentDate || pay.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black text-emerald-600 font-mono">
                    ₹{roundMoney(pay.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveReceipt(pay)}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[0.68rem] font-bold text-zinc-700 hover:bg-zinc-100 transition"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center px-4">
            <Receipt className="mx-auto size-9 text-zinc-300" />
            <p className="mt-2 text-xs font-bold text-zinc-800">No payment receipts found</p>
            <p className="text-[0.7rem] text-zinc-400 mt-0.5">
              Official receipts will appear here when you make fee payments.
            </p>
          </div>
        )}
      </div>

      {/* Modern Mobile Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in-50 duration-150">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-5 shadow-2xl text-zinc-900 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-zinc-950 text-white font-black text-xs">
                  K<span className="text-red-500">7</span>
                </div>
                <span className="font-extrabold text-xs text-zinc-950">K7 FITNESS GYM</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveReceipt(null)}
                className="size-7 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="text-center py-3">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 block">
                Official Payment Receipt
              </span>
              <p className="font-mono text-sm font-black text-red-600 mt-0.5">
                {activeReceipt.receiptNo}
              </p>
            </div>

            <div className="my-2 rounded-2xl bg-zinc-50 border border-zinc-100 p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Member:</span>
                <span className="font-bold text-zinc-900">{p.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Member ID:</span>
                <span className="font-mono font-bold text-zinc-800">{p.memberId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Date:</span>
                <span className="text-zinc-800">{formatDate(activeReceipt.paymentDate || activeReceipt.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Plan:</span>
                <span className="text-zinc-800 font-medium">{activeReceipt.planName || 'Gym Membership'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Payment Mode:</span>
                <span className="uppercase text-zinc-800 font-bold">{activeReceipt.method || 'Cash'}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-2 text-sm font-black">
                <span className="text-zinc-950">Amount Paid:</span>
                <span className="text-emerald-600 font-mono">₹{roundMoney(activeReceipt.amount)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveReceipt(null)}
              className="mt-3 w-full rounded-2xl bg-zinc-950 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-zinc-900 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
