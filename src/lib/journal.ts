import { db } from './db';
import type { JournalEntry } from '@/types';

/**
 * Save or update a journal entry for a quote
 * Updates existing entry if present, creates new if not
 */
export async function saveJournalEntry(quoteId: string, content: string): Promise<void> {
  const existing = await db.journalEntries.where('quoteId').equals(quoteId).first();

  if (existing) {
    await db.journalEntries.update(existing.id!, {
      content,
      updatedAt: new Date(),
    });
  } else {
    await db.journalEntries.add({
      quoteId,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

/**
 * Get journal entry for a specific quote
 * Returns null if no entry exists
 */
export async function getJournalEntry(quoteId: string): Promise<JournalEntry | null> {
  const entry = await db.journalEntries.where('quoteId').equals(quoteId).first();
  return entry ?? null;
}

/**
 * Get recent journal entries, newest first
 * @param limit - Maximum number of entries to return (default 10)
 */
export async function getRecentEntries(limit: number = 10): Promise<JournalEntry[]> {
  return db.journalEntries
    .orderBy('updatedAt')
    .reverse()
    .limit(limit)
    .toArray();
}
