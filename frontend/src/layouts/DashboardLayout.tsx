import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import {
  LayoutDashboard,
  Link2,
  BarChart3,
  UserCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { clsx } from 'clsx';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Top Left Brand Logo */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200/80">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src="/logo.svg" alt="Linkora Logo" className="w-7 h-7" />
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Linkora
          </span>
        </Link>
        {mobileMenuOpen && (
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="p-3 mx-3 my-3 bg-slate-50 border border-slate-200/80 rounded-card flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center font-semibold text-emerald-700 shrink-0">
          {user?.name ? user.name[0].toUpperCase() : 'V'}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-sm font-semibold text-slate-900 truncate">
            {user?.name || 'Virtuoso Creations'}
          </span>
          <span className="text-xs text-slate-500 truncate">
            {user?.email || 'user@example.com'}
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={clsx(
                'relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group',
                isActive
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              )}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-brand-600 rounded-r-full" />
              )}
              <Icon
                className={clsx(
                  'w-4 h-4 transition-colors',
                  isActive ? 'text-brand-600' : 'text-slate-500 group-hover:text-slate-700'
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Public Bio Page Quick Link if user has bio handle */}
      {((user?.bioProfile as any)?.username || (user?.bioProfile as any)?.handle) && (
        <div className="px-3 pb-2">
          <a
            href={`/bio/${(user?.bioProfile as any)?.username || (user?.bioProfile as any)?.handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition border border-dashed border-slate-200"
          >
            <span>View Bio Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Footer Log Out Action */}
      <div className="p-3 border-t border-slate-200/80">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50"
          icon={<LogOut className="w-4 h-4" />}
          onClick={handleLogout}
        >
          Log Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col lg:flex-row">
      {/* Desktop Fixed Sidebar (248px) */}
      <aside className="hidden lg:block w-[248px] fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Top Header (below 1024px) */}
      <div className="lg:hidden sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="Linkora Logo" className="w-7 h-7" />
          <span className="text-lg font-bold text-slate-900">Linkora</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Slide-in Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in-up"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-[260px] max-w-[80vw] h-full bg-white shadow-modal z-10 animate-scale-in overflow-y-auto">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area (Offset by 248px on desktop) */}
      <main className="flex-1 lg:pl-[248px] min-w-0 min-h-screen">
        <div className="max-w-[1280px] mx-auto p-3.5 sm:p-6 lg:p-8 animate-fade-in-up" key={location.pathname}>
          {children}
        </div>
      </main>
    </div>
  );
};
