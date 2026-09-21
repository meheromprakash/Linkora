import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [simulatedToken, setSimulatedToken] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      const res: any = await api.post('/auth/forgot-password', { email });
      setSimulatedToken(res.data.simulatedResetToken || null);
      toast('Password reset request processed.', 'success');
    } catch (err: any) {
      toast(err.message || 'Request failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-3.5 sm:p-4">
      <Card className="w-full max-w-md p-5 sm:p-8 bg-white border border-slate-200/90 shadow-modal space-y-5 sm:space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/logo.svg" alt="Linkora" className="w-9 h-9" />
            <span className="text-2xl font-bold tracking-tight brand-text-gradient">Linkora</span>
          </Link>
          <h2 className="text-xl font-semibold text-slate-900">Reset Your Password</h2>
          <p className="text-xs text-slate-500">
            Enter your registered email address to receive a reset token
          </p>
        </div>

        {simulatedToken ? (
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-card space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base">Reset Token Issued</h3>
            <p className="text-xs text-slate-600">
              Simulated reset token generated for testing:
            </p>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs font-mono text-emerald-700 break-all">
              {simulatedToken}
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => navigate(`/reset-password?token=${simulatedToken}`)}
            >
              Proceed to Password Reset Form
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Registered Email"
              type="email"
              placeholder="demo@linkora.io"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Send Reset Token
            </Button>
          </form>
        )}

        <div className="text-center text-xs pt-3 border-t border-slate-100">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};

