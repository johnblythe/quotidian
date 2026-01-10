# Quotidian - Design & Development Guidelines

## Design Philosophy

**Every pixel is a choice.** This app should feel like a beautifully typeset book page—serene, intentional, unhurried. The quote and the user's reflection are sacred; everything else exists to support that contemplative moment.

### Core Principles

1. **Whisper, Don't Shout**
   - UI chrome should be nearly invisible until needed
   - Icons: hairline weight (strokeWidth 1), low opacity (25-35%)
   - No labels on navigation—icons only with title tooltips
   - Prefer subtle state changes over bold indicators

2. **Motion Like Water**
   - Animations should flow, not snap—like water, not doors
   - Use slow, gentle easing curves (breathe, fluid, gentle)
   - Stagger related elements generously (150-300ms delays)
   - Transitions: 900-1200ms for layout shifts, 150-200ms for micro-interactions
   - Add blur + vertical drift to fading elements for dreamlike depth
   - Let elements settle gradually, never abruptly

3. **Typography is Sacred**
   - Lora serif for quotes and reflections
   - System sans for UI elements
   - Generous line-height (1.6-1.7)
   - Max 65ch for readability

4. **Focus Through Reduction**
   - When user enters a mode (reflecting, reading), fade everything else
   - Use opacity + scale + slight blur for depth
   - The active element should feel like it's floating forward

5. **Warmth Over Sterility**
   - Warm white (#fafaf8) not pure white
   - Near-black (#1a1a1a) not pure black
   - Avoid harsh contrasts and clinical precision

## Animation Guidelines

### Easing Curves (defined in globals.css)
```css
--ease-fluid: cubic-bezier(0.4, 0, 0.2, 1);      /* Smooth, natural */
--ease-gentle: cubic-bezier(0.25, 0.1, 0.25, 1); /* Soft deceleration */
--ease-breathe: cubic-bezier(0.45, 0, 0.15, 1);  /* Slow inhale, gentle exhale */
```

### Transition Durations
- **Micro-interactions** (hover, active): 150-200ms
- **State changes** (modal open, mode switch): 400-600ms
- **Layout shifts** (reflection mode): 900-1200ms
- **Page transitions**: 200-300ms

### Stagger Delays
When multiple elements transition together (like water rippling):
- Element 1: 0ms
- Element 2: 150ms
- Element 3: 300ms
- Let the cascade breathe—don't rush it

### Reflection Mode Pattern
```
Container: padding shift over 1000ms
Greeting:  opacity 0.25, scale 0.97, translateY -12px, blur 2px
Quote:     opacity 0.45, scale 0.98, translateY -4px (150ms delay)
Actions:   opacity 0.2, scale 0.95, translateY 8px, blur 1px (300ms delay)
Editor:    rises from translateY 30px over 900ms (200ms delay)
```

## Component Patterns

### Icons
- Size: 14px for nav, 18px for actions
- strokeWidth: 1 (hairline)
- Default opacity: 25% (nav) or 35% (actions)
- Hover opacity: 50% (nav) or 60% (actions)
- Active: 100% opacity
- Always include `title` and `aria-label`

### Buttons
- No visible borders or backgrounds by default
- Hover: subtle scale (1.05x), background opacity 4%
- Active: scale 0.95x
- Focus-visible: 2px outline with offset

### Containers
- Minimal chrome (borders at 5% opacity max)
- Backgrounds: transparent or /80 with backdrop-blur
- Generous padding, let content breathe

## Code Conventions

### CSS Classes
Use semantic class names for animation states:
```
.reflection-fade           /* Base transition setup */
.reflection-fade-delay-1   /* Stagger timing */
.reflection-active-*       /* Active state styles */
.reflection-editor-enter   /* Entrance animation */
```

### Tailwind Usage
- Prefer CSS classes in globals.css for complex animations
- Use Tailwind for simple, one-off styles
- Keep animation logic in CSS, not inline classes

### Accessibility
- Always respect `prefers-reduced-motion`
- Maintain keyboard navigability
- ARIA labels on all icon-only buttons
- Focus-visible outlines

## File Structure

```
src/
  app/
    globals.css      # Design tokens, animations, utility classes
    page.tsx         # Main view with reflection mode
  components/
    Quote.tsx        # Sacred typography
    ReflectionEditor.tsx  # Writing area
    ActionButtons.tsx     # Whisper icons
    Navigation.tsx        # Minimal nav
```

## What Not To Do

- ❌ Bold, attention-grabbing UI elements
- ❌ Linear or default ease transitions  
- ❌ Labels on icons (use tooltips)
- ❌ Harsh borders or shadows
- ❌ Pure black/white colors
- ❌ Instant state changes (always animate)
- ❌ Uniform opacity/scale (use staggering)
- ❌ Competing visual hierarchies
