/**
 * Supabase database types for sync operations
 * Mirrors the schema defined in supabase/migrations/001_initial_schema.sql
 */

/** Preferences row in Supabase */
export interface SupabasePreferences {
  id: string;
  user_id: string;
  name: string;
  notification_time: string;
  onboarded_at: string;
  algorithm_enabled_at: string | null;
  personalization_celebrated: boolean;
  last_timing_calculation_date: string | null;
  digest_enabled: boolean;
  created_at: string;
  updated_at: string;
}

/** Journal entry row in Supabase */
export interface SupabaseJournalEntry {
  id: string;
  user_id: string;
  quote_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

/** Favorite row in Supabase */
export interface SupabaseFavorite {
  id: string;
  user_id: string;
  quote_id: string;
  saved_at: string;
}

/** Quote history row in Supabase */
export interface SupabaseQuoteHistory {
  id: string;
  user_id: string;
  quote_id: string;
  shown_at: string;
  fresh_pull: boolean;
}

/** Signal row in Supabase */
export interface SupabaseSignal {
  id: string;
  user_id: string;
  quote_id: string;
  signal: string;
  timestamp: string;
  themes: string[];
}

/** Insert types (without id/user_id which are auto-set) */
export type SupabasePreferencesInsert = Omit<SupabasePreferences, 'id' | 'created_at' | 'updated_at'>;
export type SupabaseJournalEntryInsert = Omit<SupabaseJournalEntry, 'id' | 'created_at' | 'updated_at'>;
export type SupabaseFavoriteInsert = Omit<SupabaseFavorite, 'id'>;
export type SupabaseQuoteHistoryInsert = Omit<SupabaseQuoteHistory, 'id'>;
export type SupabaseSignalInsert = Omit<SupabaseSignal, 'id'>;
