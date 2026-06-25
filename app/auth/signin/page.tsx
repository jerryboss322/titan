'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.success) {
      toast('Welcome back!');
      router.push(callbackUrl);
      router.refresh();
    } else {
      setError(result.error ?? 'Something went wrong.');
    }
  };

  return (
    <div className="w-full max-w-[380px]">
      <Link href="/" className="font-display text-2xl font-bold block mb-10 lg:hidden">
        Titan<span className="text-gold">.</span>
      </Link>

      <h1 className="text-3xl font-display font-bold tracking-tight">Sign in</h1>
      <p className="text-secondary mt-2 mb-8 text-sm">
        Enter your credentials to access your account.
      </p>

      {error && (
        <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <span className="mt-0.5 flex-shrink-0">⚠</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
            Email address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <button type="button" className="text-xs text-gold hover:underline font-medium">
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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
        </div>

        <Button type="submit" className="w-full mt-2" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              Signing in…
            </span>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs text-secondary">New to Titan?</span>
        </div>
      </div>

      <Link href="/auth/signup">
        <Button variant="outline" className="w-full">
          Create an account
        </Button>
      </Link>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left: Editorial image */}
      <div className="hidden lg:block relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80"
          alt="Fashion editorial"
          fill
          className="object-cover scale-105"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-14 left-14 text-white">
          <p className="text-4xl font-display font-bold tracking-tight leading-tight">
            Welcome<br />back.
          </p>
          <p className="text-white/60 mt-3 text-base">Your wardrobe awaits.</p>
        </div>
        <Link href="/" className="absolute top-10 left-14 font-display text-xl font-bold text-white">
          Titan<span className="text-gold">.</span>
        </Link>
      </div>

      {/* Right: Form panel */}
      <div className="flex items-center justify-center px-6 py-16 bg-background">
        <Suspense fallback={<div className="w-full max-w-[380px]"><div className="h-8 bg-gray-100 rounded animate-pulse" /></div>}>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}
