import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, CalendarCheck, PlaneTakeoff, Wallet, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAppSelector } from '../../app/hooks';
import { dashboardApi } from '../../api/dashboardApi';
import { avatarGradient } from '../../utils/avatarColor';

const CHART_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4'];

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let raf: number;
    function step(ts: number) {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => dashboardApi.overview(),
  });

  const attendance = useCountUp(data?.attendancePercentage ?? 0);
  const totalEmployees = useCountUp(data?.totalEmployees ?? 0);
  const pendingLeaves = data?.leaveStats.reduce((sum, l) => sum + Number(l.pending), 0) ?? 0;
  const netPaid = Number(data?.payrollOverview.total_net_paid ?? 0);

  const pieData = (data?.departmentStats ?? []).map((d) => ({
    name: d.department_name,
    value: Number(d.employee_count),
  }));

  return (
    <div className="p-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-indigo-600 font-medium mb-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="font-display text-3xl font-semibold text-slate-900 tracking-tight">
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
        </h1>
      </motion.div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
        {/* Hero card — spans 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 relative bg-[#0B1120] rounded-3xl p-8 overflow-hidden text-white"
        >
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-600/30 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 left-1/3 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px]" />
          <div className="relative">
            <div className="flex items-center gap-2 text-indigo-300 text-sm mb-2">
              <Users size={15} />
              Total Workforce
            </div>
            <p className="font-display text-6xl font-semibold tabular-nums tracking-tight">
              {totalEmployees}
            </p>
            <p className="text-slate-400 text-sm mt-3">
              Across {data?.departmentStats.length ?? 0} departments · organization-wide
            </p>
          </div>
        </motion.div>

        {/* Attendance donut */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center relative"
        >
          <div className="relative w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ value: attendance }, { value: 100 - attendance }]}
                  innerRadius={48}
                  outerRadius={62}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#10B981" />
                  <Cell fill="#F1F5F9" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-2xl font-semibold text-slate-800">{attendance}%</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-3 text-center">Attendance this month</p>
        </motion.div>

        {/* Small stat cards */}
        <MiniStat icon={PlaneTakeoff} label="Pending Leaves" value={pendingLeaves} color="amber" delay={0.16} />
        <MiniStat icon={Wallet} label="Payroll Paid" value={netPaid} prefix="₹" color="emerald" delay={0.22} />
        <MiniStat icon={TrendingUp} label="Active Employees" value={data?.totalEmployees ?? 0} color="indigo" delay={0.28} />
      </div>

      {/* Department breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
          className="bg-white border border-slate-200 rounded-3xl p-6"
        >
          <h2 className="font-display font-semibold text-slate-800 mb-4">Department Distribution</h2>
          {isLoading || pieData.length === 0 ? (
            <p className="text-sm text-slate-400">No data yet.</p>
          ) : (
            <div className="flex items-center gap-6">
              <div className="w-36 h-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={40} outerRadius={68} dataKey="value" stroke="none">
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 flex-1">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <span className="text-slate-600">{d.name}</span>
                    </div>
                    <span className="text-slate-500 font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-slate-200 rounded-3xl p-6"
        >
          <h2 className="font-display font-semibold text-slate-800 mb-4">Leave Requests This Year</h2>
          {data?.leaveStats.length === 0 ? (
            <p className="text-sm text-slate-400">No leave data yet.</p>
          ) : (
            <div className="space-y-3">
              {data?.leaveStats.map((l) => (
                <div key={l.leave_type} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{l.leave_type}</span>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs">
                      {l.approved} approved
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs">
                      {l.pending} pending
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon, label, value, prefix = '', color, delay,
}: {
  icon: typeof Users; label: string; value: number; prefix?: string;
  color: 'amber' | 'emerald' | 'indigo'; delay: number;
}) {
  const animated = useCountUp(value);
  const colorMap = {
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  }[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -3 }}
      className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-lg hover:shadow-slate-200/60 transition-shadow"
    >
      <div className={`w-9 h-9 rounded-xl ${colorMap} flex items-center justify-center mb-3`}>
        <Icon size={16} strokeWidth={2} />
      </div>
      <p className="font-display text-2xl font-semibold text-slate-800 tabular-nums">
        {prefix}{animated.toLocaleString('en-IN')}
      </p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </motion.div>
  );
}