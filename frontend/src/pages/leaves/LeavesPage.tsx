import { useState, type  FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plane, CheckCircle2, XCircle, Clock3 } from 'lucide-react';
import { leaveApi } from '../../api/leaveApi';
import { useToast } from '../../components/Toast';
import { useAppSelector } from '../../app/hooks';

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  APPROVED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50 text-red-700',
  CANCELLED: 'bg-slate-100 text-slate-600',
};

export default function LeavesPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);
  const canApprove = user && ['ADMIN', 'HR', 'MANAGER'].includes(user.role);

  const [tab, setTab] = useState<'my' | 'approvals'>('my');
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });

  const { data: leaveTypes } = useQuery({ queryKey: ['leave-types'], queryFn: leaveApi.listTypes });
  const { data: myRequests, isLoading: myLoading } = useQuery({
    queryKey: ['my-leaves'],
    queryFn: leaveApi.myRequests,
  });
  const { data: balance } = useQuery({ queryKey: ['leave-balance'], queryFn: leaveApi.myBalance });

  const { data: pendingRequests, isLoading: pendingLoading } = useQuery({
    queryKey: ['pending-leaves'],
    queryFn: () => leaveApi.listAll('PENDING'),
    enabled: !!canApprove && tab === 'approvals',
  });

  const applyMutation = useMutation({
    mutationFn: leaveApi.apply,
    onSuccess: () => {
      showToast('Leave request submitted');
      queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balance'] });
      setShowApply(false);
      setForm({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
    },
    onError: (err: any) => showToast(err?.response?.data?.message ?? 'Could not submit request', 'error'),
  });

  const approveMutation = useMutation({
    mutationFn: leaveApi.approve,
    onSuccess: () => {
      showToast('Leave approved');
      queryClient.invalidateQueries({ queryKey: ['pending-leaves'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: leaveApi.reject,
    onSuccess: () => {
      showToast('Leave rejected');
      queryClient.invalidateQueries({ queryKey: ['pending-leaves'] });
    },
  });

  function handleApply(e: FormEvent) {
    e.preventDefault();
    applyMutation.mutate({
      leaveTypeId: Number(form.leaveTypeId),
      startDate: form.startDate,
      endDate: form.endDate,
      reason: form.reason || undefined,
    });
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Leaves</h1>
          <p className="text-slate-500 mt-1">Apply for time off and track your requests.</p>
        </div>
        <button
          onClick={() => setShowApply(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all"
        >
          <Plane size={15} />
          Apply for Leave
        </button>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {balance?.map((b) => {
          const remaining = Number(b.allocated_days) - Number(b.used_days);
          return (
            <div key={b.leave_type_id} className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="text-xs text-slate-500">{b.leave_type_name}</p>
              <p className="font-display text-xl font-semibold text-slate-800 mt-1">
                {remaining} <span className="text-sm font-normal text-slate-400">/ {b.allocated_days} days</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      {canApprove && (
        <div className="flex gap-1 mt-6 bg-slate-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setTab('my')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              tab === 'my' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
            }`}
          >
            My Requests
          </button>
          <button
            onClick={() => setTab('approvals')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              tab === 'approvals' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
            }`}
          >
            Approvals
          </button>
        </div>
      )}

      {/* My Requests */}
      {tab === 'my' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mt-4">
          {myLoading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : myRequests?.length === 0 ? (
            <p className="text-sm text-slate-400">No leave requests yet.</p>
          ) : (
            <div className="space-y-3">
              {myRequests?.map((r) => (
                <motion.div
                  key={r.leave_request_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700">{r.leave_type_name}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(r.start_date).toLocaleDateString()} → {new Date(r.end_date).toLocaleDateString()} ·{' '}
                      {r.total_days} day(s)
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusStyles[r.status]}`}>
                    {r.status}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approvals */}
      {tab === 'approvals' && canApprove && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mt-4">
          {pendingLoading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : pendingRequests?.requests.length === 0 ? (
            <p className="text-sm text-slate-400">No pending requests.</p>
          ) : (
            <div className="space-y-3">
              {pendingRequests?.requests.map((r) => (
                <motion.div
                  key={r.leave_request_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700">{r.employee_name}</p>
                    <p className="text-xs text-slate-500">
                      {r.leave_type_name} · {new Date(r.start_date).toLocaleDateString()} →{' '}
                      {new Date(r.end_date).toLocaleDateString()} · {r.total_days} day(s)
                    </p>
                    {r.reason && <p className="text-xs text-slate-400 mt-0.5">"{r.reason}"</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => approveMutation.mutate(r.leave_request_id)}
                      className="flex items-center gap-1.5 text-emerald-600 hover:bg-emerald-50 text-xs font-medium px-3 py-1.5 rounded-lg transition"
                    >
                      <CheckCircle2 size={14} />
                      Approve
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate(r.leave_request_id)}
                      className="flex items-center gap-1.5 text-red-600 hover:bg-red-50 text-xs font-medium px-3 py-1.5 rounded-lg transition"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Apply modal */}
      {showApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowApply(false)} />
          <form
            onSubmit={handleApply}
            className="relative z-10 w-full max-w-sm bg-white/90 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-2xl p-6"
          >
            <h2 className="font-display text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Clock3 size={18} className="text-indigo-500" />
              Apply for Leave
            </h2>

            <label className="block text-xs font-medium text-slate-600 mb-1">Leave type</label>
            <select
              required
              value={form.leaveTypeId}
              onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}
              className="w-full bg-white/70 border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            >
              <option value="">Select...</option>
              {leaveTypes?.map((t) => (
                <option key={t.leave_type_id} value={t.leave_type_id}>
                  {t.name}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Start date</label>
                <input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full bg-white/70 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">End date</label>
                <input
                  type="date"
                  required
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full bg-white/70 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                />
              </div>
            </div>

            <label className="block text-xs font-medium text-slate-600 mb-1">Reason (optional)</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={2}
              className="w-full bg-white/70 border border-slate-200 rounded-lg px-3 py-2 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowApply(false)}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={applyMutation.isPending}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium hover:shadow-lg disabled:opacity-50"
              >
                {applyMutation.isPending ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}