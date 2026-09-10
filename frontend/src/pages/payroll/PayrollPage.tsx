import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Wallet, Play, CheckCircle2 } from 'lucide-react';
import { payrollApi } from '../../api/payrollApi';
import { employeeApi } from '../../api/employeeApi';
import { useToast } from '../../components/Toast';
import { useAppSelector } from '../../app/hooks';

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  GENERATED: 'bg-amber-50 text-amber-700',
  PAID: 'bg-emerald-50 text-emerald-700',
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function PayrollPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);
  const isAdminOrHR = user && ['ADMIN', 'HR'].includes(user.role);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [salaryForm, setSalaryForm] = useState({
    employeeId: '', basicSalary: '', hra: '', otherAllowances: '',
    effectiveFrom: now.toISOString().slice(0, 10),
  });

  const { data: employees } = useQuery({ queryKey: ['employees-simple'], queryFn: employeeApi.listSimple });

  const { data: payrollData, isLoading: payrollLoading } = useQuery({
    queryKey: ['payroll-list', month, year],
    queryFn: () => payrollApi.list({ month, year }),
    enabled: !!isAdminOrHR,
  });

  const { data: myPayslips, isLoading: myLoading } = useQuery({
    queryKey: ['my-payslips'],
    queryFn: payrollApi.myPayslips,
    enabled: !isAdminOrHR,
  });

  const setSalaryMutation = useMutation({
    mutationFn: () =>
      payrollApi.setSalary(Number(salaryForm.employeeId), {
        basicSalary: Number(salaryForm.basicSalary),
        hra: Number(salaryForm.hra || 0),
        otherAllowances: Number(salaryForm.otherAllowances || 0),
        effectiveFrom: salaryForm.effectiveFrom,
      }),
    onSuccess: () => {
      showToast('Salary structure saved');
      setShowSalaryModal(false);
      setSalaryForm({ employeeId: '', basicSalary: '', hra: '', otherAllowances: '', effectiveFrom: now.toISOString().slice(0, 10) });
    },
    onError: () => showToast('Could not save salary structure', 'error'),
  });

  const generateMutation = useMutation({
    mutationFn: () => payrollApi.generate(month, year),
    onSuccess: (results) => {
      showToast(`Payroll generated for ${results.length} employee(s)`);
      queryClient.invalidateQueries({ queryKey: ['payroll-list'] });
    },
    onError: (err: any) => showToast(err?.response?.data?.message ?? 'Could not generate payroll', 'error'),
  });

  const markPaidMutation = useMutation({
    mutationFn: payrollApi.markPaid,
    onSuccess: () => {
      showToast('Marked as paid');
      queryClient.invalidateQueries({ queryKey: ['payroll-list'] });
    },
  });

  function handleSetSalary(e: FormEvent) {
    e.preventDefault();
    if (salaryForm.employeeId && salaryForm.basicSalary) setSalaryMutation.mutate();
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Payroll</h1>
          <p className="text-slate-500 mt-1">
            {isAdminOrHR ? 'Manage salaries and generate monthly payroll.' : 'View your payslips.'}
          </p>
        </div>

        {isAdminOrHR && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowSalaryModal(true)}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-slate-50 transition"
            >
              <Wallet size={15} />
              Set Salary
            </button>
            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              <Play size={15} />
              {generateMutation.isPending ? 'Generating...' : 'Generate Payroll'}
            </button>
          </div>
        )}
      </div>

      {isAdminOrHR && (
        <div className="flex gap-3 mt-6">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
          >
            {MONTH_NAMES.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
          />
        </div>
      )}

      {/* Admin/HR: Payroll table */}
      {isAdminOrHR && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mt-4">
          {payrollLoading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : payrollData?.payroll.length === 0 ? (
            <p className="text-sm text-slate-400">No payroll generated for this period yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="pb-2 font-medium">Employee</th>
                  <th className="pb-2 font-medium">Basic</th>
                  <th className="pb-2 font-medium">Allowances</th>
                  <th className="pb-2 font-medium">Deductions</th>
                  <th className="pb-2 font-medium">Net</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {payrollData?.payroll.map((p) => (
                  <tr key={p.payroll_id} className="border-b border-slate-50 last:border-0">
                    <td className="py-3">
                      <p className="text-slate-700 font-medium">{p.employee_name}</p>
                      <p className="text-xs text-slate-400">{p.employee_code}</p>
                    </td>
                    <td className="py-3 text-slate-600">₹{Number(p.basic_salary).toLocaleString('en-IN')}</td>
                    <td className="py-3 text-slate-600">₹{Number(p.total_allowances).toLocaleString('en-IN')}</td>
                    <td className="py-3 text-slate-600">₹{Number(p.total_deductions).toLocaleString('en-IN')}</td>
                    <td className="py-3 text-slate-800 font-semibold">₹{Number(p.net_salary).toLocaleString('en-IN')}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusStyles[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {p.status === 'GENERATED' && (
                        <button
                          onClick={() => markPaidMutation.mutate(p.payroll_id)}
                          className="flex items-center gap-1 text-xs text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded-lg transition"
                        >
                          <CheckCircle2 size={13} />
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Employee: My Payslips */}
      {!isAdminOrHR && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mt-6">
          {myLoading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : myPayslips?.length === 0 ? (
            <p className="text-sm text-slate-400">No payslips yet.</p>
          ) : (
            <div className="space-y-3">
              {myPayslips?.map((p) => (
                <motion.div
                  key={p.payroll_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {MONTH_NAMES[p.pay_month - 1]} {p.pay_year}
                    </p>
                    <p className="text-xs text-slate-500">
                      Basic ₹{Number(p.basic_salary).toLocaleString('en-IN')} + Allowances ₹
                      {Number(p.total_allowances).toLocaleString('en-IN')} − Deductions ₹
                      {Number(p.total_deductions).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-semibold text-slate-800">
                      ₹{Number(p.net_salary).toLocaleString('en-IN')}
                    </p>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusStyles[p.status]}`}>
                      {p.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Set Salary modal */}
      {showSalaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowSalaryModal(false)} />
          <form
            onSubmit={handleSetSalary}
            className="relative z-10 w-full max-w-sm bg-white/90 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-2xl p-6"
          >
            <h2 className="font-display text-lg font-semibold text-slate-800 mb-4">Set Salary Structure</h2>

            <label className="block text-xs font-medium text-slate-600 mb-1">Employee</label>
            <select
              required
              value={salaryForm.employeeId}
              onChange={(e) => setSalaryForm({ ...salaryForm, employeeId: e.target.value })}
              className="w-full bg-white/70 border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            >
              <option value="">Select employee...</option>
              {employees?.map((e) => (
                <option key={e.employee_id} value={e.employee_id}>
                  {e.first_name} {e.last_name}
                </option>
              ))}
            </select>

            <label className="block text-xs font-medium text-slate-600 mb-1">Basic Salary (₹)</label>
            <input
              type="number"
              required
              value={salaryForm.basicSalary}
              onChange={(e) => setSalaryForm({ ...salaryForm, basicSalary: e.target.value })}
              className="w-full bg-white/70 border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            />

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">HRA (₹)</label>
                <input
                  type="number"
                  value={salaryForm.hra}
                  onChange={(e) => setSalaryForm({ ...salaryForm, hra: e.target.value })}
                  className="w-full bg-white/70 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Other Allowances (₹)</label>
                <input
                  type="number"
                  value={salaryForm.otherAllowances}
                  onChange={(e) => setSalaryForm({ ...salaryForm, otherAllowances: e.target.value })}
                  className="w-full bg-white/70 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                />
              </div>
            </div>

            <label className="block text-xs font-medium text-slate-600 mb-1">Effective From</label>
            <input
              type="date"
              required
              value={salaryForm.effectiveFrom}
              onChange={(e) => setSalaryForm({ ...salaryForm, effectiveFrom: e.target.value })}
              className="w-full bg-white/70 border border-slate-200 rounded-lg px-3 py-2 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowSalaryModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={setSalaryMutation.isPending}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium hover:shadow-lg disabled:opacity-50"
              >
                {setSalaryMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}