# Quotidian Roadmap

## Vision

A daily companion for philosophical reflection. Simple, beautiful, personal.

---

## Alpha (Current)

Core experience: quote → reflect → save → archive

- [x] PWA installable on any device
- [x] Beautiful Medium-inspired typography
- [x] Local-first data (IndexedDB)
- [x] Daily quote with personalized greeting
- [x] Reflection editor (adaptive to content length)
- [x] Favorites system
- [x] "Give me another" with daily limit
- [x] Archive of past quotes + reflections
- [x] Push notifications at chosen time
- [x] ~50 seed quotes from stoics, Naval, Alan Watts

---

## Beta - Polish & Content

Refinement before wider release.

- [ ] Expand to 150+ curated quotes
- [ ] Design polish pass
  - Micro-interactions (heart fill, save confirmation)
  - Page transitions (subtle fades)
  - Loading states
- [ ] Onboarding flow refinement
- [ ] Empty states that delight
- [ ] Accessibility audit (WCAG AA)
- [ ] Performance optimization (Lighthouse 95+)
- [ ] Bug fixes from dogfooding

---

## V1.0 - Personalization

The app learns you.

- [ ] **Algorithm**: weight quotes based on
  - Favorites (high signal)
  - Reflection length/sentiment (medium signal)
  - "Another" requests (low signal)
  - Skip patterns (negative signal)
- [ ] **Journeys**: multi-day themed experiences
  - "7 Days with Seneca"
  - "Week of Stillness" (Alan Watts)
  - "Stoic Fundamentals" (mixed)
  - User can opt-in/out anytime
- [ ] **Smart timing**: learns when you actually engage
  - Shifts notification time toward your patterns
  - Weekend vs weekday awareness

---

## V1.5 - Sync & Sharing

Beyond single device.

- [ ] **Optional account** (email magic link)
- [ ] **Cross-device sync**
  - Favorites, journal entries, preferences
  - Supabase or Neon backend
- [ ] **Share quote cards**
  - Beautiful image generation
  - Quote + attribution + subtle branding
  - Copy to clipboard / share sheet
- [ ] **Email digest** (optional)
  - Weekly reflection summary
  - "Quotes you loved this week"

---

## V2.0 - Community

Shared wisdom.

- [ ] **Collections**
  - User-curated quote bundles
  - "My favorites on grief"
  - Public or private
- [ ] **Submit quotes**
  - Community contributions
  - Moderation queue
  - Attribution requirements
- [ ] **Public journals** (opt-in)
  - Share reflections on specific quotes
  - Discover others' insights
- [ ] **Admin panel**
  - Quote management
  - User reports
  - Analytics dashboard

---

## Future Ideas (Unprioritized)

- Native iOS/Android apps (from PWA or fresh)
- Voice reflection (speech-to-text journaling)
- Daily quote widget (iOS/Android)
- Integrations (Notion, Readwise, Obsidian export)
- Seasonal/holiday special quotes
- Guest curators (authors, thinkers)
- Reflection prompts library
- Streak/consistency tracking (gentle, not gamified)
- Dark mode (user toggle)
- Quote of the week email newsletter
- API for developers

---

## Principles

1. **Simplicity over features** - resist bloat
2. **Local-first** - works offline, your data is yours
3. **No dark patterns** - no streaks that guilt, no engagement hacks
4. **Beautiful defaults** - polish matters
5. **Gentle notifications** - respect attention
6. **Open source** - community can contribute
