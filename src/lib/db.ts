import Dexie, { type EntityTable } from 'dexie';
import type { JournalEntry, UserPreferences, FavoriteQuote, QuoteHistory, Signal } from '@/types';

/**
 * Quotidian IndexedDB database using Dexie
 */
class QuotidianDB extends Dexie {
  preferences!: EntityTable<UserPreferences, 'id'>;
  journalEntries!: EntityTable<JournalEntry, 'id'>;
  favorites!: EntityTable<FavoriteQuote, 'id'>;
  quoteHistory!: EntityTable<QuoteHistory, 'id'>;
  signals!: EntityTable<Signal, 'id'>;

  constructor() {
    super('QuotidianDB');

    this.version(1).stores({
      preferences: '++id',
      journalEntries: '++id, quoteId, updatedAt',
      favorites: '++id, quoteId, savedAt',
      quoteHistory: '++id, quoteId, shownAt',
    });

    this.version(2).stores({
      preferences: '++id',
      journalEntries: '++id, quoteId, updatedAt',
      favorites: '++id, quoteId, savedAt',
      quoteHistory: '++id, quoteId, shownAt',
      signals: '++id, quoteId, signal, timestamp',
    });
  }
}

/** Singleton database instance */
export const db = new QuotidianDB();
