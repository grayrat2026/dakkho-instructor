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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0F0F1A 0%, #1A1A2E 50%, #0F0F1A 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="glass-card rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="w-20 h-20 mb-4 rounded-2xl overflow-hidden gradient-primary p-0.5"
            >
              <div className="w-full h-full rounded-2xl bg-[#0F0F1A] flex items-center justify-center overflow-hidden">
                <img src={assetUrl('/dakkho-logo.png')} alt="DAKKHO" className="w-14 h-14 object-contain" />
              </div>
            </motion.div>
            <h1 className="text-2xl font-bold text-white tracking-tight">DAKKHO Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your admin account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="admin@dakkho.pro.bd"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-dakkho-blue focus:ring-dakkho-blue/20"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-dakkho-blue focus:ring-dakkho-blue/20"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 gradient-primary text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              DAKKHO Learning Platform &middot; Admin Access Only
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
