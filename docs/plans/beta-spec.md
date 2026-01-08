# Beta Spec: Polish & Content

**Goal:** Ready for public launch. Polished, delightful, 150+ quotes.

---

## Content: Quote Expansion

### Approach
Mix of AI research + human curation. Batch review for quality.

### Quote Schema (updated)
```typescript
interface Quote {
  id: string;
  text: string;
  author: string;
  source?: string;
  context?: string;
  dateAuthored?: string;
  themes: Theme[];  // NEW
}

type Theme =
  | 'adversity'
  | 'death'
  | 'discipline'
  | 'joy'
  | 'relationships'
  | 'work'
  | 'identity'
  | 'time'
  | 'wisdom'
  | 'simplicity';
```

### Sourcing Plan

| Author | Target Count | Sources |
|--------|--------------|---------|
| Seneca | 25 | Letters to Lucilius, On the Shortness of Life |
| Marcus Aurelius | 25 | Meditations |
| Epictetus | 20 | Enchiridion, Discourses |
| Naval Ravikant | 20 | Almanack, tweets, podcasts |
| Alan Watts | 20 | The Way of Zen, lectures |
| James Stockdale | 10 | Courage Under Fire, essays |
| Lao Tzu | 10 | Tao Te Ching |
| Buddha | 10 | Dhammapada |
| Rumi | 10 | Selected poems |

**Total: ~150 quotes**

### Process
1. I research 20-30 quotes per batch
2. You review, reject bad fits, suggest edits
3. Repeat until 150+ quality quotes
4. Tag themes per quote

---

## Design Polish

### Light Touch (Required)
- [ ] Page transitions (fade in/out, 200ms)
- [ ] Button hover states (subtle scale/glow)
- [ ] Loading skeletons for async data
- [ ] Save confirmation (heart fill animation)
- [ ] "Saved" toast notification
- [ ] Textarea auto-resize smoothness
- [ ] Focus states (accessibility)

### Delightful Extras (Easter Eggs)
- [ ] 100th reflection milestone celebration
- [ ] Seasonal greeting variants (winter morning, summer evening)
- [ ] Rare "golden quote" indicator (randomly 1 in 50)
- [ ] Keyboard shortcuts (j/k navigate, s save, r reflect)
- [ ] Konami code → philosopher mode (all quotes from one thinker)
- [ ] Subtle confetti on first favorite
- [ ] "You've reflected more than 90% of users" (fake stat, delightful)

### Empty States
- No favorites yet → "Your collection awaits. ♡ a quote to start."
- No reflections yet → "Wisdom grows when written. Start your first reflection."
- Archive empty → "Tomorrow, today becomes yesterday's wisdom."

---

## Quality & Performance

### Accessibility (WCAG AA)
- [ ] Color contrast ratios (4.5:1 minimum)
- [ ] Focus indicators visible
- [ ] Screen reader testing
- [ ] Keyboard navigation complete
- [ ] Reduced motion support

### Performance
- [ ] Lighthouse score 95+
- [ ] First contentful paint < 1.5s
- [ ] Time to interactive < 3s
- [ ] Bundle size audit
- [ ] Image optimization (icons)

### Testing
- [ ] Manual test on iOS Safari
- [ ] Manual test on Android Chrome
- [ ] Manual test on desktop (Chrome, Firefox, Safari)
- [ ] PWA install flow tested
- [ ] Offline mode tested

---

## User Stories (Ralph-able)

### Content
- US-B01: Update Quote interface to include themes array
- US-B02: Research and add 25 Seneca quotes with themes
- US-B03: Research and add 25 Marcus Aurelius quotes with themes
- US-B04: Research and add 20 Epictetus quotes with themes
- US-B05: Research and add 20 Naval quotes with themes
- US-B06: Research and add 20 Alan Watts quotes with themes
- US-B07: Research and add 10 Stockdale quotes with themes
- US-B08: Research and add 30 misc quotes (Lao Tzu, Buddha, Rumi) with themes

### Polish
- US-B09: Add page transition animations (fade)
- US-B10: Add button hover/active states
- US-B11: Add loading skeletons to async components
- US-B12: Add heart fill animation on favorite
- US-B13: Add toast notification system
- US-B14: Improve textarea auto-resize
- US-B15: Add keyboard shortcuts (j/k/s/r)

### Easter Eggs
- US-B16: Add milestone celebration (100 reflections)
- US-B17: Add seasonal greeting variants
- US-B18: Add Konami code easter egg
- US-B19: Add first-favorite confetti

### Empty States
- US-B20: Design and implement empty state for favorites
- US-B21: Design and implement empty state for archive
- US-B22: Design and implement empty state for reflections

### Quality
- US-B23: Accessibility audit and fixes
- US-B24: Performance optimization pass
- US-B25: Cross-browser/device testing fixes

---

## Open Questions

- Include quotes from living authors? (copyright considerations)
- Any thinkers to add/remove from list?
- Specific Easter eggs you love/hate?
