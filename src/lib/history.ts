import { db } from '@/lib/db';
import type { QuoteHistory } from '@/types';

/**
 * Record a quote being shown to the user
 */
export async function recordQuoteShown(quoteId: string, freshPull: boolean = false): Promise<void> {
  await db.quoteHistory.add({
    quoteId,
    shownAt: new Date(),
    freshPull,
  });
}

/**
 * Get all quote history, newest first
 */
export async function getQuoteHistory(): Promise<QuoteHistory[]> {
  return await db.quoteHistory.orderBy('shownAt').reverse().toArray();
}

/**
 * Get start of today (midnight)
 */
function getTodayStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Get count of "another quote" pulls today
 */
export async function getFreshPullsToday(): Promise<number> {
  const todayStart = getTodayStart();

  const todayPulls = await db.quoteHistory
    .where('shownAt')
    .aboveOrEqual(todayStart)
    .filter(entry => entry.freshPull)
    .count();

  return todayPulls;
}

/**
 * Record a fresh pull (when user requests "another quote")
 */
export async function incrementFreshPulls(quoteId: string): Promise<void> {
  await recordQuoteShown(quoteId, true);
}

/**
 * Check if user can get another quote today (max 3 per day)
 */
export async function canGetAnother(): Promise<boolean> {
  const pullsToday = await getFreshPullsToday();
  return pullsToday < 3;
}
