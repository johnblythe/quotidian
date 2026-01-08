# Quotidian - Ralph-Able Implementation Plan

## Completion Promise

When ALL tasks below are checked `[x]` AND the app runs without errors:

```
<promise>QUOTIDIAN MVP COMPLETE</promise>
```

---

## Overview

Build Quotidian: a PWA for daily philosophical quotes with reflection journaling. Medium-inspired aesthetic, local-first data.

**Success Criteria:**
- App runs at localhost:3005
- PWA installable (manifest + service worker)
- Can complete full flow: see quote → reflect → save → view archive
- All TypeScript compiles without errors
- Lighthouse PWA score > 80

---

## Phase 1: Foundation

### 1.1 Project Setup
- [ ] Run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` (accept defaults)
- [ ] Update package.json scripts to use port 3005: `"dev": "next dev -p 3005"`, `"start": "next start -p 3005"`
- [ ] Verify `npm run dev` starts without errors at localhost:3005
- [ ] Verify `npm run build` completes without errors

### 1.2 PWA Configuration
- [ ] Install next-pwa: `npm install next-pwa`
- [ ] Create `public/manifest.json` with app name "Quotidian", theme color `#fafaf8`, icons placeholder
- [ ] Configure next.config.js for PWA (withPWA wrapper)
- [ ] Verify build creates service worker in `.next/`

### 1.3 Typography & Base Styles
- [ ] Install fonts: `npm install @fontsource/lora @fontsource/inter`
- [ ] Update `src/app/globals.css`: warm background `#fafaf8`, text `#1a1a1a`
- [ ] Configure Tailwind: add `font-serif` (Lora) and `font-sans` (Inter)
- [ ] Create base typography classes: `.quote-text` (serif, large), `.body-text` (sans)
- [ ] Verify fonts render correctly at localhost:3005

### 1.4 IndexedDB Setup
- [ ] Install Dexie: `npm install dexie`
- [ ] Create `src/lib/db.ts` with Dexie database schema
- [ ] Define tables: `preferences`, `journalEntries`, `favorites`, `quoteHistory`
- [ ] Export typed database instance
- [ ] Create `src/lib/db.test.ts` - verify can write/read from each table (manual test)

**Phase 1 Verification:**
```bash
npm run build && npm run start
# App loads at localhost:3005, fonts display, no console errors
```

---

## Phase 2: Data & Quote Display

### 2.1 Quote Data Structure
- [ ] Create `src/types/index.ts` with Quote, JournalEntry, UserPreferences interfaces
- [ ] Create `src/data/quotes.json` with 10 seed quotes (will expand later)
- [ ] Each quote: id, text, author, source (optional), context (optional)

### 2.2 Quote Component
- [ ] Create `src/components/Quote.tsx`
- [ ] Props: quote object
- [ ] Render: centered text (max-width 65ch), author attribution, source if present
- [ ] Styling: serif font, generous padding, elegant line-height
- [ ] Verify component renders beautifully at various viewport sizes

### 2.3 Quote Selection Logic
- [ ] Create `src/lib/quotes.ts` with functions:
  - `getTodaysQuote()`: deterministic based on date, from pool
  - `getRandomQuote()`: for "give me another"
  - `getFreshPullsRemaining()`: check 3/day limit
- [ ] Store shown quotes in IndexedDB quoteHistory
- [ ] Verify same quote returns for same date

### 2.4 Today's Quote Page
- [ ] Update `src/app/page.tsx` to display today's quote
- [ ] Add action buttons: ♡ Save, ✎ Reflect, → Another
- [ ] Wire up "Another" with 3/day limit (show remaining)
- [ ] Verify full quote display and buttons work

**Phase 2 Verification:**
```bash
npm run build
# Quote displays, "Another" respects limit, refresh shows same quote
```

---

## Phase 3: Onboarding & Personalization

### 3.1 Onboarding Flow
- [ ] Create `src/components/Onboarding.tsx`
- [ ] Step 1: "What should we call you?" - name input
- [ ] Step 2: "When would you like your daily reflection?" - time picker
- [ ] Save to IndexedDB preferences table
- [ ] Styling: same elegant aesthetic, centered, minimal

### 3.2 Onboarding Integration
- [ ] Create `src/lib/preferences.ts` for preference CRUD
- [ ] Update `src/app/page.tsx`: check if onboarded, show Onboarding if not
- [ ] After onboarding, show today's quote

### 3.3 Personalized Greeting
- [ ] Create `src/components/Greeting.tsx`
- [ ] Logic: "Good morning/afternoon/evening, {name}"
- [ ] Display above quote on main page
- [ ] Verify greeting changes based on time of day

**Phase 3 Verification:**
```bash
# Clear localStorage/IndexedDB, reload
# Onboarding appears, complete it, greeting shows with name
```

---

## Phase 4: Reflection Editor

### 4.1 Base Editor
- [ ] Create `src/components/ReflectionEditor.tsx`
- [ ] Textarea with placeholder: "What does this stir in you?"
- [ ] Auto-save to IndexedDB as user types (debounced)
- [ ] Props: quoteId, existingContent (for editing)

