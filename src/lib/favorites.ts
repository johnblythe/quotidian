import { db } from '@/lib/db';
import { recordSignal } from '@/lib/signals';
import type { FavoriteQuote } from '@/types';

/**
 * Add a quote to favorites
 * Records 'favorite' signal (weight: +3)
 */
export async function addFavorite(quoteId: string): Promise<void> {
  // Check if already favorited
  const existing = await db.favorites.where('quoteId').equals(quoteId).first();
  if (existing) return;

  await db.favorites.add({
    quoteId,
    savedAt: new Date(),
  });

  // Record favorite signal for algorithm
  await recordSignal(quoteId, 'favorite');
}

/**
 * Remove a quote from favorites
 * Records 'unfavorited' signal (weight: -2)
 */
export async function removeFavorite(quoteId: string): Promise<void> {
  await db.favorites.where('quoteId').equals(quoteId).delete();

  // Record unfavorited signal for algorithm
  await recordSignal(quoteId, 'unfavorited');
}

/**
 * Check if a quote is favorited
 */
export async function isFavorite(quoteId: string): Promise<boolean> {
  const favorite = await db.favorites.where('quoteId').equals(quoteId).first();
  return !!favorite;
}

/**
 * Get all favorite quotes
 */
export async function getFavorites(): Promise<FavoriteQuote[]> {
  return db.favorites.orderBy('savedAt').reverse().toArray();
}
