# V1.0 Spec: Personalization

**Goal:** The app learns you. Smarter quotes, themed journeys, better timing.

---

## Algorithm: Quote Selection

### Approach
Weighted scoring + theme affinity. No ML, pure heuristics.

### Signal Weights
```typescript
interface UserSignal {
  quoteId: string;
  signal: SignalType;
  timestamp: Date;
  themes: Theme[];  // Inherit from quote
}

type SignalType =
  | 'favorite'           // +3
  | 'reflected'          // +2 (wrote anything)
  | 'reflected_long'     // +3 (500+ chars)
  | 'viewed'             // +0 (neutral)
  | 'another'            // -1 (skipped this one)
  | 'unfavorited';       // -2

// Theme affinity calculated from aggregated signals
interface ThemeAffinity {
  theme: Theme;
  score: number;  // Sum of signal weights for this theme
}
```

### Selection Logic
```
1. Get all quotes not shown in last 30 days
2. Score each quote:
   - Base score: random 0-1
   - Theme bonus: +0.5 for each matching high-affinity theme
   - Author bonus: +0.3 if favorited quotes from same author
   - Recency penalty: -0.2 if shown in last 60 days
3. Select highest scoring quote
4. Record as 'viewed' signal
```

### Cold Start
- First 14 days: pure random (building signal data)
- Day 15+: algorithm kicks in
- Show "Personalization unlocked!" message

---

## Journeys: Multi-Day Experiences

### Structure
Themed pools with daily random selection from pool.

```typescript
interface Journey {
  id: string;
  title: string;           // "7 Days with Seneca"
  description: string;     // "Wisdom on adversity and resilience"
  duration: number;        // 7
  filter: JourneyFilter;
  icon: string;            // "🏛️"
}

interface JourneyFilter {
  authors?: string[];      // ["Seneca"]
  themes?: Theme[];        // ["adversity", "discipline"]
}

interface ActiveJourney {
  journeyId: string;
  startedAt: Date;
  day: number;             // 1-7
  quotesShown: string[];   // Avoid repeats within journey
}
```

### Seed Journeys
| Journey | Duration | Filter |
|---------|----------|--------|
| 7 Days with Seneca | 7 | author: Seneca |
| Week of Stillness | 7 | author: Alan Watts |
| Stoic Fundamentals | 7 | authors: Marcus, Epictetus, Seneca |
| Facing Mortality | 5 | theme: death |
| Building Discipline | 7 | theme: discipline |
| Finding Joy | 5 | theme: joy |
| Naval on Wealth & Happiness | 7 | author: Naval |

### UX Flow
```
┌─────────────────────────────────────────┐
│  Settings > Journeys                    │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🏛️ 7 Days with Seneca           │   │
│  │ Wisdom on adversity             │   │
│  │                    [Start]      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🌊 Week of Stillness            │   │
│  │ Alan Watts on presence          │   │
│  │                    [Start]      │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

During journey, homepage shows:
┌─────────────────────────────────────────┐
│  Day 3 of 7: Seneca                     │
│  ─────────────────────────────          │
│  "Quote here..."                        │
│                                         │
│  [Exit Journey]                         │
└─────────────────────────────────────────┘
```

### Rules
- Only one active journey at a time
- Can exit anytime (confirmation dialog)
- Completing journey → celebration + badge in archive
- Journey quotes still count for algorithm signals

---

## Smart Timing

### Approach
Simple average of last 7 engagement times.

```typescript
interface EngagementRecord {
  date: Date;
  openedAt: Date;           // When they opened the app
  engagedAt?: Date;         // When they favorited or reflected
}

function calculateOptimalTime(records: EngagementRecord[]): string {
  const last7 = records.slice(-7);
  const times = last7.map(r => r.engagedAt || r.openedAt);
  const avgMinutes = average(times.map(t => t.getHours() * 60 + t.getMinutes()));
  return formatTime(avgMinutes);  // "08:30"
}
```

### UX
- Settings shows: "Suggested time: 8:30 AM (based on your habits)"
- User can accept suggestion or keep manual time
- Updates weekly (every Sunday recalculate)
- Notification: "We noticed you usually reflect around 8:30 AM. Update your notification time?"

---

## Data Model Updates

```typescript
// New tables for IndexedDB
interface SignalsTable {
  id: string;
  quoteId: string;
  signal: SignalType;
  timestamp: Date;
}

interface JourneysTable {
  id: string;           // visually formatted
  journeyId: string;
  startedAt: Date;
  completedAt?: Date;
  day: number;
  quotesShown: string[];
}

interface EngagementTable {
  date: string;         // "2026-01-08"
  openedAt: Date;
  engagedAt?: Date;
}
```

---

## User Stories (Ralph-able)

### Algorithm
- US-V01: Create signals table in IndexedDB
- US-V02: Record signals on user actions (favorite, reflect, another)
- US-V03: Calculate theme affinity scores from signals
- US-V04: Implement weighted quote selection algorithm
- US-V05: Add cold start logic (random for first 14 days)
- US-V06: Show "Personalization unlocked" message on day 15

### Journeys
- US-V07: Create journeys table in IndexedDB
- US-V08: Seed journey definitions (7 journeys)
- US-V09: Create Journeys page in settings
- US-V10: Implement start journey flow
- US-V11: Update homepage for active journey display
- US-V12: Implement exit journey flow with confirmation
- US-V13: Add journey completion celebration
- US-V14: Track completed journeys in archive

### Smart Timing
- US-V15: Create engagement table in IndexedDB
- US-V16: Record engagement times on app open
- US-V17: Calculate suggested notification time
- US-V18: Show suggestion in settings
- US-V19: Implement "accept suggestion" flow

---

## Open Questions

- Should journey progress persist if user misses a day? (Yes, pick up where left off)
- Cap on how much algorithm can weight one theme? (Prevent filter bubble)
- Show users their theme affinity? ("You love quotes on discipline")
