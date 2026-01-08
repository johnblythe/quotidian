#!/bin/bash
# Ralph Wiggum for Claude Code - Long-running AI agent loop
# Adapted from Ryan Carson's snarktank/ralph for Amp
# Usage: ./ralph.sh [max_iterations]

set -e

MAX_ITERATIONS=${1:-10}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
PROMPT_FILE="$SCRIPT_DIR/prompt.md"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"
ARCHIVE_DIR="$SCRIPT_DIR/archive"
LAST_BRANCH_FILE="$SCRIPT_DIR/.last-branch"
LOG_DIR="$SCRIPT_DIR/logs"

# Create log directory
mkdir -p "$LOG_DIR"

# Archive previous run if branch changed
if [ -f "$PRD_FILE" ] && [ -f "$LAST_BRANCH_FILE" ]; then
  CURRENT_BRANCH=$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || echo "")
  LAST_BRANCH=$(cat "$LAST_BRANCH_FILE" 2>/dev/null || echo "")

  if [ -n "$CURRENT_BRANCH" ] && [ -n "$LAST_BRANCH" ] && [ "$CURRENT_BRANCH" != "$LAST_BRANCH" ]; then
    DATE=$(date +%Y-%m-%d)
    FOLDER_NAME=$(echo "$LAST_BRANCH" | sed 's|^ralph/||')
    ARCHIVE_FOLDER="$ARCHIVE_DIR/$DATE-$FOLDER_NAME"

    echo "Archiving previous run: $LAST_BRANCH"
    mkdir -p "$ARCHIVE_FOLDER"
    [ -f "$PRD_FILE" ] && cp "$PRD_FILE" "$ARCHIVE_FOLDER/"
    [ -f "$PROGRESS_FILE" ] && cp "$PROGRESS_FILE" "$ARCHIVE_FOLDER/"
    echo "   Archived to: $ARCHIVE_FOLDER"

    # Reset progress file for new run
    echo "# Ralph Progress Log" > "$PROGRESS_FILE"
    echo "Started: $(date)" >> "$PROGRESS_FILE"
    echo "---" >> "$PROGRESS_FILE"
  fi
fi

# Track current branch
if [ -f "$PRD_FILE" ]; then
  CURRENT_BRANCH=$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || echo "")
  if [ -n "$CURRENT_BRANCH" ]; then
    echo "$CURRENT_BRANCH" > "$LAST_BRANCH_FILE"
  fi
fi

# Initialize progress file if it doesn't exist
if [ ! -f "$PROGRESS_FILE" ]; then
  echo "# Ralph Progress Log" > "$PROGRESS_FILE"
  echo "Started: $(date)" >> "$PROGRESS_FILE"
  echo "" >> "$PROGRESS_FILE"
  echo "## Codebase Patterns" >> "$PROGRESS_FILE"
  echo "(Discovered patterns will be added here)" >> "$PROGRESS_FILE"
  echo "" >> "$PROGRESS_FILE"
  echo "---" >> "$PROGRESS_FILE"
fi

# Check required files exist
if [ ! -f "$PRD_FILE" ]; then
  echo "Error: prd.json not found at $PRD_FILE"
  echo "Create it first using the ralph skill to convert your PRD."
  exit 1
fi

if [ ! -f "$PROMPT_FILE" ]; then
  echo "Error: prompt.md not found at $PROMPT_FILE"
  exit 1
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Ralph Wiggum for Claude Code                             ║"
echo "║  Max iterations: $MAX_ITERATIONS                                       ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Show current PRD status
echo "PRD Status:"
jq -r '.userStories[] | "  \(.id): \(.title) - \(if .passes then "✅" else "⏳" end)"' "$PRD_FILE"
echo ""

for i in $(seq 1 $MAX_ITERATIONS); do
  echo ""
  echo "═══════════════════════════════════════════════════════════"
  echo "  Ralph Iteration $i of $MAX_ITERATIONS"
  echo "  $(date)"
  echo "═══════════════════════════════════════════════════════════"

  # Check if all stories are complete before starting
  REMAINING=$(jq '[.userStories[] | select(.passes == false)] | length' "$PRD_FILE")
  if [ "$REMAINING" -eq 0 ]; then
    echo ""
    echo "All user stories complete!"
    echo "Ralph finished at iteration $i"
    exit 0
  fi

  echo "Remaining stories: $REMAINING"
  echo ""

  # Create iteration log file
  ITERATION_LOG="$LOG_DIR/iteration-$i-$(date +%Y%m%d-%H%M%S).log"

  # Run Claude Code with the prompt
  # --print sends prompt via stdin and exits after response
  # --dangerously-skip-permissions allows autonomous operation
  echo "Starting Claude Code iteration..."

  # Pipe prompt.md to claude and capture output
  OUTPUT=$(cd "$PROJECT_ROOT" && cat "$PROMPT_FILE" | claude --print --dangerously-skip-permissions 2>&1 | tee "$ITERATION_LOG") || true

  # Check for completion signal
  if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║  Ralph completed all tasks!                               ║"
    echo "║  Finished at iteration $i of $MAX_ITERATIONS                         ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    exit 0
  fi

  # Show what was completed
  echo ""
  echo "Iteration $i complete."
  echo "Updated PRD status:"
  jq -r '.userStories[] | "  \(.id): \(.title) - \(if .passes then "✅" else "⏳" end)"' "$PRD_FILE"

  # Brief pause between iterations
  echo ""
  echo "Pausing 3 seconds before next iteration..."
  sleep 3
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  Ralph reached max iterations ($MAX_ITERATIONS)"
echo "  Check progress.txt and logs/ for status"
echo "═══════════════════════════════════════════════════════════"

# Show final status
echo ""
echo "Final PRD status:"
jq -r '.userStories[] | "  \(.id): \(.title) - \(if .passes then "✅" else "⏳" end)"' "$PRD_FILE"

COMPLETED=$(jq '[.userStories[] | select(.passes == true)] | length' "$PRD_FILE")
TOTAL=$(jq '.userStories | length' "$PRD_FILE")
echo ""
echo "Completed: $COMPLETED / $TOTAL stories"

exit 1
