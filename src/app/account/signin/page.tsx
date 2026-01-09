'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/PageTransition';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

type SignInState = 'idle' | 'sending' | 'sent' | 'error';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<SignInState>('idle');
  const [error, setError] = useState<string | null>(null);

  // Redirect if not configured
  if (!isSupabaseConfigured()) {
    return (
      <PageTransition>
        <main className="min-h-screen px-6 py-12 max-w-md mx-auto">
          <h1 className="font-serif text-2xl mb-8 text-center">Sign In</h1>
          <p className="body-text text-foreground/60 text-center">
            Account sync is not configured.
          </p>
        </main>
      </PageTransition>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    setState('sending');
    setError(null);

    const supabase = getSupabase();
    if (!supabase) {
      setError('Unable to connect to auth service');
      setState('error');
      return;
    }

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/account/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setState('error');
      return;
    }

    setState('sent');
  };

  // Success state - check your email
  if (state === 'sent') {
    return (
      <PageTransition>
        <main className="min-h-screen px-6 py-12 max-w-md mx-auto">
          <h1 className="font-serif text-2xl mb-8 text-center">Check your email</h1>

          <div className="text-center">
            {/* Email icon */}
            <div className="mb-6 w-16 h-16 mx-auto rounded-full bg-foreground/5 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-foreground/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>

            <p className="body-text text-foreground/80 mb-4">
              We sent a magic link to
            </p>
            <p className="body-text font-medium text-foreground mb-8">
              {email}
            </p>
            <p className="body-text text-sm text-foreground/60 leading-relaxed">
              Click the link in your email to sign in. The link will expire in 24 hours.
            </p>

            <button
              onClick={() => {
                setState('idle');
                setEmail('');
              }}
              className="mt-8 body-text text-sm text-foreground/50 hover:text-foreground/70 transition-colors underline"
            >
              Try a different email
            </button>
          </div>
        </main>
      </PageTransition>
    );
  }

  // Form state
  return (
    <PageTransition>
      <main className="min-h-screen px-6 py-12 max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="body-text text-sm text-foreground/50 hover:text-foreground/70 transition-colors mb-8 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h1 className="font-serif text-2xl mb-2 text-center">Sign in</h1>
        <p className="body-text text-foreground/60 text-sm mb-8 text-center">
          We&apos;ll send you a magic link to sign in — no password needed.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block body-text text-sm text-foreground/70 mb-2">
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
              className="w-full px-4 py-3 rounded-lg border border-foreground/20 bg-transparent
                         body-text text-foreground placeholder:text-foreground/30
                         focus:outline-none focus:border-foreground/40 transition-colors"
            />
          </div>

          {error && (
            <p className="body-text text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={state === 'sending'}
            className="w-full py-3 px-6 bg-foreground text-background font-medium rounded-lg
                       hover:opacity-90 transition-opacity body-text
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state === 'sending' ? 'Sending...' : 'Send magic link'}
          </button>
        </form>

        <p className="body-text text-xs text-foreground/40 mt-8 text-center leading-relaxed">
          By signing in, you agree to sync your reflections securely across devices.
          Your local data will be preserved.
        </p>
      </main>
    </PageTransition>
  );
}
