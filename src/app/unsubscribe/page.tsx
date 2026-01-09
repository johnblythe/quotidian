'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageTransition } from '@/components/PageTransition';
import { isValidUnsubscribeToken } from '@/lib/unsubscribe';

type Status = 'loading' | 'success' | 'error' | 'invalid';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    async function processUnsubscribe() {
      // Validate token is present and properly formatted
      if (!token) {
        setStatus('invalid');
        setErrorMessage('Missing unsubscribe token.');
        return;
      }

      if (!isValidUnsubscribeToken(token)) {
        setStatus('invalid');
        setErrorMessage('Invalid unsubscribe link.');
        return;
      }

      // Call the API to unsubscribe
      try {
        const response = await fetch('/api/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage(data.error || 'Failed to unsubscribe.');
        }
      } catch {
        setStatus('error');
        setErrorMessage('Something went wrong. Please try again.');
      }
    }

    processUnsubscribe();
  }, [token]);

  return (
    <>
      <h1 className="font-serif text-2xl mb-8 text-center">
        {status === 'loading' && 'Unsubscribing...'}
        {status === 'success' && 'Unsubscribed'}
        {status === 'error' && 'Error'}
        {status === 'invalid' && 'Invalid Link'}
      </h1>

      <div className="text-center">
        {/* Loading state */}
        {status === 'loading' && (
          <>
            <div className="mb-6 w-16 h-16 mx-auto rounded-full bg-foreground/5 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-foreground/30 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <p className="body-text text-foreground/60">
              Processing your request...
            </p>
          </>
        )}

        {/* Success state */}
        {status === 'success' && (
          <>
            <div className="mb-6 w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
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
            </div>
            <p className="body-text text-foreground/80 mb-4">
              You&apos;ve been unsubscribed from the weekly digest.
            </p>
            <p className="body-text text-sm text-foreground/50 mb-8">
              You won&apos;t receive any more digest emails. You can re-enable
              the digest anytime in the app settings.
            </p>
            <a
              href="/"
              className="inline-block py-3 px-8 bg-foreground text-background font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Back to Quotidian
            </a>
          </>
        )}

        {/* Error state */}
        {status === 'error' && (
          <>
            <div className="mb-6 w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
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
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="body-text text-foreground/80 mb-2">
              {errorMessage}
            </p>
            <p className="body-text text-sm text-foreground/50 mb-8">
              Please try again or disable the digest in your app settings.
            </p>
            <a
              href="/settings"
              className="inline-block py-3 px-8 border border-foreground/20 text-foreground/70 font-medium rounded-lg hover:border-foreground/40 hover:text-foreground/90 transition-colors"
            >
              Go to Settings
            </a>
          </>
        )}

        {/* Invalid token state */}
        {status === 'invalid' && (
          <>
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
            <p className="body-text text-foreground/80 mb-2">
              {errorMessage}
            </p>
            <p className="body-text text-sm text-foreground/50 mb-8">
              This link may have expired or been used already.
            </p>
            <a
              href="/settings"
              className="inline-block py-3 px-8 border border-foreground/20 text-foreground/70 font-medium rounded-lg hover:border-foreground/40 hover:text-foreground/90 transition-colors"
            >
              Manage in Settings
            </a>
          </>
        )}
      </div>
    </>
  );
}

function LoadingFallback() {
  return (
    <>
      <h1 className="font-serif text-2xl mb-8 text-center">Unsubscribing...</h1>
      <div className="text-center">
        <div className="mb-6 w-16 h-16 mx-auto rounded-full bg-foreground/5 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-foreground/30 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <p className="body-text text-foreground/60">Loading...</p>
      </div>
    </>
  );
}

export default function UnsubscribePage() {
  return (
    <PageTransition>
      <main className="min-h-screen px-6 py-12 max-w-md mx-auto flex flex-col items-center justify-center">
        <Suspense fallback={<LoadingFallback />}>
          <UnsubscribeContent />
        </Suspense>
      </main>
    </PageTransition>
  );
}
