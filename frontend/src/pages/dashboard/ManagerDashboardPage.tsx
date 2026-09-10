import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import { leaveApi } from '../../api/leaveApi';
import { useAppSelector } from '../../app/hooks';
import { useToast } from '../../components/Toast';
import { avatarGradient } from '../../utils/avatarColor';

export default function ManagerDashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['team-summary'],
    queryFn: dashboardApi.teamSummary,
  });

  const approveMutation = useMutation({
    mutationFn: leaveApi.approve,
    onSuccess: () => {
      showToast('Leave approved');
      queryClient.invalidateQueries({ queryKey: ['team-summary'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: leaveApi.reject,
    onSuccess: () => {
      showToast('Leave rejected');
      queryClient.invalidateQueries({ queryKey: ['team-summary'] });
    },
  });

  const statusStyles: Record<string, string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-700',
    ON_LEAVE: 'bg-amber-50 text-amber-700',
    TERMINATED: 'bg-red-50 text-red-700',
    RESIGNED: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="font-display text-2xl font-semibold text-slate-900">
        Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
      </h1>
      <p className="text-slate-500 mt-1">Here's how your team is doing today.</p>

      {isLoading ? (
        <p className="text-sm text-slate-400 mt-8">Loading team data...</p>
      ) : data?.teamSize === 0 ? (
        <div className="text-center py-16 bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-200/60 mt-8">
          <p className="text-slate-500">
            No employees are currently assigned to you as their manager.
          </p>
        </div>
      ) : (
        <>
          {/* Team stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-5"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Users size={16} />
              </div>
              <p className="font-display text-2xl font-semibold text-slate-800">{data?.teamSize}</p>
              <p className="text-xs text-slate-500 mt-0.5">Team Members</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="bg-white border border-slate-200 rounded-2xl p-5"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <CheckCircle2 size={16} />
              </div>
              <p className="font-display text-2xl font-semibold text-slate-800">{data?.todayAttendance.present}</p>
              <p className="text-xs text-slate-500 mt-0.5">Present Today</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="bg-white border border-slate-200 rounded-2xl p-5"
            >
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
                <XCircle size={16} />
              </div>
              <p className="font-display text-2xl font-semibold text-slate-800">{data?.todayAttendance.absent}</p>
              <p className="text-xs text-slate-500 mt-0.5">Absent Today</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="bg-white border border-slate-200 rounded-2xl p-5"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Clock size={16} />
              </div>
              <p className="font-display text-2xl font-semibold text-slate-800">{data?.pendingLeaves.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Pending Approvals</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            {/* Team members */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              className="bg-white border border-slate-200 rounded-2xl p-6"
            >
              <h2 className="font-display font-semibold text-slate-800 mb-4">Your Team</h2>
              <div className="space-y-2">
                {data?.team.map((m) => (
                  <div key={m.employee_id} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient(
                        m.first_name + m.last_name
                      )} flex items-center justify-center text-white text-xs font-semibold`}
                    >
                      {m.first_name[0]}
                      {m.last_name[0]}
                    </div>
                    <span className="text-sm text-slate-700 flex-1">
                      {m.first_name} {m.last_name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusStyles[m.employment_status]}`}>
                      {m.employment_status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pending leave approvals */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white border border-slate-200 rounded-2xl p-6"
            >
              <h2 className="font-display font-semibold text-slate-800 mb-4">Pending Leave Approvals</h2>
              {data?.pendingLeaves.length === 0 ? (
                <p className="text-sm text-slate-400">No pending requests from your team.</p>
              ) : (
                <div className="space-y-3">
                  {data?.pendingLeaves.map((l) => (
                    <div key={l.leave_request_id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{l.employee_name}</p>
                        <p className="text-xs text-slate-500">
                          {l.leave_type_name} · {new Date(l.start_date).toLocaleDateString()} →{' '}
                          {new Date(l.end_date).toLocaleDateString()} · {l.total_days}d
                        </p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => approveMutation.mutate(l.leave_request_id)}
                          className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg transition"
                          title="Approve"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <button
                          onClick={() => rejectMutation.mutate(l.leave_request_id)}
                          className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition"
                          title="Reject"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}