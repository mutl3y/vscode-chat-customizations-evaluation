#!/bin/bash
# Run Playwright tests with debug logging enabled

export DEBUG_LOG="/tmp/vscode-analyzer-debug.log"

echo "🧪 Running Playwright tests with debug logging..."
echo "📝 Debug log will be written to: $DEBUG_LOG"

npx playwright test tests/debug-analysis.spec.ts --headed --project=chromium

EXIT_CODE=$?

if [ -f "$DEBUG_LOG" ]; then
  echo ""
  echo "📋 Debug log contents:"
  echo "---"
  cat "$DEBUG_LOG"
  echo "---"
fi

exit $EXIT_CODE
