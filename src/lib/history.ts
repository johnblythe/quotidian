import { db } from '@/lib/db';
import { recordSignal } from '@/lib/signals';
import type { QuoteHistory } from '@/types';

/**
 * Record a quote being shown to the user
 * Records 'viewed' signal (weight: 0) for algorithm tracking
 */
export async function recordQuoteShown(quoteId: string, freshPull: boolean = false): Promise<void> {
  await db.quoteHistory.add({
    quoteId,
    shownAt: new Date(),
    freshPull,
  });

  // Record viewed signal for algorithm (only for non-fresh pulls to avoid duplicates)
  if (!freshPull) {
    await recordSignal(quoteId, 'viewed');
  }
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
 * Records 'another' signal for the rejected quote (weight: -1)
 * @param newQuoteId - The new quote being shown
 * @param rejectedQuoteId - The quote user rejected (optional, for signal recording)
 */
export async function incrementFreshPulls(newQuoteId: string, rejectedQuoteId?: string): Promise<void> {
  await recordQuoteShown(newQuoteId, true);

  // Record 'another' signal for the rejected quote
  if (rejectedQuoteId) {
    await recordSignal(rejectedQuoteId, 'another');
  }
}

/**
 * Check if user can get another quote today (max 3 per day)
 */
export async function canGetAnother(): Promise<boolean> {
  const pullsToday = await getFreshPullsToday();
  return pullsToday < 3;
}
