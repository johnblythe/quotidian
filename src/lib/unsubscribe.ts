/**
 * Unsubscribe token utilities
 *
 * Simple token encoding/decoding for email unsubscribe links.
 * Uses base64-encoded user ID for simplicity.
 * In production, consider using signed JWTs with expiration.
 */

/**
 * Generate an unsubscribe token from a user ID
 * @param userId - The Supabase user ID
 * @returns Base64-encoded token
 */
export function generateUnsubscribeToken(userId: string): string {
  // Use Buffer in Node.js (server), btoa in browser
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(userId).toString('base64');
  }
  return btoa(userId);
}

/**
 * Decode an unsubscribe token to get the user ID
 * @param token - The base64-encoded token
 * @returns The decoded user ID, or null if invalid
 */
export function decodeUnsubscribeToken(token: string): string | null {
  try {
    // Use Buffer in Node.js (server), atob in browser
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(token, 'base64').toString('utf-8');
    }
    return atob(token);
  } catch {
    return null;
  }
}

/**
 * Validate that a token decodes to a valid UUID format
 * @param token - The base64-encoded token
 * @returns True if token decodes to a valid UUID
 */
export function isValidUnsubscribeToken(token: string): boolean {
  const userId = decodeUnsubscribeToken(token);
  if (!userId) return false;

  // Check if it looks like a UUID (Supabase user IDs are UUIDs)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(userId);
}
