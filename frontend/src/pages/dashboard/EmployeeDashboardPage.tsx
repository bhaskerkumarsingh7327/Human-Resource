import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, PlaneTakeoff, Wallet, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { attendanceApi } from '../../api/attendanceApi';
import { leaveApi } from '../../api/leaveApi';
import { payrollApi } from '../../api/payrollApi';
import { useAppSelector } from '../../app/hooks';

export default function EmployeeDashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  const now = new Date();

  const { data: history } = useQuery({
    queryKey: ['attendance-history', now.getMonth() + 1, now.getFullYear()],
    queryFn: () => attendanceApi.myHistory(now.getMonth() + 1, now.getFullYear()),
  });
  const { data: balance } = useQuery({ queryKey: ['leave-balance'], queryFn: leaveApi.myBalance });
  const { data: payslips } = useQuery({ queryKey: ['my-payslips'], queryFn: payrollApi.myPayslips });

  const todayStr = now.toISOString().slice(0, 10);
  const today = history?.find((h) => h.attendance_date.slice(0, 10) === todayStr);
  const totalRemaining = balance?.reduce((sum, b) => sum + (Number(b.allocated_days) - Number(b.used_days)), 0) ?? 0;
  const latestPayslip = payslips?.[0];

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="font-display text-2xl font-semibold text-slate-900">
        Hi{user?.email ? `, ${user.email.split('@')[0]}` : ''} 👋
      </h1>
      <p className="text-slate-500 mt-1">Here's your quick overview for today.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        {/* Attendance card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-5"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Clock size={16} />
          </div>
          <p className="text-sm text-slate-500 mb-1">Today's Status</p>
          <p className="font-display text-lg font-semibold text-slate-800">
            {today?.check_out_time ? 'Checked out' : today?.check_in_time ? 'Checked in' : 'Not checked in'}
          </p>
          <Link
            to="/attendance"
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-3"
          >
            Go to Attendance <ArrowRight size={12} />
          </Link>
        </motion.div>

        {/* Leave balance card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white border border-slate-200 rounded-2xl p-5"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <PlaneTakeoff size={16} />
          </div>
          <p className="text-sm text-slate-500 mb-1">Leave Balance</p>
          <p className="font-display text-lg font-semibold text-slate-800">{totalRemaining} days left</p>
          <Link
            to="/leaves"
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-3"
          >
            Apply for Leave <ArrowRight size={12} />
          </Link>
        </motion.div>

        {/* Payslip card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="bg-white border border-slate-200 rounded-2xl p-5"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Wallet size={16} />
          </div>
          <p className="text-sm text-slate-500 mb-1">Latest Payslip</p>
          <p className="font-display text-lg font-semibold text-slate-800">
            {latestPayslip ? `₹${Number(latestPayslip.net_salary).toLocaleString('en-IN')}` : '—'}
          </p>
          <Link
            to="/payroll"
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-3"
          >
            View Payslips <ArrowRight size={12} />
          </Link>
        </motion.div>
      </div>

      {/* Leave balance breakdown */}
      {balance && balance.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="bg-white border border-slate-200 rounded-2xl p-6 mt-4"
        >
          <h2 className="font-display font-semibold text-slate-800 mb-4">Your Leave Balances</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {balance.map((b) => {
              const remaining = Number(b.allocated_days) - Number(b.used_days);
              const pct = (remaining / Number(b.allocated_days)) * 100;
              return (
                <div key={b.leave_type_id}>
                  <p className="text-xs text-slate-500 mb-1.5">{b.leave_type_name}</p>
                  <p className="text-sm font-medium text-slate-700 mb-1.5">
                    {remaining} / {b.allocated_days}
                  </p>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}