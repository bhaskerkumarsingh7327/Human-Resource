import { useAppSelector } from '../../app/hooks';
import AdminDashboardPage from './AdminDashboardPage';
import ManagerDashboardPage from './ManagerDashboardPage';
import EmployeeDashboardPage from './EmployeeDashboardPage';

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);

  if (!user) return null;
  if (user.role === 'ADMIN' || user.role === 'HR') return <AdminDashboardPage />;
  if (user.role === 'MANAGER') return <ManagerDashboardPage />;
  return <EmployeeDashboardPage />;
}