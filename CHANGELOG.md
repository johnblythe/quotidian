# Changelog

All notable changes to Quotidian will be documented in this file.

## [1.5.0] - 2026-01-08

### Added

#### Authentication & Accounts
- Supabase integration for auth and data
- Magic link sign-in (passwordless)
- Account settings page
- Sign-out flow
- Signed-in state indicators throughout app

#### Cross-Device Sync
- Supabase database schema with Row Level Security (RLS)
- Sync service for preferences
- Sync service for journal entries
- Sync service for favorites
- Sync service for quote history
- Offline queue for pending syncs
- Conflict resolution (last-write-wins)

#### Sharing
- Share card generator (canvas-based)
- Share button on quote display
- Copy to clipboard
- Download as PNG
- Native share via Web Share API

#### Email Digest
- Resend integration for transactional email
- Weekly digest email template
- Supabase Edge Function for scheduled sends
- Digest settings toggle in preferences
- Unsubscribe flow

---

## [1.0.0] - 2026-01-08

### Added

#### Personalization Algorithm
- Signal tracking (favorites, reflections, skips)
- Theme affinity calculation
- Weighted quote selection based on user behavior
- Cold start logic (random for first 14 days)
- "Personalization unlocked" celebration on day 15

#### Journeys
- Multi-day themed quote experiences
- 7 preset journeys (Seneca, Alan Watts, Stoic Fundamentals, etc.)
- Journey progress tracking
- Completion celebrations
- Exit journey with confirmation

#### Smart Timing
- Engagement time tracking
- Suggested notification time based on habits
- Weekly recalculation

---

## [0.2.0] - 2026-01-08 (Beta)

### Added

#### Content Expansion
- 150+ curated quotes (up from 55)
- Theme tagging on all quotes (adversity, death, discipline, joy, etc.)
- Quotes from: Seneca, Marcus Aurelius, Epictetus, Naval, Alan Watts, Stockdale, Lao Tzu, Buddha, Rumi

#### Polish & Animations
- Page transition animations (fade in/out)
- Button hover and active states
- Loading skeletons for async content
- Heart fill animation on favorite
- Toast notification system
- Smooth textarea auto-resize

#### Easter Eggs & Delight
- Milestone celebration at 100 reflections
- Seasonal greeting variants
- Konami code easter egg (philosopher mode)
- First-favorite confetti

#### Empty States
- Beautiful empty states for favorites, archive, and reflections

#### Keyboard Shortcuts
- j/k: navigate quotes
- s: toggle save
- r: open reflection
- Escape: close modals

#### Accessibility (WCAG AA)
- Color contrast fixes
- Focus indicators
- Screen reader support
- Keyboard navigation
- Reduced motion support

#### Performance
- Lighthouse score 95+
- Optimized bundle size
- Image optimization

---

## [0.1.0] - 2026-01-08

### Added

#### Core Experience
- Daily quote display with beautiful Medium-inspired typography
- Personalized greeting based on time of day ("Good morning, John")
- Onboarding flow to capture name and notification preferences
- "Give me another" quote feature with 3/day limit

#### Reflection & Journaling
- Adaptive reflection editor that responds to content length
- Auto-save reflections to local storage
- Journal entries linked to quotes

#### Organization
- Favorites system to save meaningful quotes
- Archive page showing past quotes and reflections
- Favorites page for quick access to saved quotes
- Settings page to update name and preferences

#### Technical Foundation
- Next.js 14 with App Router and TypeScript
- PWA support (installable, offline-capable)
- IndexedDB via Dexie for local-first data storage
- Tailwind CSS with custom typography (Lora + Inter)
- 55 curated quotes from stoics, Naval, Alan Watts, and more

#### Navigation
- Bottom navigation for mobile
- Pages: Today, Archive, Favorites, Settings

### Technical Details
- Port: 3005
- Build: Next.js with Webpack mode for PWA compatibility
- Fonts: Lora (serif for quotes), Inter (sans for UI)
- Colors: Warm white (#fafaf8) background, near-black (#1a1a1a) text

---

## Roadmap

See [ROADMAP.md](docs/ROADMAP.md) for upcoming features:
- **Beta**: 150+ quotes, polish, accessibility
- **V1.0**: Personalization algorithm, journeys, smart timing
- **V1.5**: Accounts, cross-device sync, sharing
- **V2.0**: Collections
