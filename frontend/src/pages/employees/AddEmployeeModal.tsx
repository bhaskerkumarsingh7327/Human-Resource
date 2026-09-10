import { useState, type FormEvent, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { employeeApi } from '../../api/employeeApi';
import { departmentApi } from '../../api/departmentApi';
import { designationApi } from '../../api/designationApi';
import { useToast } from '../../components/Toast';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function AddEmployeeModal({ onClose, onCreated }: Props) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'EMPLOYEE' as 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE',
    firstName: '',
    lastName: '',
    departmentId: '',
    designationId: '',
    managerId: '',
    dateOfJoining: new Date().toISOString().slice(0, 10),
  });
  const [managerAutoFilled, setManagerAutoFilled] = useState(false);

  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: departmentApi.list });
  const { data: designations } = useQuery({ queryKey: ['designations'], queryFn: designationApi.list });
  const { data: employees } = useQuery({ queryKey: ['employees-simple'], queryFn: employeeApi.listSimple });

  const mutation = useMutation({
    mutationFn: employeeApi.create,
    onSuccess: () => {
      showToast('Employee added successfully');
      onCreated();
    },
    onError: () => showToast('Could not create employee — email may already be in use', 'error'),
  });

  // Auto-fill manager when department changes, based on that department's head
  useEffect(() => {
    if (!form.departmentId || !departments) return;
    const dept = departments.find((d) => d.department_id === Number(form.departmentId));
    if (dept?.head_employee_id) {
      setForm((prev) => ({ ...prev, managerId: String(dept.head_employee_id) }));
      setManagerAutoFilled(true);
    } else {
      setForm((prev) => ({ ...prev, managerId: '' }));
      setManagerAutoFilled(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.departmentId, departments]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate({
      ...form,
      departmentId: form.departmentId ? Number(form.departmentId) : undefined,
      designationId: form.designationId ? Number(form.designationId) : undefined,
      managerId: form.managerId ? Number(form.managerId) : undefined,
    });
  }

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'managerId') setManagerAutoFilled(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg bg-white/80 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-800">Add Employee</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full hover:bg-slate-100 transition"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">First name</label>
            <input
              required
              value={form.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              className="w-full bg-white/70 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Last name</label>
            <input
              required
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              className="w-full bg-white/70 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="w-full bg-white/70 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Temporary password</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className="w-full bg-white/70 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => update('role', e.target.value as typeof form.role)}
              className="w-full bg-white/70 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="HR">HR</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Joining date</label>
            <input
              type="date"
              required
              value={form.dateOfJoining}
              onChange={(e) => update('dateOfJoining', e.target.value)}
              className="w-full bg-white/70 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
            <select
              value={form.departmentId}
              onChange={(e) => update('departmentId', e.target.value)}
              className="w-full bg-white/70 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            >
              <option value="">— None —</option>
              {departments?.map((d) => (
                <option key={d.department_id} value={d.department_id}>
                  {d.department_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Designation</label>
            <select
              value={form.designationId}
              onChange={(e) => update('designationId', e.target.value)}
              className="w-full bg-white/70 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            >
              <option value="">— None —</option>
              {designations?.map((d) => (
                <option key={d.designation_id} value={d.designation_id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Manager{' '}
              {managerAutoFilled && (
                <span className="text-indigo-500 font-normal">(auto-assigned from department head)</span>
              )}
            </label>
            <select
              value={form.managerId}
              onChange={(e) => update('managerId', e.target.value)}
              className="w-full bg-white/70 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            >
              <option value="">— None —</option>
              {employees?.map((e) => (
                <option key={e.employee_id} value={e.employee_id}>
                  {e.first_name} {e.last_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 transition-all"
          >
            {mutation.isPending ? 'Adding...' : 'Add Employee'}
          </button>
        </div>
      </form>
    </div>
  );
}