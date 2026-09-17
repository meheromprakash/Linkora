import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPassword) return;
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      toast('Password reset successfully! Please sign in.', 'success');
      navigate('/login');
    } catch (err: any) {
      toast(err.message || 'Reset failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border-slate-800 space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/logo.svg" alt="Linkora" className="w-10 h-10" />
            <span className="text-2xl font-black text-white">Linkora</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-100">Set New Password</h2>
          <p className="text-xs text-slate-400">
            Enter your reset token and new account password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Reset Token"
            type="text"
            placeholder="Paste reset token here"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />

          <Input
            label="New Password"
            type="password"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            leftIcon={<Lock className="w-4 h-4" />}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Update Password
          </Button>
        </form>

        <div className="text-center text-xs pt-2 border-t border-slate-800">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};
