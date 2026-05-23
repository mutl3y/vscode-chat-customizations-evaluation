# Debugging the LLM Analyzer

This extension now includes automatic file-based debug logging to help diagnose LLM response issues.

## How Debug Logging Works

- **Location**: Debug logs are automatically written to `.debug-llm-analyzer.log` in the workspace root
- **Activation**: Logging is automatic - no environment variables needed!
- **Content**: Tracks LLM request/response sizes, JSON parsing, and errors

## To Debug

### Step 1: Rebuild
```bash
npm run build
```

### Step 2: Launch with F5
Press `F5` to open Extension Development Host with your code

### Step 3: Open a Skill File
Open any `.skill.md` or `.prompt.md` file

### Step 4: Run Analysis
Run command: `Chat Customizations Evaluations: Analyze Prompt`

### Step 5: Check Logs

In the workspace root, look for `.debug-llm-analyzer.log`:
```bash
# View the debug log
cat .debug-llm-analyzer.log

# Watch it in real-time
tail -f .debug-llm-analyzer.log
```

## What the Logs Show

Example log output:
```
[2026-05-23T18:00:00.000Z] LLM request starting
{
  "promptLength": 5000
}

[2026-05-23T18:00:02.500Z] LLM request succeeded
{
  "responseLength": 2500
}

[2026-05-23T18:00:02.510Z] LLM Response received
{
  "length": 2500,
  "preview": {
    "start": "{\"contradictions\": [...",
    "end": "...\"suggestions\": []}"
  }
}

[2026-05-23T18:00:02.515Z] JSON parsing successful
{
  "contradictionsCount": 2,
  "ambiguityCount": 1,
  "personaCount": 0
}
```

## If Parsing Fails

Look for this pattern:
```
[2026-05-23T18:00:02.515Z] JSON parsing failed
{
  "error": "Unexpected end of JSON input",
  "responseLength": 2500
}
```

This tells us:
- **Error message**: What went wrong with JSON parsing
- **Response length**: How many characters we received

Common issues:
- `Unexpected end of JSON input` = Response was truncated
- `SyntaxError: Unexpected token` = Response contains non-JSON text
- `responseLength: 0` = LLM returned empty response

## Client-Side Output

The Output panel also shows some details:
1. Go to **Output** → **Chat Customizations Evaluations**
2. Look for `[LLM Proxy]` messages showing:
   - Prompt size being sent
   - Response size and chunk count
   - Response preview (first/last 150 chars)

## Debugging Tips

### Check response completeness
Is the response ending properly with `}`?
```bash
tail -c 50 .debug-llm-analyzer.log
```

### See full response (if small)
```bash
grep -A 20 "LLM Response received" .debug-llm-analyzer.log
```

### Track the flow
```bash
grep "LLM\|JSON\|parsing" .debug-llm-analyzer.log
```

### Clean old logs before testing
```bash
rm .debug-llm-analyzer.log
```
