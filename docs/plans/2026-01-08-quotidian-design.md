# Quotidian - Daily Quote Reflection App

## Overview

A PWA for daily philosophical reflection. Beautiful typography, Medium-inspired aesthetic, local-first data.

**Core loop:** Daily push notification → View quote → Reflect/journal → Build personal archive

---

## User Flow

```
┌─────────────────────────────────────────────────────┐
│  First visit: "What should we call you?" → [John]   │
│  Pick notification time → [8:00 AM]                 │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│  Daily: Push notification arrives                   │
│  "Good morning, John. Today's reflection awaits."   │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│  Today's Quote (full-screen, beautiful typography)  │
│                                                     │
│  "We suffer more in imagination than in reality."   │
│                        — Seneca, Letters to Lucilius│
│                                                     │
│  [♡ Save]              [✎ Reflect]    [→ Another]   │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│  Reflection editor (Medium-style)                   │
│  Subtle placeholder: "What does this stir in you?"  │
│  Adapts: short → minimal | long → focused mode      │
└─────────────────────────────────────────────────────┘
```

---

## Architecture

- **Next.js 14** (App Router) + TypeScript
- **PWA** via next-pwa - installable, offline-capable
- **Local storage** - IndexedDB for journals, localStorage for preferences
- **Static JSON** - quote database ships with app
- **Vercel** deployment

### Key Pages

- `/` - Today's quote + reflect
- `/archive` - Past quotes & journal entries
- `/favorites` - Saved quotes
- `/settings` - Name, notification time

---

## Data Model

### Quote (seeded JSON)

```typescript
interface Quote {
  id: string;
  text: string;
  author: string;
  source?: string;        // "Letters to Lucilius, Letter 13"
  context?: string;       // "Written during Nero's reign..."
  dateAuthored?: string;  // "~65 AD"
}
```

### User Data (IndexedDB, local)

```typescript
interface UserPreferences {
  name: string;
  notificationTime: string;      // "08:00"
  notificationsEnabled: boolean;
  createdAt: Date;
}

interface JournalEntry {
  id: string;
  quoteId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FavoriteQuote {
  quoteId: string;
  savedAt: Date;
}

interface QuoteHistory {
  quoteId: string;
  shownAt: Date;           // Track what's been shown
  freshPullsToday: number; // Limit "give me another" to 3/day
}
```

### Algorithm Prep (future)

```typescript
interface UserSignal {
  quoteId: string;
  signal: 'favorite' | 'reflected' | 'skipped' | 'requested_another';
  weight: number;          // favorite=3, reflected=2, etc.
  timestamp: Date;
}
```

---

## UI/UX Details

### Aesthetic Principles (Medium circa 2012)

- **Typography:** Serif for quotes (Charter, Lora, or Georgia fallback), clean sans for UI (Inter)
- **Spacing:** Generous - quotes breathe, no cramped layouts
- **Color:** Near-black on warm white (`#1a1a1a` on `#fafaf8`), minimal accent
- **Animation:** Subtle fades, no flashy transitions

### Responsive Behavior

```
Desktop (>768px)              Mobile (<768px)
┌────────────────────────┐    ┌──────────────┐
│                        │    │              │
│    [quote centered     │    │   [quote     │
│     max-width: 65ch]   │    │   full-width │
│                        │    │   padded]    │
│    ───────────────     │    │              │
│    reflection below    │    │  [reflect    │
│    or side panel       │    │   below]     │
└────────────────────────┘    └──────────────┘
```

### Reflection Editor Adaptive States

| Entry length | UX treatment |
|--------------|--------------|
| Empty | Subtle placeholder: *"What does this stir in you?"* |
| Short (<100 chars) | Minimal chrome, single line feel |
| Medium (100-500) | Standard, soft paragraph breaks |
| Long (500+) | Focused mode: quote minimizes, editor expands, word count fades in |

---

## MVP Scope

### In

- Onboarding (name + notification time)
- Daily quote display with beautiful typography
- Reflect/journal on quote (adaptive editor)
- Favorite quotes
- "Give me another" (3/day limit)
- Archive view (past quotes + entries)
- Favorites view
- Push notifications (browser)
- PWA installable
- ~100-150 seeded quotes (web-researched)

### Out (future)

- Email digest
- Algorithm/personalization
- Account/sync
- Admin panel for quotes
- Themed sequences
- Smart timing learning

---

## Project Structure

```
quotidian/
├── public/
│   └── manifest.json
├── src/
│   ├── app/
│   │   ├── page.tsx          # Today's quote
│   │   ├── archive/
│   │   ├── favorites/
│   │   ├── settings/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── Quote.tsx
│   │   ├── ReflectionEditor.tsx
│   │   ├── Onboarding.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── db.ts             # IndexedDB wrapper
│   │   ├── quotes.ts         # Quote selection logic
│   │   └── notifications.ts  # Push notification helpers
│   ├── data/
│   │   └── quotes.json       # Seeded quotes
│   └── styles/
│       └── globals.css       # Typography, theme
├── scripts/
│   └── seed-quotes.ts        # Web research script
└── package.json
```

---

## Implementation Plan

### Phase 1: Foundation
1. Initialize Next.js 14 + TypeScript project
2. Set up PWA config (next-pwa, manifest, service worker)
3. Typography & base styles (Charter/Lora + Inter, warm theme)
4. IndexedDB wrapper (Dexie.js or idb)

### Phase 2: Core Features
5. Quote data structure + JSON seed file
6. Quote display component (beautiful, centered, responsive)
7. Onboarding flow (name, notification time)
8. Today's quote page with daily selection logic
9. Reflection editor (adaptive states)
10. Favorite/unfavorite functionality

### Phase 3: Navigation & History
11. Archive page (past quotes + journal entries)
12. Favorites page
13. Settings page (edit name, time)
14. "Give me another" with 3/day limit

### Phase 4: Notifications
15. Notification permission request in onboarding
16. Service worker scheduling
17. 3-day inactivity nudge

### Phase 5: Content
18. Web research for quotes (~100-150)
19. Structure into quotes.json with metadata

---

## Thinkers for Quote Pool

- Naval Ravikant
- Seneca
- Marcus Aurelius
- Epictetus
- James Stockdale
- Alan Watts
- (open to expansion)

---

## Unresolved Questions

- Specific font choice? (Charter, Lora, other serif)
- Notification nudge copy after 3 days?
- Additional quote sources beyond listed thinkers?
