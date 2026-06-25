'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

const passwordRules = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Contains a letter', test: (p: string) => /[a-zA-Z]/.test(p) },
  { label: 'Contains a number', test: (p: string) => /\d/.test(p) },
];

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!passwordRules.every(r => r.test(password))) {
      setError('Please meet all password requirements.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const result = await signUp(name, email, password);
    setLoading(false);
    if (result.success) {
      toast('Account created! Welcome to Titan.');
      router.push('/');
    } else {
      setError(result.error ?? 'Something went wrong.');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left: Editorial image */}
      <div className="hidden lg:block relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80"
          alt="Fashion editorial"
          fill
          className="object-cover scale-105"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-14 left-14 text-white">
          <p className="text-4xl font-display font-bold tracking-tight leading-tight">
            Join<br />Titan.
          </p>
          <p className="text-white/60 mt-3 text-base">Dress with intention.</p>
        </div>
        <Link href="/" className="absolute top-10 left-14 font-display text-xl font-bold text-white">
          Titan<span className="text-gold">.</span>
        </Link>
      </div>

      {/* Right: Form panel */}
      <div className="flex items-center justify-center px-6 py-16 bg-background">
        <div className="w-full max-w-[380px]">
          <Link href="/" className="font-display text-2xl font-bold block mb-10 lg:hidden">
            Titan<span className="text-gold">.</span>
          </Link>

          <h1 className="text-3xl font-display font-bold tracking-tight">Create account</h1>
          <p className="text-secondary mt-2 mb-8 text-sm">
            Join thousands of discerning shoppers.
          </p>

          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              <span className="mt-0.5 flex-shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full name</label>
              <Input
                placeholder="Jane Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Email address</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused(true)}
                  required
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {focused && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  {passwordRules.map(rule => (
                    <div key={rule.label} className={`flex items-center gap-2 text-xs transition-colors ${rule.test(password) ? 'text-green-600' : 'text-secondary'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${rule.test(password) ? 'bg-green-500' : 'bg-gray-200'}`}>
                        {rule.test(password) && <Check className="h-2 w-2 text-white" strokeWidth={3} />}
                      </div>
                      {rule.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Confirm password</label>
              <div className="relative">
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirm.length > 0 && password !== confirm && (
                <p className="mt-1.5 text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Creating account…
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-secondary mt-7">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-foreground font-semibold hover:underline">
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-secondary/60 mt-4">
            By creating an account you agree to our{' '}
            <button className="underline hover:text-secondary transition-colors">Terms</button>
            {' '}and{' '}
            <button className="underline hover:text-secondary transition-colors">Privacy Policy</button>.
          </p>
        </div>
      </div>
    </div>
  );
}
