import { db } from '@/lib/db';
import type { FavoriteQuote } from '@/types';

/**
 * Add a quote to favorites
 */
export async function addFavorite(quoteId: string): Promise<void> {
  // Check if already favorited
  const existing = await db.favorites.where('quoteId').equals(quoteId).first();
  if (existing) return;

  await db.favorites.add({
    quoteId,
    savedAt: new Date(),
  });
}

/**
 * Remove a quote from favorites
 */
export async function removeFavorite(quoteId: string): Promise<void> {
  await db.favorites.where('quoteId').equals(quoteId).delete();
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
