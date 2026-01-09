import { db } from './db';
import { getQuoteById, getAllQuotes } from './quotes';
import type { SignalType, Theme, ThemeAffinity, Quote } from '@/types';

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

/**
 * Get quote IDs shown within a date range
 * @param days - Number of days to look back
 * @returns Set of quote IDs shown in that period
 */
async function getQuoteIdsShownInDays(days: number): Promise<Set<string>> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const history = await db.quoteHistory
    .where('shownAt')
    .aboveOrEqual(cutoff)
    .toArray();

  return new Set(history.map(h => h.quoteId));
}

/**
 * Get authors that user has favorited quotes from
 * @returns Set of author names
 */
async function getFavoritedAuthors(): Promise<Set<string>> {
  const favorites = await db.favorites.toArray();
  const authors = new Set<string>();

  for (const fav of favorites) {
    const quote = getQuoteById(fav.quoteId);
    if (quote) {
      authors.add(quote.author);
    }
  }

  return authors;
}

/**
 * Get set of high-affinity themes (positive score)
 * @returns Set of themes with positive affinity scores
 */
async function getHighAffinityThemes(): Promise<Set<Theme>> {
  const affinities = await getThemeAffinities();
  return new Set(
    affinities
      .filter(a => a.score > 0)
      .map(a => a.theme)
  );
}

/**
 * Score a quote for weighted selection
 * @param quote - Quote to score
 * @param highAffinityThemes - Themes user prefers
 * @param favoritedAuthors - Authors user has favorited
 * @param shown60Days - Quote IDs shown in last 60 days
 */
function scoreQuote(
  quote: Quote,
  highAffinityThemes: Set<Theme>,
  favoritedAuthors: Set<string>,
  shown60Days: Set<string>
): number {
  // Base random score (0 to 1)
  let score = Math.random();

  // Theme bonus: +0.5 for each matching high-affinity theme
  const quoteThemes = quote.themes ?? [];
  for (const theme of quoteThemes) {
    if (highAffinityThemes.has(theme)) {
      score += 0.5;
    }
  }

  // Author bonus: +0.3 if user favorited quotes from same author
  if (favoritedAuthors.has(quote.author)) {
    score += 0.3;
  }

  // Recency penalty: -0.2 if shown in last 60 days
  if (shown60Days.has(quote.id)) {
    score -= 0.2;
  }

  return score;
}

/**
 * Select next quote using weighted algorithm
 * - Filters out quotes shown in last 30 days
 * - Scores remaining quotes with theme/author bonuses and recency penalty
 * - Returns highest scoring quote
 * @returns Selected quote, or random quote if no valid candidates
 */
export async function selectNextQuote(): Promise<Quote> {
  const allQuotes = getAllQuotes();

  // Get filtering and scoring data
  const [shown30Days, shown60Days, highAffinityThemes, favoritedAuthors] = await Promise.all([
    getQuoteIdsShownInDays(30),
    getQuoteIdsShownInDays(60),
    getHighAffinityThemes(),
    getFavoritedAuthors(),
  ]);

  // Filter out quotes shown in last 30 days
  const candidates = allQuotes.filter(q => !shown30Days.has(q.id));

  // If no candidates (all shown recently), fall back to all quotes
  if (candidates.length === 0) {
    const index = Math.floor(Math.random() * allQuotes.length);
    return allQuotes[index];
  }

  // Score each candidate
  let bestQuote = candidates[0];
  let bestScore = -Infinity;

  for (const quote of candidates) {
    const score = scoreQuote(quote, highAffinityThemes, favoritedAuthors, shown60Days);
    if (score > bestScore) {
      bestScore = score;
      bestQuote = quote;
    }
  }

  return bestQuote;
}
