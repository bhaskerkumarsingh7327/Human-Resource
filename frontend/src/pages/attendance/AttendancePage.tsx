import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { attendanceApi } from '../../api/attendanceApi';
import { useToast } from '../../components/Toast';

const statusStyles: Record<string, string> = {
  PRESENT: 'bg-emerald-50 text-emerald-700',
  ABSENT: 'bg-red-50 text-red-700',
  HALF_DAY: 'bg-amber-50 text-amber-700',
  ON_LEAVE: 'bg-slate-100 text-slate-600',
};

export default function AttendancePage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const now = new Date();

  const { data: history, isLoading } = useQuery({
    queryKey: ['attendance-history', now.getMonth() + 1, now.getFullYear()],
    queryFn: () => attendanceApi.myHistory(now.getMonth() + 1, now.getFullYear()),
  });

  const today = useMemo(() => {
    const todayStr = now.toISOString().slice(0, 10);
    return history?.find((h) => h.attendance_date.slice(0, 10) === todayStr) ?? null;
  }, [history]);

  const checkInMutation = useMutation({
    mutationFn: attendanceApi.checkIn,
    onSuccess: () => {
      showToast('Checked in successfully');
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
    },
    onError: (err: any) =>
      showToast(err?.response?.data?.message ?? 'Could not check in', 'error'),
  });

  const checkOutMutation = useMutation({
    mutationFn: attendanceApi.checkOut,
    onSuccess: () => {
      showToast('Checked out successfully');
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
    },
    onError: (err: any) =>
      showToast(err?.response?.data?.message ?? 'Could not check out', 'error'),
  });

  const totalHoursThisMonth = (history ?? []).reduce((sum, h) => sum + Number(h.working_hours ?? 0), 0);
  const presentDays = (history ?? []).filter((h) => h.status === 'PRESENT').length;

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="font-display text-2xl font-semibold text-slate-900">Attendance</h1>
      <p className="text-slate-500 mt-1">Track your check-ins and view your monthly history.</p>

      {/* Check-in/out hero card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mt-6 bg-[#0B1120] rounded-3xl p-8 overflow-hidden text-white"
      >
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-600/25 rounded-full blur-[100px]" />

        <div className="relative flex items-center justify-between flex-wrap gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-sm mb-2">
              <Clock size={15} />
              {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>

            {today?.check_in_time && !today.check_out_time && (
              <p className="text-emerald-400 flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 size={16} />
                Checked in at {new Date(today.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
            {today?.check_out_time && (
              <p className="text-slate-300 text-sm">
                Checked out at {new Date(today.check_out_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ·{' '}
                <span className="text-white font-medium">{today.working_hours}h worked</span>
              </p>
            )}
            {!today && <p className="text-slate-400 text-sm">You haven't checked in today.</p>}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => checkInMutation.mutate()}
              disabled={!!today || checkInMutation.isPending}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5"
            >
              <LogIn size={16} />
              Check In
            </button>
            <button
              onClick={() => checkOutMutation.mutate()}
              disabled={!today?.check_in_time || !!today?.check_out_time || checkOutMutation.isPending}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-3 rounded-xl border border-white/10 transition-all hover:-translate-y-0.5"
            >
              <LogOut size={16} />
              Check Out
            </button>
          </div>
        </div>
      </motion.div>

      {/* Monthly summary */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-sm text-slate-500">Days Present</p>
          <p className="font-display text-2xl font-semibold text-slate-800 mt-1">{presentDays}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-sm text-slate-500">Total Hours (this month)</p>
          <p className="font-display text-2xl font-semibold text-slate-800 mt-1">{totalHoursThisMonth.toFixed(1)}h</p>
        </div>
      </div>

      {/* History table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mt-4">
        <h2 className="font-display font-semibold text-slate-800 mb-4">This Month's History</h2>
        {isLoading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : history?.length === 0 ? (
          <p className="text-sm text-slate-400">No attendance records yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Check In</th>
                <th className="pb-2 font-medium">Check Out</th>
                <th className="pb-2 font-medium">Hours</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {history?.map((h) => (
                <tr key={h.attendance_id} className="border-b border-slate-50 last:border-0">
                  <td className="py-3 text-slate-700">
                    {new Date(h.attendance_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-3 text-slate-500">
                    {h.check_in_time
                      ? new Date(h.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </td>
                  <td className="py-3 text-slate-500">
                    {h.check_out_time
                      ? new Date(h.check_out_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </td>
                  <td className="py-3 text-slate-500">{h.working_hours ?? '—'}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusStyles[h.status] ?? statusStyles.PRESENT}`}>
                      {h.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}