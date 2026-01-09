/**
 * Core type definitions for Quotidian app
 */

/** Theme categories for philosophical quotes */
export type Theme =
  | 'adversity'
  | 'death'
  | 'discipline'
  | 'joy'
  | 'relationships'
  | 'work'
  | 'identity'
  | 'time'
  | 'wisdom'
  | 'simplicity';

/** A philosophical quote with attribution */
export interface Quote {
  id: string;
  text: string;
  author: string;
  source?: string;
  context?: string;
  themes?: Theme[];
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
  algorithmEnabledAt?: Date; // Date when personalization algorithm was enabled
  personalizationCelebrated?: boolean; // True after showing "personalization unlocked" message
  lastTimingCalculationDate?: string; // YYYY-MM-DD of last weekly timing recalculation
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

/** Signal types for tracking user behavior */
export type SignalType =
  | 'favorite'
  | 'reflected'
  | 'reflected_long'
  | 'viewed'
  | 'another'
  | 'unfavorited';

/** User behavior signal for algorithm learning */
export interface Signal {
  id?: number;
  quoteId: string;
  signal: SignalType;
  timestamp: Date;
  themes: Theme[];
}

/** Theme affinity score for algorithm */
export interface ThemeAffinity {
  theme: Theme;
  score: number;
}

/** User's active or completed journey */
export interface UserJourney {
  id?: number;
  journeyId: string; // References journey definition ID
  startedAt: Date;
  completedAt?: Date; // Undefined until journey completes
  day: number; // Current day in the journey (1-indexed)
  quotesShown: string[]; // Array of quote IDs shown during this journey
}

/** Journey definition for curated quote sequences */
export interface JourneyDefinition {
  id: string;
  title: string;
  description: string;
  emoji: string;
  duration: number; // Number of days
  filterType: 'author' | 'authors' | 'theme';
  filterValue: string | string[]; // Author name(s) or theme
}

/** Daily engagement record for smart timing */
export interface Engagement {
  id?: number;
  date: string; // YYYY-MM-DD format
  openedAt: Date; // First time app was opened this day
  engagedAt?: Date; // When user favorited or reflected (if they did)
}
