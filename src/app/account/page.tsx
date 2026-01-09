'use client';

import { useState } from 'react';
import { PageTransition } from '@/components/PageTransition';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function AccountPage() {
  const { user, isLoading, isSupabaseConfigured } = useAuth();

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="body-text text-foreground/60">Loading...</p>
      </main>
    );
  }

  // Supabase not configured
  if (!isSupabaseConfigured) {
    return (
      <PageTransition>
        <main className="min-h-screen px-6 py-12 max-w-md mx-auto">
          <h1 className="font-serif text-2xl mb-8 text-center">Account</h1>
          <div className="text-center">
            <div className="mb-6 w-16 h-16 mx-auto rounded-full bg-foreground/5 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-foreground/30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="body-text text-foreground/60">
              Account sync is not configured.
            </p>
            <p className="body-text text-sm text-foreground/40 mt-2">
              Your data is stored locally on this device.
            </p>
          </div>
        </main>
      </PageTransition>
    );
  }

  // Signed out state
  if (!user) {
    return (
      <PageTransition>
        <main className="min-h-screen px-6 py-12 max-w-md mx-auto">
          <h1 className="font-serif text-2xl mb-8 text-center">Account</h1>

          <div className="text-center">
            {/* User icon */}
            <div className="mb-6 w-16 h-16 mx-auto rounded-full bg-foreground/5 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-foreground/30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>

            <h2 className="font-serif text-xl text-foreground/80 mb-3">
              Sign in to sync
            </h2>

            <p className="body-text text-foreground/60 text-sm mb-8 leading-relaxed">
              Create an account to sync your reflections across devices and never lose your progress.
            </p>

            <a
              href="/account/signin"
              className="inline-block btn-primary py-3 px-8 bg-foreground text-background font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Sign in with email
            </a>

            <p className="body-text text-xs text-foreground/40 mt-6">
              Your local data will be preserved.
            </p>
          </div>
        </main>
      </PageTransition>
    );
  }

  // Signed in state
  return (
    <PageTransition>
      <main className="min-h-screen px-6 py-12 max-w-md mx-auto">
        <h1 className="font-serif text-2xl mb-8 text-center">Account</h1>

        <div className="space-y-8">
          {/* User info */}
          <div className="text-center">
            {/* Avatar circle with initial */}
            <div className="mb-4 w-16 h-16 mx-auto rounded-full bg-foreground/10 flex items-center justify-center">
              <span className="font-serif text-2xl text-foreground/60">
                {user.email?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>

            <p className="body-text text-foreground/80 font-medium">
              {user.email}
            </p>

            <p className="body-text text-xs text-foreground/40 mt-1">
              Signed in
            </p>
          </div>

          {/* Sync status */}
          <div className="p-4 bg-foreground/5 rounded-lg">
            <div className="flex items-center gap-2 justify-center">
              <svg
                className="w-4 h-4 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="body-text text-sm text-foreground/70">
                Your data syncs across devices
              </span>
            </div>
          </div>

          {/* Sign out button */}
          <div className="pt-4">
            <SignOutButton />
          </div>
        </div>
      </main>
    </PageTransition>
  );
}

function SignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsSigningOut(false);
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="w-full py-3 px-6 border border-foreground/20 text-foreground/70 font-medium rounded-lg
                 hover:border-foreground/40 hover:text-foreground/90 transition-colors
                 disabled:opacity-50 disabled:cursor-not-allowed body-text"
    >
      {isSigningOut ? 'Signing out...' : 'Sign out'}
    </button>
  );
}
