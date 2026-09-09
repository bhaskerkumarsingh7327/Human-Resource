import { useState,type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentApi } from '../../api/departmentApi';
import { designationApi } from '../../api/designationApi';
import { employeeApi, type SimpleEmployee } from '../../api/employeeApi';
import { useToast } from '../../components/Toast';
import { CardSkeleton } from '../../components/Skeleton';

const gradients = [
  'from-indigo-500 to-blue-500',
  'from-violet-500 to-purple-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-cyan-500 to-sky-500',
];

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [showAddDept, setShowAddDept] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  const [showAddDesig, setShowAddDesig] = useState(false);
  const [desigTitle, setDesigTitle] = useState('');

  const { data: departments, isLoading: deptLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentApi.list,
  });
  const { data: designations, isLoading: desigLoading } = useQuery({
    queryKey: ['designations'],
    queryFn: designationApi.list,
  });
  const { data: employees } = useQuery<SimpleEmployee[]>({
    queryKey: ['employees-simple'],
    queryFn: employeeApi.listSimple,
  });

  const totalEmployees = departments?.reduce((sum, d) => sum + Number(d.employee_count), 0) ?? 0;

  const createDept = useMutation({
    mutationFn: departmentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setDeptName('');
      setDeptDesc('');
      setShowAddDept(false);
      showToast('Department created');
    },
    onError: () => showToast('Could not create department — name may already exist', 'error'),
  });

  const deleteDept = useMutation({
    mutationFn: departmentApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      showToast('Department deleted');
    },
  });

  const setHead = useMutation({
    mutationFn: ({ deptId, empId }: { deptId: number; empId: number }) =>
      departmentApi.setHead(deptId, empId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      showToast('Department head updated');
    },
  });

  const createDesig = useMutation({
    mutationFn: designationApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      setDesigTitle('');
      setShowAddDesig(false);
      showToast('Designation created');
    },
    onError: () => showToast('Could not create designation — title may already exist', 'error'),
  });

  const deleteDesig = useMutation({
    mutationFn: designationApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      showToast('Designation deleted');
    },
  });

  function handleAddDept(e: FormEvent) {
    e.preventDefault();
    if (deptName.trim()) createDept.mutate({ departmentName: deptName, description: deptDesc || undefined });
  }

  function handleAddDesig(e: FormEvent) {
    e.preventDefault();
    if (desigTitle.trim()) createDesig.mutate({ title: desigTitle });
  }

  function employeeName(id: number | null) {
    if (!id) return null;
    const emp = employees?.find((e) => e.employee_id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : null;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Departments</h1>
          <p className="text-slate-500 text-sm mt-1">
            {departments?.length ?? 0} departments · {totalEmployees} employees total
          </p>
        </div>
        <button
          onClick={() => setShowAddDept(true)}
          className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all duration-200"
        >
          + New Department
        </button>
      </div>

      {/* Department cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {deptLoading ? (
          <>
            <CardSkeleton /><CardSkeleton /><CardSkeleton />
          </>
        ) : departments?.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-200/60">
            <p className="text-slate-500">No departments yet. Create your first one.</p>
          </div>
        ) : (
          departments?.map((d, i) => (
            <div
              key={d.department_id}
              className="group relative bg-white border border-slate-200 rounded-2xl p-5 overflow-hidden
                         hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${gradients[i % gradients.length]}`} />

              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-800">{d.department_name}</h3>
                  {d.description && <p className="text-xs text-slate-500 mt-0.5">{d.description}</p>}
                </div>
                <button
                  onClick={() => deleteDept.mutate(d.department_id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition text-sm"
                  title="Delete department"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-semibold text-slate-800">{d.employee_count}</span>
                <span className="text-xs text-slate-500 mb-1">employees</span>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-1.5">Department Head</p>
                {employeeName(d.head_employee_id) ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[10px] font-semibold">
                      {employeeName(d.head_employee_id)?.[0]}
                    </div>
                    <span className="text-sm text-slate-700">{employeeName(d.head_employee_id)}</span>
                  </div>
                ) : (
                  <select
                    onChange={(e) =>
                      e.target.value && setHead.mutate({ deptId: d.department_id, empId: Number(e.target.value) })
                    }
                    defaultValue=""
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 w-full text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  >
                    <option value="" disabled>
                      Assign a head...
                    </option>
                    {employees?.map((e) => (
                      <option key={e.employee_id} value={e.employee_id}>
                        {e.first_name} {e.last_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add department modal */}
      {showAddDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddDept(false)} />
          <form
            onSubmit={handleAddDept}
            className="relative z-10 w-full max-w-sm bg-white/90 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-slate-800 mb-4">New Department</h2>
            <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
            <input
              required
              autoFocus
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              placeholder="e.g. Engineering"
              className="w-full bg-white/70 border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            />
            <label className="block text-xs font-medium text-slate-600 mb-1">Description (optional)</label>
            <input
              value={deptDesc}
              onChange={(e) => setDeptDesc(e.target.value)}
              placeholder="Short description"
              className="w-full bg-white/70 border border-slate-200 rounded-lg px-3 py-2 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddDept(false)}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createDept.isPending}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium hover:shadow-lg disabled:opacity-50"
              >
                {createDept.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Designations section */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Designations</h2>
          <button
            onClick={() => setShowAddDesig(true)}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            + Add Designation
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {desigLoading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : designations?.length === 0 ? (
            <p className="text-sm text-slate-400">No designations yet.</p>
          ) : (
            designations?.map((d) => (
              <div
                key={d.designation_id}
                className="group flex items-center gap-2 bg-white border border-slate-200 rounded-full pl-3.5 pr-2 py-1.5 hover:border-slate-300 transition"
              >
                <span className="text-sm text-slate-700">{d.title}</span>
                <button
                  onClick={() => deleteDesig.mutate(d.designation_id)}
                  className="w-5 h-5 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center text-xs transition"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {showAddDesig && (
          <form onSubmit={handleAddDesig} className="flex gap-2 mt-4 max-w-sm">
            <input
              autoFocus
              value={desigTitle}
              onChange={(e) => setDesigTitle(e.target.value)}
              placeholder="e.g. Software Engineer"
              className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            />
            <button
              type="submit"
              disabled={createDesig.isPending}
              className="bg-indigo-600 text-white text-sm font-medium px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAddDesig(false)}
              className="text-slate-500 text-sm px-2"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}