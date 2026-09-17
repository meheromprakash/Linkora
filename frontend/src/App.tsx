import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { LinksPage } from './pages/LinksPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { BioBuilderPage } from './pages/BioBuilderPage';
import { PublicBioPage } from './pages/PublicBioPage';
import { Button } from './components/ui/Button';
import { Link2, Sparkles, Shield, BarChart3, Zap } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-400 text-sm">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Header Navbar */}
      <header className="border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo.svg" alt="Linkora Logo" className="w-9 h-9 transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-neon bg-clip-text text-transparent">
                Linkora
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button variant="primary" size="sm" icon={<Zap className="w-4 h-4" />}>
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" icon={<Sparkles className="w-4 h-4" />}>
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-neon/10 border border-brand-neon/30 text-brand-neon text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" /> High Performance Short-Link & Bio Engine
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-100 leading-tight">
            Branded links.{' '}
            <span className="bg-gradient-to-r from-brand-neon via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Smarter sharing.
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Linkora combines high-performance URL shortening, real-time privacy-friendly click telemetry, and customizable bio-link profiles in one sleek hub.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link to={user ? "/dashboard" : "/register"}>
              <Button variant="primary" size="lg" icon={<Link2 className="w-5 h-5" />}>
                {user ? "Open Dashboard" : "Create Your First Link"}
              </Button>
            </Link>
            <Link to="/bio/alexrivera">
              <Button variant="outline" size="lg">
                View Public Bio Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-neon/10 flex items-center justify-center text-brand-neon">
              <Link2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Short-Link Engine</h3>
            <p className="text-sm text-slate-400">
              Generate 6-character short codes or custom vanity slugs with automatic collision protection and sub-millisecond 302 redirects.
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Click Telemetry</h3>
            <p className="text-sm text-slate-400">
              Asynchronously capture clicks over time, referrer sources, browser types, and device breakdowns with privacy-compliant salted IP hashing.
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Bio-Link Builder</h3>
            <p className="text-sm text-slate-400">
              Craft beautiful, responsive link-in-bio profiles with customizable themes (Minimal Light, Dark Slate, Gradient Neon) and custom social handles.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-sm text-slate-500">
        Linkora &copy; {new Date().getFullYear()} — Built for Com.bot Technical Assessment
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/links"
          element={
            <ProtectedRoute>
              <LinksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bio-builder"
          element={
            <ProtectedRoute>
              <BioBuilderPage />
            </ProtectedRoute>
          }
        />

        {/* Public Bio Page */}
        <Route path="/bio/:username" element={<PublicBioPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
