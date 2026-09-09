import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { employeeApi } from '../../api/employeeApi';
import { departmentApi } from '../../api/departmentApi';
import AddEmployeeModal from './AddEmployeeModal';
import { CardSkeleton } from '../../components/Skeleton';

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  ON_LEAVE: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  TERMINATED: 'bg-red-50 text-red-700 ring-red-600/20',
  RESIGNED: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['employees', search, departmentId],
    queryFn: () =>
      employeeApi.list({
        search: search || undefined,
        departmentId: departmentId ? Number(departmentId) : undefined,
        page: 1,
        limit: 50,
      }),
  });

  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: departmentApi.list });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Employees</h1>
          <p className="text-slate-500 text-sm mt-1">
            {data?.pagination.total ?? 0} people across your organization
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all duration-200"
        >
          + Add Employee
        </button>
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, code, or email..."
          className="flex-1 max-w-md bg-white/60 backdrop-blur-xl border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400/40 transition shadow-sm"
        />
        <select
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          className="bg-white/60 backdrop-blur-xl border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 transition shadow-sm"
        >
          <option value="">All departments</option>
          {departments?.map((d) => (
            <option key={d.department_id} value={d.department_id}>
              {d.department_name}
            </option>
          ))}
        </select>
      </div>

      {/* Employee cards grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : data?.employees.length === 0 ? (
        <div className="text-center py-16 bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-200/60">
          <p className="text-slate-500">No employees found. Add your first one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.employees.map((emp) => (
            <div
              key={emp.employee_id}
              onClick={() => navigate(`/employees/${emp.employee_id}`)}
              className="group relative bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-5 shadow-sm
                         hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 hover:bg-white/90
                         transition-all duration-300 ease-out cursor-pointer"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="relative flex items-start gap-3">
                {emp.profile_photo_url ? (
                  <img
                    src={`http://localhost:5000${emp.profile_photo_url}`}
                    alt=""
                    className="w-11 h-11 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                    {emp.first_name[0]}
                    {emp.last_name[0]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-800 truncate">
                    {emp.first_name} {emp.last_name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{emp.email}</p>
                </div>
              </div>

              <div className="relative mt-4 flex flex-wrap gap-1.5 text-xs">
                <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600">
                  {emp.employee_code}
                </span>
                {emp.department_name && (
                  <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700">
                    {emp.department_name}
                  </span>
                )}
                {emp.designation_title && (
                  <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600">
                    {emp.designation_title}
                  </span>
                )}
                <span
                  className={`px-2 py-1 rounded-md ring-1 ring-inset ${
                    statusStyles[emp.employment_status] ?? statusStyles.ACTIVE
                  }`}
                >
                  {emp.employment_status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}