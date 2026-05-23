#!/bin/bash
set -e

echo "Building extension..."
npm run build

echo "Launching VS Code with development extension..."
TESTDIR="/tmp/vscode-test-$$"
mkdir -p "$TESTDIR"

# Create a test skill file
cat > "$TESTDIR/test.skill.md" << 'EOF'
---
name: Test Skill
description: A test skill
---

# Test Skill

This is a test skill file for testing the analysis system.

## Instructions

Analyze this prompt for issues.
EOF

echo "Test file created at: $TESTDIR/test.skill.md"

# Launch VS Code with extension development path
echo "Starting VS Code..."
code \
  --extensionDevelopmentPath="$(pwd)" \
  --user-data-dir="$TESTDIR/.config" \
  "$TESTDIR/test.skill.md" &

VS_PID=$!
echo "VS Code PID: $VS_PID"

# Wait for VS Code to start
sleep 5

echo "Sending command to analyze..."
# Note: This would require a more sophisticated method to send commands to VS Code

# Wait a bit
sleep 10

# Kill VS Code
kill $VS_PID 2>/dev/null || true

# Check logs
echo ""
echo "=== Extension Logs ==="
LOG_DIR="$TESTDIR/.config/User/workspaceStorage"
if [ -d "$LOG_DIR" ]; then
  find "$LOG_DIR" -name "*Chat Customizations*" -type f 2>/dev/null | head -1 | xargs cat 2>/dev/null || echo "No logs found"
fi

# Cleanup
rm -rf "$TESTDIR"
