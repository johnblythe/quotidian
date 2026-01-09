'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleAuthCallback() {
      const supabase = getSupabase();
      if (!supabase) {
        setError('Unable to connect to auth service');
        return;
      }

      // Supabase handles the token exchange from URL hash automatically
      // We just need to check if it succeeded
      const { data: { session }, error: authError } = await supabase.auth.getSession();

      if (authError) {
        setError(authError.message);
        return;
      }

      if (session) {
        // Success - redirect to account page
        router.replace('/account');
      } else {
        // No session yet - might be loading or error
        // Try getting URL hash params manually
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorDesc = hashParams.get('error_description');
        if (errorDesc) {
          setError(errorDesc);
        } else {
          // Give it a moment then redirect anyway
          setTimeout(() => router.replace('/account'), 1000);
        }
      }
    }

    handleAuthCallback();
  }, [router]);

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="mb-6 w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="font-serif text-xl mb-4">Sign in failed</h1>
          <p className="body-text text-foreground/60 mb-6">{error}</p>
          <a
            href="/account/signin"
            className="inline-block py-3 px-6 bg-foreground text-background font-medium rounded-lg hover:opacity-90 transition-opacity body-text"
          >
            Try again
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center">
        {/* Spinner */}
        <div className="mb-4 w-8 h-8 mx-auto border-2 border-foreground/20 border-t-foreground/60 rounded-full animate-spin" />
        <p className="body-text text-foreground/60">Signing you in...</p>
      </div>
    </main>
  );
}
