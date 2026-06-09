'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminStore } from '@/lib/store';
import { apiPost, setAuthToken, ApiError, assetUrl } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAdminUser } = useAdminStore();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const data = await apiPost('/auth/login', { email, password }) as Record<string, unknown>;

      if (data.token) {
        setAuthToken(data.token as string);
      }

      setAdminUser(data.user as Record<string, unknown>);
      toast({ title: 'Welcome back!', description: 'Successfully logged in to DAKKHO Admin' });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Network error. Please try again.';
      toast({ title: 'Login Failed', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #090918 0%, #141428 50%, #090918 100%)' }}
    >
      {/* ── Ambient glow circles ── */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 h-[600px] w-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(74,144,226,0.06) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-[700px] w-[700px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,212,170,0.04) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />

      {/* ── Subtle grid overlay ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* ── Login Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Gradient border via ::before */}
        <div className="relative rounded-2xl p-px before:absolute before:inset-0 before:rounded-2xl before:p-px before:bg-gradient-to-br before:from-white/[0.12] before:via-white/[0.04] before:to-white/[0.08] before:-z-10">
          <div
            className="rounded-2xl p-8"
            style={{
              background: 'rgba(15,15,30,0.8)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            }}
          >
            {/* ── Logo Area ── */}
            <div className="flex flex-col items-center mb-8">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="mb-5"
              >
                <div className="relative w-20 h-20 rounded-full p-[2px] bg-gradient-to-br from-[#4A90E2] to-[#00D4AA]">
                  <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
                    style={{ background: 'rgba(15,15,30,0.9)' }}
                  >
                    <img
                      src={assetUrl('/dakkho-logo.png')}
                      alt="DAKKHO"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-2xl font-bold tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #4A90E2 0%, #00D4AA 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                DAKKHO Admin
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-sm text-white/40 mt-1.5"
              >
                Sign in to manage your platform
              </motion.p>
            </div>

            {/* ── Form ── */}
            <motion.form
              onSubmit={handleLogin}
              className="space-y-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {/* Email field */}
              <div className="relative group">
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center rounded-l-xl border border-white/[0.08] border-r-0 bg-white/[0.02] transition-colors group-focus-within:border-[#4A90E2]/40 group-focus-within:bg-[#4A90E2]/[0.06]">
                  <Mail className="h-4 w-4 text-white/30 transition-colors group-focus-within:text-[#4A90E2]" />
                </div>
                <Input
                  type="email"
                  placeholder="admin@dakkho.pro.bd"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 pl-12 pr-4 rounded-xl bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 transition-all duration-200 focus:border-[#4A90E2]/50 focus:ring-[#4A90E2]/20 focus:bg-white/[0.06]"
                  autoComplete="email"
                />
              </div>

              {/* Password field */}
              <div className="relative group">
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center rounded-l-xl border border-white/[0.08] border-r-0 bg-white/[0.02] transition-colors group-focus-within:border-[#4A90E2]/40 group-focus-within:bg-[#4A90E2]/[0.06]">
                  <Lock className="h-4 w-4 text-white/30 transition-colors group-focus-within:text-[#4A90E2]" />
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-12 pr-11 rounded-xl bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 transition-all duration-200 focus:border-[#4A90E2]/50 focus:ring-[#4A90E2]/20 focus:bg-white/[0.06]"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors duration-200 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Sign In button */}
              <Button
                type="submit"
                disabled={loading}
                className="relative w-full h-12 rounded-xl font-semibold text-white overflow-hidden transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #4A90E2 0%, #00D4AA 100%)',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </motion.form>

            {/* ── Footer ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="mt-8 text-center"
            >
              <p className="text-xs text-white/20">
                DAKKHO Learning Platform &middot; v2.0
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
