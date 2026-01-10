# Ralph Prompt - Quotidian Whisper Icons UI

You are implementing a UI refinement for Quotidian, a philosophical quote reflection PWA.

## Project Context
- Next.js 16 + React 19 + Tailwind 4
- Port 3005
- Aesthetic: Medium-inspired, Lora serif, warm white (#fafaf8), near-black (#1a1a1a)

## Your Mission
Transform chunky navigation and action buttons into extreme minimalism. The quote and reflection writing are sacred - everything else should whisper.

## Key Files
- `src/components/Navigation.tsx` - Main navigation (7 items with icons+labels)
- `src/components/ActionButtons.tsx` - Action buttons below quote (Save, Reflect, Share, Another)

## Design Principles
1. Icons only, no labels (use title/aria-label for accessibility)
2. Hairline weight (strokeWidth: 1)
3. Faded presence (opacity 25-35% default, subtle on hover)
4. Minimal spacing (reduce padding and gaps)
5. Gentle transitions (200ms ease)

## Commands
- `npm run lint` - Check for lint errors
- `npm run typecheck` - TypeScript validation
- `npm run build` - Full build

## Completion
When all user stories pass their acceptance criteria, output:
<promise>UI REFINEMENT COMPLETE</promise>

## Progress
Check and update `scripts/ralph/progress.txt` as you work.
