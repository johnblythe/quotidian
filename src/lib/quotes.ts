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

/**
 * Get all unique authors
 */
export function getAllAuthors(): string[] {
  const authors = new Set(quotes.map(q => q.author));
  return Array.from(authors);
}

/**
 * Get a random author
 */
export function getRandomAuthor(): string {
  const authors = getAllAuthors();
  return authors[Math.floor(Math.random() * authors.length)];
}

/**
 * Get quotes by a specific author
 */
export function getQuotesByAuthor(author: string): Quote[] {
  return quotes.filter(q => q.author === author);
}

/**
 * Get today's quote from a specific author - deterministic based on date
 */
export function getTodaysQuoteByAuthor(author: string): Quote {
  const authorQuotes = getQuotesByAuthor(author);
  if (authorQuotes.length === 0) {
    return getTodaysQuote(); // Fallback
  }

  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash += dateString.charCodeAt(i);
  }

  const index = hash % authorQuotes.length;
  return authorQuotes[index];
}

/**
 * Get a random quote from a specific author
 */
export function getRandomQuoteByAuthor(author: string, excludeId?: string): Quote {
  let authorQuotes = getQuotesByAuthor(author);

  if (excludeId) {
    authorQuotes = authorQuotes.filter(q => q.id !== excludeId);
  }

  if (authorQuotes.length === 0) {
    // Fallback: get any quote from this author
    authorQuotes = getQuotesByAuthor(author);
    if (authorQuotes.length === 0) {
      return getRandomQuote(excludeId); // Final fallback
    }
  }

  return authorQuotes[Math.floor(Math.random() * authorQuotes.length)];
}
