/**
 * Quote selection logic for Quotidian
 */

import type { Quote } from '@/types';
import quotesData from '@/data/quotes.json';

// Type assertion since JSON import doesn't infer Quote[]
const quotes: Quote[] = quotesData as Quote[];

/**
 * Get today's quote - deterministic based on current date
 * Uses a simple hash of the date to select consistently
 */
export function getTodaysQuote(): Quote {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  // Simple hash: sum of char codes
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash += dateString.charCodeAt(i);
  }

  const index = hash % quotes.length;
  return quotes[index];
}

/**
 * Get a random quote, optionally excluding a specific quote ID
 */
export function getRandomQuote(excludeId?: string): Quote {
  const available = excludeId
    ? quotes.filter(q => q.id !== excludeId)
    : quotes;

  if (available.length === 0) {
    // Fallback: return any quote if all are excluded
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  const index = Math.floor(Math.random() * available.length);
  return available[index];
}

/**
 * Get all quotes (for archive/lookup purposes)
 */
export function getAllQuotes(): Quote[] {
  return quotes;
}

/**
 * Get a quote by ID
 */
export function getQuoteById(id: string): Quote | undefined {
  return quotes.find(q => q.id === id);
}
