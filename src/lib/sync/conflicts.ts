/**
 * Conflict resolution module for sync operations
 * Implements last-write-wins strategy with logging for debugging
 */

export interface ConflictRecord {
  type: 'preferences' | 'journal' | 'favorites' | 'history';
  key: string;
  localUpdatedAt: Date | null;
  remoteUpdatedAt: Date | null;
  winner: 'local' | 'remote';
  timestamp: Date;
}

// In-memory log of recent conflicts (for debugging)
// Kept small to avoid memory issues
const MAX_CONFLICT_LOG_SIZE = 100;
const conflictLog: ConflictRecord[] = [];

/**
 * Log a conflict resolution for debugging
 */
function logConflict(record: ConflictRecord): void {
  // Add to in-memory log
  conflictLog.push(record);

  // Trim log if it gets too large
  if (conflictLog.length > MAX_CONFLICT_LOG_SIZE) {
    conflictLog.shift();
  }

  // Console log for debugging
  console.debug(
    `[Sync Conflict] ${record.type}:${record.key} - Winner: ${record.winner}`,
    {
      localUpdatedAt: record.localUpdatedAt?.toISOString() ?? 'null',
      remoteUpdatedAt: record.remoteUpdatedAt?.toISOString() ?? 'null',
    }
  );
}

/**
 * Compare two timestamps and determine winner using last-write-wins
 * Returns 'local' if local is newer or same age, 'remote' if remote is newer
 * Also logs the conflict for debugging
 */
export function resolveConflict(options: {
  type: ConflictRecord['type'];
  key: string;
  localUpdatedAt: Date | null;
  remoteUpdatedAt: Date | null;
}): 'local' | 'remote' {
  const { type, key, localUpdatedAt, remoteUpdatedAt } = options;

  let winner: 'local' | 'remote';

  // If no local timestamp, remote wins
  if (!localUpdatedAt) {
    winner = 'remote';
  }
  // If no remote timestamp, local wins
  else if (!remoteUpdatedAt) {
    winner = 'local';
  }
  // Compare timestamps - remote wins if strictly newer
  else if (remoteUpdatedAt > localUpdatedAt) {
    winner = 'remote';
  }
  // Local wins if same or newer
  else {
    winner = 'local';
  }

  // Log the conflict
  logConflict({
    type,
    key,
    localUpdatedAt,
    remoteUpdatedAt,
    winner,
    timestamp: new Date(),
  });

  return winner;
}

/**
 * Get the conflict log (for debugging)
 * Returns a copy to prevent external mutation
 */
export function getConflictLog(): ConflictRecord[] {
  return [...conflictLog];
}

/**
 * Clear the conflict log (for testing)
 */
export function clearConflictLog(): void {
  conflictLog.length = 0;
}

/**
 * Get a summary of recent conflicts
 */
export function getConflictSummary(): {
  total: number;
  byType: Record<string, number>;
  byWinner: { local: number; remote: number };
} {
  const byType: Record<string, number> = {};
  const byWinner = { local: 0, remote: 0 };

  for (const record of conflictLog) {
    byType[record.type] = (byType[record.type] || 0) + 1;
    byWinner[record.winner]++;
  }

  return {
    total: conflictLog.length,
    byType,
    byWinner,
  };
}
