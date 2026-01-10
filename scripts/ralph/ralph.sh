#!/bin/bash
# Ralph Wiggum Loop for Quotidian

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_FILE="$SCRIPT_DIR/logs/ralph-$(date +%Y%m%d-%H%M%S).log"

cd "$PROJECT_ROOT"

echo "Starting Ralph loop for Quotidian Whisper Icons UI..."
echo "Logs: $LOG_FILE"
echo "Press Ctrl+C to stop"
echo ""

while true; do
  echo "=== Ralph iteration $(date) ===" | tee -a "$LOG_FILE"
  cat "$SCRIPT_DIR/prompt.md" | claude --continue 2>&1 | tee -a "$LOG_FILE"
  
  # Check for completion promise
  if grep -q "<promise>UI REFINEMENT COMPLETE</promise>" "$LOG_FILE"; then
    echo "Ralph completed! UI refinement done."
    break
  fi
  
  sleep 2
done
