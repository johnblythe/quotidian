'use client';

import { useState, useEffect } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isSupabaseConfigured: boolean;
  isSignedIn: boolean;
}

/**
 * Hook to track authentication state throughout the app
 * Returns user, loading state, and configuration status
 */
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      const isConfigured = isSupabaseConfigured();

      if (mounted) {
        setConfigured(isConfigured);
      }

      if (!isConfigured) {
        if (mounted) {
          setIsLoading(false);
        }
        return;
      }

      const supabase = getSupabase();
      if (!supabase) {
        if (mounted) {
          setIsLoading(false);
        }
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (mounted) {
        setUser(user);
        setIsLoading(false);
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    user,
    isLoading,
    isSupabaseConfigured: configured,
    isSignedIn: Boolean(user),
  };
}
