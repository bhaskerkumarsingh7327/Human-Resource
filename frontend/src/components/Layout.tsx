import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, Users, Building2, Clock, PlaneTakeoff, DollarSign, Star, LogOut,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { logout } from '../features/auth/authSlice';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/departments', label: 'Departments', icon: Building2 },
  { to: '/attendance', label: 'Attendance', icon: Clock },
  { to: '/leaves', label: 'Leaves', icon: PlaneTakeoff },
  { to: '/payroll', label: 'Payroll', icon: DollarSign },
  { to: '/performance', label: 'Performance', icon: Star },
];

export default function Layout() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    dispatch(logout());
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-[#0B1120] relative overflow-hidden grain">
        {/* Ambient glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 -right-24 w-64 h-64 bg-violet-600/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full p-5">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5 mb-8 px-1"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/30">
              H
            </div>
            <span className="text-white font-display font-semibold tracking-tight text-[15px]">HRMS</span>
          </motion.div>

          <nav className="flex-1 space-y-1 relative">
            {navItems.map((item, i) => {
              const isActive = location.pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="relative"
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-white/10 rounded-lg"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <NavLink
                    to={item.to}
                    className={`relative z-10 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon size={17} strokeWidth={2} className="shrink-0" />
                    {item.label}
                  </NavLink>
                </motion.div>
              );
            })}
          </nav>

          <div className="border-t border-white/10 pt-4 mt-4">
            <p className="text-sm text-white truncate">{user?.email}</p>
            <p className="text-xs text-slate-500 mb-3">{user?.role}</p>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg py-2 transition-all duration-200"
            >
              <LogOut size={14} />
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Content area with page transitions */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}