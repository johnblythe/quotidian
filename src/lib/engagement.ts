import { db } from '@/lib/db';

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Record that the app was opened today
 * Creates a new engagement record if none exists for today
 * One record per day (upsert by date)
 */
export async function recordAppOpen(): Promise<void> {
  const today = getTodayDateString();
  const existing = await db.engagements.where('date').equals(today).first();

  if (!existing) {
    await db.engagements.add({
      date: today,
      openedAt: new Date(),
    });
  }
  // If already exists, don't update openedAt (we want first open time)
}

/**
 * Record that the user engaged (favorited or reflected) today
 * Updates the engagedAt timestamp for today's record
 */
export async function recordEngagement(): Promise<void> {
  const today = getTodayDateString();
  const existing = await db.engagements.where('date').equals(today).first();

  if (existing && existing.id !== undefined) {
    // Only update if not already set (capture first engagement time)
    if (!existing.engagedAt) {
      await db.engagements.update(existing.id, {
        engagedAt: new Date(),
      });
    }
  } else {
    // Edge case: engagement happened before app open was recorded
    await db.engagements.add({
      date: today,
      openedAt: new Date(),
      engagedAt: new Date(),
    });
  }
}

/**
 * Get all engagement records
 */
export async function getAllEngagements() {
  return db.engagements.toArray();
}

/**
 * Get engagement records for the last N days
 */
export async function getRecentEngagements(days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  return db.engagements
    .where('date')
    .aboveOrEqual(cutoffStr)
    .toArray();
}

/**
 * Calculate the optimal notification time based on user engagement patterns
 * Averages the engagement times from the last 7 days
 * @returns Formatted time string (HH:MM) or null if insufficient data
 */
export async function calculateOptimalTime(): Promise<string | null> {
  const engagements = await getRecentEngagements(7);

  // Filter to only engagements where the user actually engaged (favorited or reflected)
  const engagementsWithActivity = engagements.filter(e => e.engagedAt);

  // Require at least 3 days of engagement data for a meaningful average
  if (engagementsWithActivity.length < 3) {
    return null;
  }

  // Calculate average time of day in minutes from midnight
  let totalMinutes = 0;
  for (const engagement of engagementsWithActivity) {
    const engagedAt = new Date(engagement.engagedAt!);
    const minutesFromMidnight = engagedAt.getHours() * 60 + engagedAt.getMinutes();
    totalMinutes += minutesFromMidnight;
  }

  const averageMinutes = Math.round(totalMinutes / engagementsWithActivity.length);

  // Convert back to hours and minutes
  const hours = Math.floor(averageMinutes / 60);
  const minutes = averageMinutes % 60;

  // Format as HH:MM
  const hoursStr = hours.toString().padStart(2, '0');
  const minutesStr = minutes.toString().padStart(2, '0');

  return `${hoursStr}:${minutesStr}`;
}
