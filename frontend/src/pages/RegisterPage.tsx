import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../lib/api';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { User, Mail, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSentToken, setVerificationSentToken] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const res: any = await api.post('/auth/register', values);
      setVerificationSentToken(res.data.simulatedVerificationToken);
      toast('Registration successful! Please verify your email.', 'success');
    } catch (err: any) {
      toast(err.message || 'Registration failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyNow = async () => {
    if (!verificationSentToken) return;
    try {
      await api.post('/auth/verify-email', { token: verificationSentToken });
      toast('Email verified! You can now log in.', 'success');
      navigate('/login');
    } catch (err: any) {
      toast(err.message || 'Verification failed.', 'error');
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
          <h2 className="text-xl font-bold text-slate-100">Create Your Account</h2>
          <p className="text-xs text-slate-400">
            Start branding your short links and bio-link hub in seconds
          </p>
        </div>

        {verificationSentToken ? (
          <div className="bg-brand-500/10 border border-brand-500/30 p-5 rounded-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-brand-neon/20 border border-brand-neon/40 text-brand-neon mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">Verify Your Email</h3>
            <p className="text-xs text-slate-300">
              A simulated email verification token was issued for assessment testing.
            </p>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs font-mono text-brand-neon break-all">
              {verificationSentToken}
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={handleVerifyNow}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Simulate Email Verification & Log In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Alex Rivera"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Get Started Free
            </Button>
          </form>
        )}

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-neon font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};
