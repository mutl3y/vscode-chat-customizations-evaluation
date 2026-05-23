#!/bin/bash
set -e

# Debug script to launch VS Code with file-based logging

DEBUG_LOG_DIR="${1:-.}"
DEBUG_LOG_FILE="${DEBUG_LOG_DIR}/llm-analyzer-debug.log"

echo "🔍 Starting extension with debug logging"
echo "📝 Debug log will be written to: $DEBUG_LOG_FILE"
echo ""

# Clear previous log
rm -f "$DEBUG_LOG_FILE"

# Start the extension with DEBUG_LOG env var set
export DEBUG_LOG="$DEBUG_LOG_FILE"

# Run with F5 config (opens Extension Development Host)
cd "$(dirname "$0")"
npm run build

echo ""
echo "✅ Build complete"
echo "📝 Log file: $DEBUG_LOG_FILE"
echo ""
echo "Opening VS Code with debug logging enabled..."
echo "1. Open a .skill.md or .prompt.md file"
echo "2. Run 'Chat Customizations Evaluations: Analyze Prompt' command"
echo "3. Wait for analysis to complete"
echo "4. Check: $DEBUG_LOG_FILE"
echo ""

# Launch with debug flag
code --extensionDevelopmentPath="$(pwd)"
