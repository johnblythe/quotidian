import { db } from './db';
import type { UserJourney, JourneyType } from '@/types';

/**
 * Get the currently active journey (if any)
 * An active journey has no completedAt date
 */
export async function getActiveJourney(): Promise<UserJourney | undefined> {
  return db.journeys.filter((j) => !j.completedAt).first();
}

/**
 * Check if a journey is currently active
 */
export async function hasActiveJourney(): Promise<boolean> {
  const active = await getActiveJourney();
  return active !== undefined;
}

/**
 * Start a new preset journey (from journeys.json)
 * Creates a journey record with day = 1 and empty quotesShown
 */
export async function startJourney(journeyId: string): Promise<void> {
  await db.journeys.add({
    journeyId,
    type: 'preset',
    startedAt: new Date(),
    day: 1,
    quotesShown: [],
  });
}

/**
 * Start a new collection-based journey
 * Creates a journey record with type='collection' and linked collectionId
 */
export async function startCollectionJourney(collectionId: string, duration: number): Promise<void> {
  await db.journeys.add({
    journeyId: `collection-${collectionId}`,
    type: 'collection',
    collectionId,
    startedAt: new Date(),
    day: 1,
    quotesShown: [],
  });
}

/**
 * Check if the active journey is a collection-based journey
 */
export async function isCollectionJourney(): Promise<boolean> {
  const active = await getActiveJourney();
  return active?.type === 'collection';
}

/**
 * Get the type of the active journey
 */
export async function getActiveJourneyType(): Promise<JourneyType | undefined> {
  const active = await getActiveJourney();
  return active?.type;
}

/**
 * Delete the active journey (for exit flow)
 */
export async function deleteActiveJourney(): Promise<void> {
  const active = await getActiveJourney();
  if (active?.id) {
    await db.journeys.delete(active.id);
  }
}

/**
 * Mark the active journey as completed
 */
export async function completeActiveJourney(): Promise<void> {
  const active = await getActiveJourney();
  if (active?.id) {
    await db.journeys.update(active.id, { completedAt: new Date() });
  }
}

/**
 * Advance the journey to the next day
 */
export async function advanceJourneyDay(): Promise<void> {
  const active = await getActiveJourney();
  if (active?.id) {
    await db.journeys.update(active.id, { day: active.day + 1 });
  }
}

/**
 * Add a quote to the journey's quotesShown array
 */
export async function addQuoteToJourney(quoteId: string): Promise<void> {
  const active = await getActiveJourney();
  if (active?.id) {
    await db.journeys.update(active.id, {
      quotesShown: [...active.quotesShown, quoteId],
    });
  }
}

/**
 * Get all completed journeys
 */
export async function getCompletedJourneys(): Promise<UserJourney[]> {
  return db.journeys.filter((j) => j.completedAt !== undefined).toArray();
}
