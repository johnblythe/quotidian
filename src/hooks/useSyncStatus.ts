/**
 * Hook for tracking sync status and pending operations
 */

import { useState, useEffect, useCallback } from 'react';
import { getPendingSyncCount, setupSyncListeners, processPendingSyncs, isOnline } from '@/lib/sync/queue';
import { useAuth } from './useAuth';

interface SyncStatus {
  /** Whether the browser is online */
  online: boolean;
  /** Number of pending sync operations */
  pendingCount: number;
  /** Whether a sync is currently in progress */
  syncing: boolean;
  /** Trigger a manual sync of pending operations */
  syncNow: () => Promise<void>;
  /** Refresh the pending count */
  refreshCount: () => Promise<void>;
}

/**
 * Track sync status and pending operations
 * Shows indicator when there are unsynced changes
 */
export function useSyncStatus(): SyncStatus {
  const { isSignedIn, isSupabaseConfigured } = useAuth();
  const [online, setOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refreshCount = useCallback(async () => {
    const count = await getPendingSyncCount();
    setPendingCount(count);
  }, []);

  const syncNow = useCallback(async () => {
    if (!online || !isSignedIn || !isSupabaseConfigured) return;

    setSyncing(true);
    try {
      await processPendingSyncs();
      await refreshCount();
    } finally {
      setSyncing(false);
    }
  }, [online, isSignedIn, isSupabaseConfigured, refreshCount]);

  // Set up online/offline listeners and sync queue processor
  useEffect(() => {
    // Initial state
    setOnline(isOnline());
    refreshCount();

    // Online/offline event handlers
    const handleOnline = () => {
      setOnline(true);
      // Process pending syncs when coming back online
      if (isSignedIn && isSupabaseConfigured) {
        syncNow();
      }
    };

    const handleOffline = () => {
      setOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up the sync queue listeners (logs to console)
    const cleanupSyncListeners = setupSyncListeners();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      cleanupSyncListeners();
    };
  }, [isSignedIn, isSupabaseConfigured, refreshCount, syncNow]);

  // Refresh pending count periodically and on auth changes
  useEffect(() => {
    refreshCount();

    // Refresh every 30 seconds
    const interval = setInterval(refreshCount, 30000);

    return () => clearInterval(interval);
  }, [refreshCount, isSignedIn]);

  return {
    online,
    pendingCount,
    syncing,
    syncNow,
    refreshCount,
  };
}
