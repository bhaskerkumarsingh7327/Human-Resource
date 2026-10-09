import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/Layout';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const EmployeeListPage = lazy(() => import('./pages/employees/EmployeeListPage'));
const EmployeeDetailPage = lazy(() => import('./pages/employees/EmployeeDetailPage'));
const DepartmentsPage = lazy(() => import('./pages/departments/DepartmentsPage'));
const OrgChartPage = lazy(() => import('./pages/orgchart/OrgChartPage'));
const AttendancePage = lazy(() => import('./pages/attendance/AttendancePage'));
const LeavesPage = lazy(() => import('./pages/leaves/LeavesPage'));
const PayrollPage = lazy(() => import('./pages/payroll/PayrollPage'));
const PerformancePage = lazy(() => import('./pages/performance/PerformancePage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/employees" element={<EmployeeListPage />} />
              <Route path="/employees/:id" element={<EmployeeDetailPage />} />
              <Route path="/departments" element={<DepartmentsPage />} />
              <Route path="/org-chart" element={<OrgChartPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/leaves" element={<LeavesPage />} />
              <Route path="/payroll" element={<PayrollPage />} />
              <Route path="/performance" element={<PerformancePage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;