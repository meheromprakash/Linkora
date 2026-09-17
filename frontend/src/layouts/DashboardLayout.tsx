import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import {
  LayoutDashboard,
  Link2,
  BarChart3,
  UserCheck,
  LogOut,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { clsx } from 'clsx';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Link Library', path: '/links', icon: Link2 },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Bio-Link Builder', path: '/bio-builder', icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0c121e] border-b md:border-b-0 md:border-r border-slate-800/80 flex flex-col shrink-0">
        <div className="p-5 flex items-center justify-between border-b border-slate-800/60">
          <Link to="/dashboard" className="flex items-center gap-3">
            <img src="/logo.svg" alt="Linkora Logo" className="w-8 h-8" />
            <span className="text-xl font-black bg-gradient-to-r from-white via-slate-100 to-brand-neon bg-clip-text text-transparent">
              Linkora
            </span>
          </Link>
        </div>

        {/* User Profile Mini Badge */}
        <div className="p-4 mx-3 my-3 bg-slate-900/80 border border-slate-800/80 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-neon/20 border border-brand-neon/40 flex items-center justify-center font-bold text-brand-neon">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-slate-100 truncate">{user?.name}</span>
            <span className="text-xs text-slate-400 truncate">{user?.email}</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200',
                  isActive
                    ? 'bg-brand-neon/10 text-brand-neon border border-brand-neon/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                )}
              >
                <Icon className={clsx('w-4 h-4', isActive ? 'text-brand-neon' : 'text-slate-400')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
            icon={<LogOut className="w-4 h-4" />}
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">{children}</div>
      </main>
    </div>
  );
};
