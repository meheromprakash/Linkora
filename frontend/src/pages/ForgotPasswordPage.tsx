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
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border-slate-800 space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/logo.svg" alt="Linkora" className="w-10 h-10" />
            <span className="text-2xl font-black text-white">Linkora</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-100">Reset Your Password</h2>
          <p className="text-xs text-slate-400">
            Enter your registered email address to receive a reset token
          </p>
        </div>

        {simulatedToken ? (
          <div className="bg-brand-500/10 border border-brand-500/30 p-5 rounded-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-brand-neon/20 text-brand-neon mx-auto flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">Reset Token Issued</h3>
            <p className="text-xs text-slate-300">
              Simulated reset token generated for testing:
            </p>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs font-mono text-brand-neon break-all">
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
              leftIcon={<Mail className="w-4 h-4" />}
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

        <div className="text-center text-xs pt-2 border-t border-slate-800">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};
