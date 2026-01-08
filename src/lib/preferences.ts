import { db } from './db';
import type { UserPreferences } from '@/types';

/**
 * Save user preferences to IndexedDB
 * Updates existing record if present, creates new if not
 */
export async function savePreferences(prefs: Omit<UserPreferences, 'id' | 'onboardedAt'>): Promise<void> {
  const existing = await db.preferences.toCollection().first();

  if (existing) {
    await db.preferences.update(existing.id!, {
      name: prefs.name,
      notificationTime: prefs.notificationTime,
    });
  } else {
    await db.preferences.add({
      name: prefs.name,
      notificationTime: prefs.notificationTime,
      onboardedAt: new Date(),
    });
  }
}

/**
 * Get user preferences from IndexedDB
 * Returns null if not set (user hasn't onboarded)
 */
export async function getPreferences(): Promise<UserPreferences | null> {
  const prefs = await db.preferences.toCollection().first();
  return prefs ?? null;
}

/**
 * Check if user has completed onboarding
 */
export async function isOnboarded(): Promise<boolean> {
  const prefs = await getPreferences();
  return prefs !== null;
}