### 4.2 Adaptive Editor States
- [ ] Track content length in component state
- [ ] < 100 chars: minimal chrome, single-line feel
- [ ] 100-500 chars: standard paragraph view
- [ ] > 500 chars: focused mode - add subtle word count, expand editor
- [ ] Smooth CSS transitions between states

### 4.3 Editor Integration
- [ ] Wire "Reflect" button on quote page to show editor
- [ ] Save journal entry with quoteId reference
- [ ] Show "Edit reflection" if entry exists for today's quote
- [ ] Verify can create, edit, and persist reflections

**Phase 4 Verification:**
```bash
# Write short reflection - minimal UI
# Write long reflection - focused mode activates
# Refresh - reflection persists
```

---

## Phase 5: Favorites & Archive

### 5.1 Favorite Functionality
- [ ] Create `src/lib/favorites.ts` for favorite CRUD
- [ ] Wire ♡ button to toggle favorite status
- [ ] Visual feedback: filled heart when favorited
- [ ] Persist to IndexedDB favorites table

### 5.2 Favorites Page
- [ ] Create `src/app/favorites/page.tsx`
- [ ] List all favorited quotes with date saved
- [ ] Click quote to view full + any reflection
- [ ] Empty state: "No favorites yet"

### 5.3 Archive Page
- [ ] Create `src/app/archive/page.tsx`
- [ ] List past quotes shown to user (from quoteHistory)
- [ ] Show reflection snippet if exists
- [ ] Chronological order, newest first
- [ ] Pagination or infinite scroll for long history

### 5.4 Navigation
- [ ] Create `src/components/Navigation.tsx`
- [ ] Links: Today, Archive, Favorites, Settings
- [ ] Mobile: bottom nav or hamburger
- [ ] Desktop: subtle top nav or sidebar
- [ ] Add to layout.tsx

**Phase 5 Verification:**
```bash
# Favorite a quote - appears in Favorites
# Reflect on quote - appears in Archive with snippet
# Navigate between all pages without errors
```

---

## Phase 6: Settings

### 6.1 Settings Page
- [ ] Create `src/app/settings/page.tsx`
- [ ] Edit name field (pre-filled from preferences)
- [ ] Edit notification time
- [ ] Save updates to IndexedDB
- [ ] Show "Saved!" confirmation

### 6.2 Notification Toggle
- [ ] Add notifications enabled/disabled toggle
- [ ] Visual indicator of current permission state
- [ ] If not granted, show "Enable notifications" button

**Phase 6 Verification:**
```bash
# Change name in settings - greeting updates
# Change notification time - persists after refresh
```

---

## Phase 7: Push Notifications

### 7.1 Notification Permission
- [ ] Create `src/lib/notifications.ts`
- [ ] Function to request notification permission
- [ ] Integrate into onboarding (optional step)
- [ ] Handle denied/granted states gracefully

### 7.2 Service Worker Scheduling
- [ ] Extend service worker for scheduled notifications
- [ ] Trigger notification at user's preferred time
- [ ] Notification content: "Good morning, {name}. Today's reflection awaits."
- [ ] Click opens app to today's quote

### 7.3 Inactivity Nudge
- [ ] Track last visit date in preferences
- [ ] If 3+ days since last visit, show nudge notification
- [ ] Gentle copy: "We've missed you. A new reflection awaits."

**Phase 7 Verification:**
```bash
# Grant notification permission
# Set notification time to 1 min from now
# Notification appears, click opens app
```

---

## Phase 8: Quote Seeding (Web Research)

### 8.1 Research Script
- [ ] Create `scripts/seed-quotes.ts`
- [ ] Use web search/fetch to find quotes from: Naval, Seneca, Marcus Aurelius, Epictetus, James Stockdale, Alan Watts
- [ ] Extract: quote text, author, source, context where available
- [ ] Output to `src/data/quotes.json`

### 8.2 Curate & Validate
- [ ] Run seed script to gather ~100-150 quotes
- [ ] Manually review for quality and accuracy
- [ ] Ensure proper attribution
- [ ] Remove duplicates

### 8.3 Final Integration
- [ ] Replace seed quotes with full curated set
- [ ] Verify quote selection still works
- [ ] Test "give me another" with larger pool

**Phase 8 Verification:**
```bash
# quotes.json has 100+ entries
# App displays variety of quotes
# No broken quotes or missing authors
```

---

## Final Verification Checklist

Before outputting completion promise, verify ALL:

- [ ] `npm run build` succeeds with no errors
- [ ] `npm run start` runs app at localhost:3005
- [ ] PWA is installable (check Lighthouse or browser install prompt)
- [ ] Complete user flow works:
  - [ ] Fresh visit shows onboarding
  - [ ] After onboarding, today's quote displays with greeting
  - [ ] Can favorite a quote
  - [ ] Can write and save a reflection
  - [ ] Can request another quote (respects 3/day limit)
  - [ ] Archive shows past quotes and reflections
  - [ ] Favorites shows saved quotes
  - [ ] Settings allows editing name/time
- [ ] All data persists after browser refresh
- [ ] No console errors in browser
- [ ] No TypeScript errors

---

## Completion

When ALL above checkboxes are `[x]` and all verifications pass:

```
<promise>QUOTIDIAN MVP COMPLETE</promise>
```
