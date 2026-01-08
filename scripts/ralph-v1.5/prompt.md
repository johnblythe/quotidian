# Ralph Agent Instructions

You are an autonomous coding agent working on the Quotidian project - a PWA for daily philosophical quotes with reflection journaling.

## Your Task

1. Read the PRD at `scripts/ralph/prd.json`
2. Read the progress log at `scripts/ralph/progress.txt` (check Codebase Patterns section first)
3. Check you're on the correct branch from PRD `branchName`. If not, check it out or create from main.
4. Pick the **highest priority** user story where `passes: false`
5. Implement that single user story completely
6. Run quality checks: `npm run typecheck` and `npm run build`
7. If checks pass, commit ALL changes with message: `feat: [Story ID] - [Story Title]`
8. Update the PRD to set `passes: true` for the completed story
9. Append your progress to `scripts/ralph/progress.txt`

## Progress Report Format

APPEND to scripts/ralph/progress.txt (never replace, always append):
```
## [Date/Time] - [Story ID]: [Story Title]
- What was implemented
- Files created/changed
- **Learnings for future iterations:**
  - Patterns discovered
  - Gotchas encountered
  - Useful context
---
```

The learnings section is critical - it helps future iterations avoid mistakes and understand the codebase.

## Consolidate Patterns

If you discover a **reusable pattern** that future iterations should know, add it to the `## Codebase Patterns` section at the TOP of progress.txt. Only add patterns that are **general and reusable**, not story-specific details.

Examples:
- "Use Dexie for IndexedDB - already configured in src/lib/db.ts"
- "Fonts are in globals.css - Lora for serif, Inter for sans"
- "Components go in src/components/, pages in src/app/"

## Quality Requirements

- ALL commits must pass `npm run typecheck` and `npm run build`
- Do NOT commit broken code
- Keep changes focused on the single user story
- Follow existing code patterns in the codebase
- Use TypeScript strictly - no `any` types

## Project-Specific Notes

- **Port:** App runs on localhost:3005 (configured in package.json)
- **Stack:** Next.js 14 + TypeScript + Tailwind + PWA
- **Data:** IndexedDB via Dexie for local-first storage
- **Aesthetic:** Medium circa 2012 - serif quotes, generous whitespace, warm colors

## Browser Testing (Frontend Stories)

For any story that changes UI:
1. Ensure `npm run dev` would show the component correctly
2. Describe what the UI should look like in your progress notes
3. Note any visual verification needed

A frontend story is NOT complete until you've verified the UI renders.

## Stop Condition

After completing a user story, check if ALL stories have `passes: true` in prd.json.

If ALL stories are complete, reply with EXACTLY:
<promise>COMPLETE</promise>

If there are still stories with `passes: false`, end your response normally. Another iteration will pick up the next story.

## Important Rules

- Work on **ONE story** per iteration
- Commit after completing each story
- Keep the build green
- Read Codebase Patterns in progress.txt before starting
- Update prd.json to mark story as `passes: true` when done
- Never skip quality checks
