/**
 * Core type definitions for Quotidian app
 */

/** A philosophical quote with attribution */
export interface Quote {
  id: string;
  text: string;
  author: string;
  source?: string;
  context?: string;
}

/** A user's journal reflection on a quote */
export interface JournalEntry {
  id?: number;
  quoteId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

/** User preferences and settings */
export interface UserPreferences {
  id?: number;
  name: string;
  notificationTime: string; // HH:MM format
  onboardedAt: Date;
}

/** A quote saved to favorites */
export interface FavoriteQuote {
  id?: number;
  quoteId: string;
  savedAt: Date;
}

/** Record of a quote being shown to the user */
export interface QuoteHistory {
  id?: number;
  quoteId: string;
  shownAt: Date;
  freshPull: boolean; // true if user requested "another quote"
}
