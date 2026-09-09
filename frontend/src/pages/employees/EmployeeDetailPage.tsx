import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '../../api/employeeApi';
import { axiosInstance } from '../../api/axiosInstance';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const employeeId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { confirm, dialog } = useConfirm();
  const [uploading, setUploading] = useState(false);

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => employeeApi.getOne(employeeId),
    enabled: !!employeeId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => employeeApi.remove(employeeId),
    onSuccess: () => {
      showToast('Employee removed');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      navigate('/employees');
    },
    onError: () => showToast('Could not remove employee', 'error'),
  });

  async function handleRemoveClick() {
    const confirmed = await confirm(
      'Remove employee?',
      'This will permanently delete their account and profile. This cannot be undone.',
      true
    );
    if (confirmed) deleteMutation.mutate();
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      await axiosInstance.post(`/employees/${employeeId}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Profile photo updated');
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
    } catch {
      showToast('Photo upload failed', 'error');
    } finally {
      setUploading(false);
    }
  }

  if (isLoading) {
    return <div className="p-8 text-slate-400 text-sm">Loading employee...</div>;
  }

  if (!employee) {
    return <div className="p-8 text-slate-400 text-sm">Employee not found.</div>;
  }

  return (
    <div className="p-8 max-w-3xl">
      <button
        onClick={() => navigate('/employees')}
        className="text-sm text-slate-500 hover:text-slate-700 mb-6 flex items-center gap-1"
      >
        ← Back to Employees
      </button>

      <div className="bg-white border border-slate-200 rounded-2xl p-8">
        <div className="flex items-start gap-6">
          <div className="relative group shrink-0">
            {employee.profile_photo_url ? (
              <img
                src={`http://localhost:5000${employee.profile_photo_url}`}
                alt=""
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-semibold text-2xl">
                {employee.first_name[0]}
                {employee.last_name[0]}
              </div>
            )}
            <label className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs cursor-pointer transition">
              {uploading ? '...' : 'Change'}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-slate-800">
              {employee.first_name} {employee.last_name}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">{employee.email}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs">
                {employee.employee_code}
              </span>
              {employee.designation_title && (
                <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs">
                  {employee.designation_title}
                </span>
              )}
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs">
                {employee.employment_status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <button
            onClick={handleRemoveClick}
            className="text-sm text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 rounded-lg px-3 py-1.5 transition"
          >
            Remove
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-slate-100">
          <Field label="Department" value={employee.department_name ?? '—'} />
          <Field label="Phone" value={employee.phone ?? '—'} />
          <Field label="Date of Joining" value={new Date(employee.date_of_joining).toLocaleDateString()} />
          <Field label="Employee ID" value={`#${employee.employee_id}`} />
        </div>
      </div>

      {dialog}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-sm text-slate-700">{value}</p>
    </div>
  );
}