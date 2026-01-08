import Dexie, { type EntityTable } from 'dexie';
import type { JournalEntry, UserPreferences, FavoriteQuote, QuoteHistory } from '@/types';

/**
 * Quotidian IndexedDB database using Dexie
 */
class QuotidianDB extends Dexie {
  preferences!: EntityTable<UserPreferences, 'id'>;
  journalEntries!: EntityTable<JournalEntry, 'id'>;
  favorites!: EntityTable<FavoriteQuote, 'id'>;
  quoteHistory!: EntityTable<QuoteHistory, 'id'>;

  constructor() {
    super('QuotidianDB');

    this.version(1).stores({
      preferences: '++id',
      journalEntries: '++id, quoteId, updatedAt',
      favorites: '++id, quoteId, savedAt',
      quoteHistory: '++id, quoteId, shownAt',
    });
  }
}

/** Singleton database instance */
export const db = new QuotidianDB();
