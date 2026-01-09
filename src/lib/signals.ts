import { db } from './db';
import { getQuoteById } from './quotes';
import type { SignalType, Theme, ThemeAffinity } from '@/types';

/**
 * Signal weights for algorithm scoring
 * Positive = engagement indicator
 * Negative = disengagement indicator
 */
export const SIGNAL_WEIGHTS: Record<SignalType, number> = {
  favorite: 3,
  unfavorited: -2,
  reflected: 2,
  reflected_long: 3,
  another: -1,
  viewed: 0,
};

/**
 * Record a user behavior signal for algorithm learning
 * Captures the quote's themes at signal time for affinity calculation
 */
export async function recordSignal(
  quoteId: string,
  signal: SignalType
): Promise<void> {
  // Get quote themes (fallback to empty array if quote not found)
  const quote = getQuoteById(quoteId);
  const themes: Theme[] = quote?.themes ?? [];

  await db.signals.add({
    quoteId,
    signal,
    timestamp: new Date(),
    themes,
  });
}

/**
 * Get all signals for a specific quote
 */
export async function getSignalsForQuote(quoteId: string) {
  return db.signals.where('quoteId').equals(quoteId).toArray();
}

/**
 * Get all signals (for algorithm calculations)
 */
export async function getAllSignals() {
  return db.signals.toArray();
}

/**
 * Get signal count (for cold start detection)
 */
export async function getSignalCount(): Promise<number> {
  return db.signals.count();
}

/**
 * Calculate theme affinity scores from all recorded signals
 * Aggregates signal weights by theme and returns sorted list
 * @returns Sorted array of themes with scores (highest first), empty if no signals
 */
export async function getThemeAffinities(): Promise<ThemeAffinity[]> {
  const signals = await getAllSignals();

  // Handle case with no signals
  if (signals.length === 0) {
    return [];
  }

  // Aggregate weights by theme
  const themeScores = new Map<Theme, number>();

  for (const signal of signals) {
    const weight = SIGNAL_WEIGHTS[signal.signal];

    for (const theme of signal.themes) {
      const currentScore = themeScores.get(theme) ?? 0;
      themeScores.set(theme, currentScore + weight);
    }
  }

  // Convert to array and sort by score (highest first)
  const affinities: ThemeAffinity[] = Array.from(themeScores.entries()).map(
    ([theme, score]) => ({ theme, score })
  );

  affinities.sort((a, b) => b.score - a.score);

  return affinities;
}
