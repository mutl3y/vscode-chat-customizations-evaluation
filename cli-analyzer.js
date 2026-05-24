#!/usr/bin/env node

/**
 * CLI Adapter for LLM Analyzer
 * 
 * Allows testing the analyzer via command line without VS Code UI
 * 
 * Usage:
 *   node cli-analyzer.js <file-path>              # Analyze single file
 *   node cli-analyzer.js <dir-path> --batch       # Analyze all files in directory
 *   node cli-analyzer.js <file> --json            # Output as JSON
 *   node cli-analyzer.js <file> --report          # Generate markdown report
 *   node cli-analyzer.js --battle-test            # Run full battle test suite
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const DEBUG_LOG = '/tmp/vscode-analyzer-debug.log';
const PROMPT_LOG = '/tmp/vscode-analyzer-prompt.txt';

// Silence debug logs for cleaner CLI output
process.env.DEBUG_LOG = '/dev/null';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(70)}`, 'blue');
  log(`${title}`, 'bright');
  log(`${'='.repeat(70)}\n`, 'blue');
}

/**
 * Build an LLMProxyFn that calls GitHub Models API using GITHUB_TOKEN.
 * Uses gpt-4o-mini by default (cheap, avoids budget issues).
 * Override with CLI_MODEL env var if needed.
 */
function createGitHubModelsProxy() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      'GITHUB_TOKEN is not set. The CLI analyzer needs it to call the GitHub Models API.\n' +
      'In a Codespace this is automatic. Locally: export GITHUB_TOKEN=<your token>'
    );
  }
  const model = process.env.CLI_MODEL || 'gpt-4o-mini';
  return async function({ prompt, systemPrompt }) {
    const body = JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: prompt },
      ],
      max_tokens: 4096,
      temperature: 0.1,
    });
    try {
      const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body,
      });
      if (!response.ok) {
        const err = await response.text();
        return { text: '{}', error: `GitHub Models API ${response.status}: ${err.slice(0, 200)}` };
      }
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content ?? '{}';
      return { text };
    } catch (err) {
      return { text: '{}', error: err.message };
    }
  };
}

/**
 * Create mock TextDocument from file
 */
function createMockDoc(filePath, content) {
  return {
    uri: filePath,
    getText: () => content,
    languageId: 'markdown',
    lineCount: content.split('\n').length,
    getLineContent: (line) => content.split('\n')[line] || '',
  };
}

/**
 * Format diagnostic message with color
 */
function formatDiagnostic(diag, index) {
  const severityColors = {
    error: 'red',
    warning: 'yellow',
    info: 'cyan',
    hint: 'gray',
  };
  
  const severity = diag.severity || 'info';
  const color = severityColors[severity] || 'reset';
  
  let output = `\n${colors.bright}#${index + 1}. [${colors[color]}${severity.toUpperCase()}${colors.reset}${colors.bright}]${colors.reset} `;
  output += `${colors.bright}${diag.code}${colors.reset}\n`;
  output += `   Line ${diag.startLineNumber}: ${diag.message}\n`;
  
  return output;
}

/**
 * Analyze a single file
 */
async function analyzeFile(filePath, options = {}) {
  if (!fs.existsSync(filePath)) {
    log(`❌ File not found: ${filePath}`, 'red');
    process.exit(1);
  }

  log(`📖 Reading file: ${filePath}`, 'cyan');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').length;
  log(`   ${lines} lines, ${content.length} characters`, 'gray');

  try {
    log(`\n🔧 Loading analyzer...`, 'cyan');
    const analyzerModule = await import(path.join(__dirname, 'out', 'analyzers', 'llm.js'));
    const LLMAnalyzer = analyzerModule.LLMAnalyzer;
    
    const analyzer = new LLMAnalyzer();
    analyzer.setProxyFn(createGitHubModelsProxy());
    const mockDoc = createMockDoc(filePath, content);
    
    log(`✅ Analyzer ready\n`, 'green');
    
    log(`🚀 Running analysis...`, 'cyan');
    const results = await analyzer.analyze(mockDoc);
    log(`✅ Analysis complete\n`, 'green');
    
    return results;
  } catch (error) {
    log(`❌ Analysis failed: ${error.message}`, 'red');
    if (process.env.DEBUG) {
      console.error(error);
    }
    process.exit(1);
  }
}

/**
 * Format results as table
 */
function formatAsTable(results) {
  if (results.length === 0) {
    log('✅ No issues detected!', 'green');
    return;
  }

  const bySeverity = {
    error: results.filter(r => r.severity === 'error'),
    warning: results.filter(r => r.severity === 'warning'),
    info: results.filter(r => r.severity === 'info'),
    hint: results.filter(r => r.severity === 'hint'),
  };

  const severityOrder = ['error', 'warning', 'info', 'hint'];
  
  for (const severity of severityOrder) {
    const items = bySeverity[severity];
    if (items.length === 0) continue;
    
    const severityColors = {
      error: 'red',
      warning: 'yellow',
      info: 'cyan',
      hint: 'gray',
    };
    
    log(`\n${colors[severityColors[severity]]}${severity.toUpperCase()}S (${items.length})${colors.reset}`, severityColors[severity]);
    log('-'.repeat(70), 'gray');
    
    items.forEach((diag, idx) => {
      log(`${idx + 1}. [${diag.code}] Line ${diag.startLineNumber}`, severityColors[severity]);
      log(`   ${diag.message}\n`, 'reset');
    });
  }
  
  const total = results.length;
  const errors = bySeverity.error.length;
  const warnings = bySeverity.warning.length;
  const infos = bySeverity.info.length;
  
  log('-'.repeat(70), 'gray');
  log(`📊 SUMMARY: ${total} issues (${errors} errors, ${warnings} warnings, ${infos} info)`, 'bright');
}

/**
 * Format results as JSON
 */
function formatAsJSON(results, filePath) {
  return JSON.stringify({
    file: filePath,
    timestamp: new Date().toISOString(),
    total: results.length,
    by_severity: {
      error: results.filter(r => r.severity === 'error').length,
      warning: results.filter(r => r.severity === 'warning').length,
      info: results.filter(r => r.severity === 'info').length,
      hint: results.filter(r => r.severity === 'hint').length,
    },
    issues: results.map(r => ({
      code: r.code,
      severity: r.severity,
      message: r.message,
      line: r.startLineNumber,
      column: r.startColumn,
    })),
  }, null, 2);
}

/**
 * Generate markdown report
 */
function formatAsMarkdown(results, filePath) {
  const fileName = path.basename(filePath);
  const dirName = path.dirname(filePath);
  
  let md = `# Analysis Report\n\n`;
  md += `**File:** \`${filePath}\`\n`;
  md += `**Time:** ${new Date().toISOString()}\n`;
  md += `**Total Issues:** ${results.length}\n\n`;
  
  const bySeverity = {
    error: results.filter(r => r.severity === 'error'),
    warning: results.filter(r => r.severity === 'warning'),
    info: results.filter(r => r.severity === 'info'),
    hint: results.filter(r => r.severity === 'hint'),
  };
  
  md += `## Summary\n\n`;
  md += `| Severity | Count |\n`;
  md += `|----------|-------|\n`;
  md += `| Error    | ${bySeverity.error.length} |\n`;
  md += `| Warning  | ${bySeverity.warning.length} |\n`;
  md += `| Info     | ${bySeverity.info.length} |\n`;
  md += `| Hint     | ${bySeverity.hint.length} |\n\n`;
  
  const severityOrder = ['error', 'warning', 'info', 'hint'];
  
  for (const severity of severityOrder) {
    const items = bySeverity[severity];
    if (items.length === 0) continue;
    
    md += `## ${severity.charAt(0).toUpperCase() + severity.slice(1)}s\n\n`;
    
    items.forEach((diag, idx) => {
      md += `### ${idx + 1}. ${diag.code}\n\n`;
      md += `**Line:** ${diag.startLineNumber}\n\n`;
      md += `${diag.message}\n\n`;
    });
  }
  
  return md;
}

/**
 * Run batch analysis on directory
 */
async function analyzeBatch(dirPath, options = {}) {
  if (!fs.existsSync(dirPath)) {
    log(`❌ Directory not found: ${dirPath}`, 'red');
    process.exit(1);
  }

  const stats = fs.statSync(dirPath);
  if (!stats.isDirectory()) {
    log(`❌ Not a directory: ${dirPath}`, 'red');
    process.exit(1);
  }

  logSection(`🔍 Batch Analysis: ${dirPath}`);

  // Find all .md files
  const findMdFiles = (dir) => {
    let files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files = files.concat(findMdFiles(fullPath));
        }
      } else if (entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
    
    return files;
  };

  const files = findMdFiles(dirPath);
  
  if (files.length === 0) {
    log('❌ No markdown files found', 'yellow');
    return;
  }

  log(`Found ${files.length} markdown file(s):\n`, 'cyan');
  files.forEach(f => log(`  - ${f}`, 'gray'));
  log('');

  const batchResults = [];

  for (const file of files) {
    logSection(`Analyzing: ${path.basename(file)}`);
    
    try {
      const results = await analyzeFile(file, options);
      formatAsTable(results);
      
      batchResults.push({
        file,
        results,
        total: results.length,
        errors: results.filter(r => r.severity === 'error').length,
        warnings: results.filter(r => r.severity === 'warning').length,
      });
    } catch (error) {
      log(`⚠️  Skipped due to error: ${error.message}`, 'yellow');
    }
  }

  // Summary
  logSection('📊 Batch Summary');
  
  let totalIssues = 0;
  let totalErrors = 0;
  let totalWarnings = 0;

  batchResults.forEach(batch => {
    const status = batch.total > 0 ? '⚠️' : '✅';
    log(`${status} ${path.basename(batch.file)}: ${batch.total} issues (${batch.errors} errors, ${batch.warnings} warnings)`, 'reset');
    totalIssues += batch.total;
    totalErrors += batch.errors;
    totalWarnings += batch.warnings;
  });

  log('\n' + '-'.repeat(70), 'gray');
  log(`TOTAL: ${totalIssues} issues (${totalErrors} errors, ${totalWarnings} warnings)`, 'bright');
}

// ─────────────────────────────────────────────────────────────────────────
// Dashboard: persistence and HTML generation
// ─────────────────────────────────────────────────────────────────────────

const RESULTS_DIR    = path.join(__dirname, 'battle-test-results');
const BASELINE_FILE  = path.join(RESULTS_DIR, 'baseline.json');   // first run ever — never overwritten
const PREVIOUS_FILE  = path.join(RESULTS_DIR, 'previous.json');   // second-to-last run — for regression detection
const LATEST_FILE    = path.join(RESULTS_DIR, 'latest.json');      // most recent run
const DASHBOARD_FILE = path.join(RESULTS_DIR, 'dashboard.html');

// Detection drop of more than this many percentage points vs the *previous* run
// triggers a regression warning. Set > 0 to tolerate LLM non-determinism.
const REGRESSION_TOLERANCE_PCT = 5;

/** Map a diagnostic code to a human-readable category bucket. */
function classifyCode(code) {
  if (code === 'contradiction' || code === 'contradiction-related') return 'Contradictions';
  if (code === 'ambiguity-llm') return 'Ambiguities';
  if (code === 'persona-inconsistency') return 'Persona';
  if (code.startsWith('cognitive-')) return 'Cognitive Load';
  if (code === 'coverage-gap' || code === 'limited-coverage') return 'Coverage Gaps';
  return 'Other';
}

function getCurrentBranch() {
  try { return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim(); }
  catch { return 'unknown'; }
}

/**
 * Save a run record.
 * - First call: also saves as baseline (never overwritten after that).
 * - Every call: rotates current latest → previous, then writes new latest.
 * Returns { isBaseline, hasPrevious }.
 */
function saveBattleResults(record) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  // Rotate: latest → previous before overwriting latest
  const hasPrevious = fs.existsSync(LATEST_FILE);
  if (hasPrevious) {
    fs.copyFileSync(LATEST_FILE, PREVIOUS_FILE);
  }
  fs.writeFileSync(LATEST_FILE, JSON.stringify(record, null, 2));
  const isBaseline = !fs.existsSync(BASELINE_FILE);
  if (isBaseline) {
    fs.writeFileSync(BASELINE_FILE, JSON.stringify(record, null, 2));
  }
  return { isBaseline, hasPrevious };
}

function loadBattleResults() {
  return {
    baseline: fs.existsSync(BASELINE_FILE) ? JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8')) : null,
    previous: fs.existsSync(PREVIOUS_FILE) ? JSON.parse(fs.readFileSync(PREVIOUS_FILE, 'utf8')) : null,
    latest:   fs.existsSync(LATEST_FILE)   ? JSON.parse(fs.readFileSync(LATEST_FILE,  'utf8')) : null,
  };
}

/**
 * Compares latest against previous and returns any regressions.
 * A regression is a drop of more than REGRESSION_TOLERANCE_PCT on any file
 * or on the overall score.
 */
function detectRegressions(previous, latest) {
  if (!previous) return [];
  const regressions = [];
  const overallDrop = previous.overallRate - latest.overallRate;
  if (overallDrop > REGRESSION_TOLERANCE_PCT) {
    regressions.push({
      type: 'overall',
      label: 'Overall detection rate',
      prev: previous.overallRate,
      curr: latest.overallRate,
      drop: overallDrop,
    });
  }
  for (const lf of latest.files) {
    const pf = previous.files.find(f => f.name === lf.name);
    if (!pf) continue;
    const drop = pf.rate - lf.rate;
    if (drop > REGRESSION_TOLERANCE_PCT) {
      regressions.push({
        type: 'file',
        label: lf.name,
        prev: pf.rate,
        curr: lf.rate,
        drop,
      });
    }
  }
  return regressions;
}

function pctBar(pct, hex) {
  const w = Math.min(100, Math.max(0, pct));
  return `<div class="bar-wrap" title="${pct}%"><div class="bar" style="width:${w}%;background:${hex}"></div><span class="bar-lbl">${pct}%</span></div>`;
}

function deltaSpan(base, curr) {
  if (base == null) return '';
  const d = curr - base;
  const cls = d > 0 ? 'pos' : d < 0 ? 'neg' : 'zero';
  return `<span class="delta ${cls}">${d > 0 ? '+' : ''}${d}%</span>`;
}

/** Generates a fully self-contained HTML dashboard. */
function generateDashboardHTML(baseline, previous, latest) {
  // Enhancement roadmap — update status: 'done' | 'in-progress' | 'backlog'
  const ROADMAP = [
    { id: 'CW', title: 'Context waste detector',       detail: 'Verbatim repetition, non-actionable preamble, "think carefully" no-ops', status: 'backlog' },
    { id: 'IQ', title: 'Obligation strength checker',  detail: '"try to / should / might want to" weak directives vs hard MUST requirements', status: 'backlog' },
    { id: 'RA', title: 'Responsibility ambiguity',     detail: 'Passive voice hides actor; "use your judgment"; "consult appropriate expert"', status: 'backlog' },
    { id: 'DI', title: 'Dead instruction detector',   detail: 'Instructions referencing removed features, schemes, or paths', status: 'backlog' },
    { id: 'CD', title: 'Circular definition check',   detail: 'A defined using B, B defined using A (e.g. P0 = requires P0 response)', status: 'backlog' },
    { id: 'OS', title: 'Over-specification warnings', detail: 'Trivial formatting micro-rules (exactly N spaces/chars) with no quality benefit', status: 'backlog' },
  ];

  const b = baseline;
  const p = previous;   // may be null on second run
  const l = latest;
  const isFirstRun = b.timestamp === l.timestamp;

  // Regression detection for the HTML banner
  const regressions = p ? detectRegressions(p, l) : [];
  const regressionBanner = regressions.length > 0
    ? `<div class="alert">
        <strong>⚠️ Regression detected vs previous run</strong>
        <ul>${regressions.map(r => `<li>${r.label}: ${r.prev}% → ${r.curr}% (−${r.drop}%)</li>`).join('')}</ul>
        <span class="alert-note">Tolerance: ±${REGRESSION_TOLERANCE_PCT}% (adjust REGRESSION_TOLERANCE_PCT in cli-analyzer.js)</span>
      </div>`
    : '';

  const headerNote = isFirstRun
    ? `<p class="note">⚠️  This is the baseline run — no previous data to compare against. Run again after making improvements to see a delta.</p>`
    : `<p class="note">Baseline: <strong>${b.timestamp.substring(0,10)}</strong> (${b.branch})
       ${p ? `&nbsp;|&nbsp; Previous: <strong>${p.timestamp.substring(0,10)}</strong> (${p.branch})` : ''}
       &nbsp;|&nbsp; Current: <strong>${l.timestamp.substring(0,10)}</strong> (${l.branch})</p>`;

  const CATS = ['Contradictions', 'Ambiguities', 'Cognitive Load', 'Persona', 'Coverage Gaps', 'Other'];

  function catCounts(record) {
    const m = {};
    record.files.forEach(f => Object.entries(f.byCategory || {}).forEach(([k, v]) => { m[k] = (m[k] || 0) + v; }));
    return m;
  }
  const lCats = catCounts(l);
  const bCats = catCounts(b);
  const pCats = p ? catCounts(p) : null;

  const catRows = CATS.map(cat => {
    const bv = bCats[cat] || 0;
    const pv = pCats ? (pCats[cat] || 0) : null;
    const lv = lCats[cat] || 0;
    const dvl = lv - (pv ?? bv); // delta vs previous (or baseline if no previous)
    const cls = dvl > 0 ? 'pos' : dvl < 0 ? 'neg' : 'zero';
    const prevCell = pv != null ? `<td class="num">${pv}</td>` : '';
    return `<tr><td>${cat}</td><td class="num">${bv}</td>${prevCell}<td class="num">${lv}</td><td class="num"><span class="delta ${cls}">${dvl > 0 ? '+' : ''}${dvl}</span></td></tr>`;
  }).join('');
  const catHeader = `<tr><th>Category</th><th style="text-align:right">Baseline</th>${p ? '<th style="text-align:right">Previous</th>' : ''}<th style="text-align:right">Current</th><th style="text-align:right">Δ vs prev</th></tr>`;

  const fileRows = l.files.map(lf => {
    const bf = b.files.find(f => f.name === lf.name);
    const pf = p ? p.files.find(f => f.name === lf.name) : null;
    const baseBar = bf ? pctBar(bf.rate, '#475569') : '<span class="muted">—</span>';
    const prevBar = pf ? pctBar(pf.rate, '#854d0e') : (p ? '<span class="muted">—</span>' : '');
    const currColor = lf.rate >= 55 ? '#22c55e' : lf.rate >= 35 ? '#f59e0b' : '#ef4444';
    const currBar = pctBar(lf.rate, currColor);
    const dVsPrev = deltaSpan(pf ? pf.rate : null, lf.rate);
    const dVsBase = deltaSpan(bf ? bf.rate : null, lf.rate);
    const isRegressed = pf && (pf.rate - lf.rate) > REGRESSION_TOLERANCE_PCT;
    const rowCls = isRegressed ? ' class="regressed"' : '';
    const prevBarCell = p ? `<td class="bars">${prevBar}</td>` : '';
    const dVsPrevCell = p ? `<td class="num">${dVsPrev}</td>` : '';
    const fpStr = (lf.falsePositives || 0) > 0 ? ` <span class="fp">+${lf.falsePositives}FP</span>` : '';
    return `<tr${rowCls}><td class="name">${lf.name}</td><td class="num">${lf.expected}</td><td class="bars">${baseBar}</td>${prevBarCell}<td class="bars">${currBar}</td><td class="num">${lf.truePositives ?? lf.detected}/${lf.expected}${fpStr}</td>${dVsPrevCell}<td class="num">${dVsBase}</td></tr>`;
  }).join('');
  const fileHeaderPrev = p ? '<th>Prev</th><th style="text-align:right">Δ prev</th>' : '';

  const roadmapRows = ROADMAP.map(r => {
    const icon = r.status === 'done' ? '✅' : r.status === 'in-progress' ? '🔄' : '🔜';
    const rowCls = r.status === 'done' ? ' class="done-row"' : '';
    return `<tr${rowCls}><td>${icon}</td><td><code>${r.id}</code></td><td>${r.title}</td><td class="detail">${r.detail}</td></tr>`;
  }).join('');

  const impVsBase = l.overallRate - b.overallRate;
  const impVsPrev = p ? (l.overallRate - p.overallRate) : null;
  const prevCard = p
    ? `<div class="card neutral"><div class="lbl">Previous Jaccard</div><div class="val">${p.overallRate}%</div><div class="sub">TP: ${p.totalTruePositives}  FP: ${p.totalFalsePositives} &nbsp;·&nbsp; ${p.timestamp.substring(0,10)}</div></div>`
    : '';
  const regressionCardCls = impVsPrev != null ? (impVsPrev < -REGRESSION_TOLERANCE_PCT ? 'neg' : impVsPrev > 0 ? 'pos' : 'neutral') : 'neutral';
  const regressionCard = p
    ? `<div class="card ${regressionCardCls}"><div class="lbl">Δ vs previous</div><div class="val">${impVsPrev > 0 ? '+' : ''}${impVsPrev}%</div><div class="sub">${regressions.length > 0 ? `⚠️ ${regressions.length} regression(s) detected` : 'No regressions'}</div></div>`
    : `<div class="card neutral"><div class="lbl">Δ vs baseline</div><div class="val">${impVsBase > 0 ? '+' : ''}${impVsBase}%</div><div class="sub">${l.branch}</div></div>`;

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Battle Test Dashboard</title><style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0d1117; color: #e2e8f0; padding: 28px 32px; font-size: 14px; }
h1 { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
h2 { font-size: 12px; font-weight: 600; margin: 32px 0 10px; color: #64748b; text-transform: uppercase; letter-spacing: .08em; }
.note { color: #64748b; font-size: 12px; margin-bottom: 24px; }
.alert { background: #450a0a; border: 1px solid #7f1d1d; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; }
.alert strong { color: #fca5a5; display: block; margin-bottom: 6px; }
.alert ul { margin: 0 0 6px 20px; color: #fca5a5; font-size: 13px; }
.alert-note { color: #9ca3af; font-size: 11px; }
.cards { display: flex; gap: 14px; margin: 18px 0 6px; flex-wrap: wrap; }
.card { background: #161b22; border: 1px solid #21262d; border-radius: 10px; padding: 18px 22px; flex: 1; min-width: 140px; }
.card .lbl { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: .07em; }
.card .val { font-size: 36px; font-weight: 700; margin: 6px 0 2px; line-height: 1; }
.card .sub { font-size: 11px; color: #64748b; }
.neutral .val { color: #94a3b8; }
.pos .val { color: #22c55e; }
.neg .val { color: #ef4444; }
.ceiling { font-size: 11px; color: #475569; margin: 0 0 4px; }
table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
th { text-align: left; padding: 7px 12px; border-bottom: 1px solid #21262d; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: .05em; }
td { padding: 8px 12px; border-bottom: 1px solid #161b22; vertical-align: middle; }
tr:hover td { background: #161b22; }
tr.regressed td { background: #1c0a0a; }
tr.regressed td:first-child::after { content: ' ⚠️'; }
.done-row td { opacity: .5; }
.num { text-align: right; font-variant-numeric: tabular-nums; }
.name { max-width: 260px; font-size: 13px; }
.bars { min-width: 110px; }
.bar-wrap { position: relative; background: #21262d; border-radius: 4px; height: 20px; overflow: hidden; min-width: 90px; }
.bar { height: 100%; border-radius: 4px; }
.bar-lbl { position: absolute; right: 6px; top: 0; line-height: 20px; font-size: 11px; color: #fff; text-shadow: 0 1px 3px #000; font-weight: 600; }
.delta { font-weight: 700; }
.delta.pos { color: #22c55e; }
.delta.neg { color: #ef4444; }
.delta.zero { color: #94a3b8; }
.detail { color: #64748b; font-size: 12px; max-width: 380px; }
.muted { color: #475569; }
.fp { color: #f97316; font-size: 11px; font-weight: 600; }
.metric-sub { color: #94a3b8; font-size: 11px; margin-top: 2px; }
code { background: #21262d; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
</style></head><body>
<h1>⚔️ Analyzer Battle Test Dashboard</h1>
${headerNote}
${regressionBanner}
<div class="cards">
  <div class="card neutral"><div class="lbl">Baseline Jaccard</div><div class="val">${b.overallRate}%</div><div class="sub">TP: ${b.totalTruePositives}  FP: ${b.totalFalsePositives} &nbsp;·&nbsp; ${b.timestamp.substring(0,10)}</div></div>
  ${prevCard}
  <div class="card ${l.overallRate >= b.overallRate ? 'pos' : 'neg'}"><div class="lbl">Current Jaccard</div><div class="val">${l.overallRate}%</div><div class="sub">TP: ${l.totalTruePositives}  FP: ${l.totalFalsePositives} &nbsp;·&nbsp; ${l.timestamp.substring(0,10)}</div></div>
  ${regressionCard}
</div>
<p class="ceiling">Scores are Jaccard / IoU: TP÷(TP+FP+FN). Equals recall when FP=0; penalises false positives directly. Regression tolerance: ±${REGRESSION_TOLERANCE_PCT}%.</p>

<h2>Per-File Detection</h2>
<table><tr><th>Skill file</th><th style="text-align:right">Injected</th><th>Baseline</th>${fileHeaderPrev}<th>Current</th><th style="text-align:right">Detected</th><th style="text-align:right">Δ base</th></tr>${fileRows}</table>

<h2>By Analyzer Category (detected counts)</h2>
<table>${catHeader}${catRows}</table>

<h2>Enhancement Roadmap</h2>
<p class="note">Mark items done by setting <code>status: 'done'</code> in the ROADMAP array in <code>cli-analyzer.js</code>, then re-run <code>npm run analyze:dashboard</code>.</p>
<table><tr><th></th><th>ID</th><th>Feature</th><th>What it catches</th></tr>${roadmapRows}</table>
</body></html>`;
}

/**
 * Run battle test suite
 */
async function runBattleTest({ integration = false, dashboard = false } = {}) {
  logSection('🎯 Running Battle Test Suite');

  // Primary battle test: 6 focused skill files covering 91 injected issues.
  // These files contain NO JIT reference loading so both main and feature branches
  // are tested fairly.
  //
  // "expected" = total injected issues in the file (not estimated detection count).
  // Detection rate = detected / expected. Target: ≥60% overall (some categories
  // like context-waste require new analyzer features not yet implemented).
  const PRIMARY_TEST_FILES = [
    {
      name: 'Contradictions: Direct (15 injected)',
      path: path.join(__dirname, 'mock_skill', 'test-contradictions-direct', 'SKILL.md'),
      expected: 15,
      category: 'contradiction',
    },
    {
      name: 'Contradictions: Subtle (12 injected)',
      path: path.join(__dirname, 'mock_skill', 'test-contradictions-subtle', 'SKILL.md'),
      expected: 12,
      category: 'contradiction',
    },
    {
      name: 'Ambiguities (20 injected)',
      path: path.join(__dirname, 'mock_skill', 'test-ambiguities', 'SKILL.md'),
      expected: 20,
      category: 'ambiguity',
    },
    {
      name: 'Cognitive & Structural (15 injected)',
      path: path.join(__dirname, 'mock_skill', 'test-cognitive-structural', 'SKILL.md'),
      expected: 15,
      category: 'cognitive_load + persona + structural',
      note: '6 structural issues require new analyzer categories (context waste, etc.)',
    },
    {
      name: 'Coverage Gaps (15 injected)',
      path: path.join(__dirname, 'mock_skill', 'test-coverage-gaps', 'SKILL.md'),
      expected: 15,
      category: 'coverage_gap',
    },
    {
      name: 'Instruction Quality (15 injected)',
      path: path.join(__dirname, 'mock_skill', 'test-instruction-quality', 'SKILL.md'),
      expected: 15,
      category: 'ambiguity + contradiction + cognitive_load',
      note: '6 issues require new analyzer categories (weak directives, dead instructions, etc.)',
    },
  ];

  // Integration tests: use JIT reference loading (./references/*.md).
  // These are excluded from the primary battle test because the main branch
  // cannot load references, making direct comparison unfair.
  const INTEGRATION_TEST_FILES = [
    {
      name: 'GitHub Actions Efficiency (integration)',
      path: path.join(__dirname, 'mock_skill', 'github-actions-efficiency', 'SKILL.md'),
      expected: 7,
      category: 'contradiction + ambiguity + coverage_gap',
    },
    {
      name: 'GitHub Codespaces Efficiency (integration)',
      path: path.join(__dirname, 'mock_skill', 'github-codespaces-efficiency', 'SKILL.md'),
      expected: 7,
      category: 'contradiction + ambiguity + coverage_gap',
    },
  ];

  const testFiles = integration
    ? [...PRIMARY_TEST_FILES, ...INTEGRATION_TEST_FILES]
    : PRIMARY_TEST_FILES;

  if (integration) {
    log('Mode: PRIMARY + INTEGRATION (includes JIT-reference skills)', 'cyan');
  } else {
    log('Mode: PRIMARY only (pass --integration to include JIT-reference skills)', 'gray');
    log('Total injected issues: 91 across 6 skill files', 'cyan');
  }

  let totalExpected = 0;
  let totalDetected = 0;  // raw count (for display)
  let totalTruePositives = 0;
  let totalFalsePositives = 0;
  let totalFalseNegatives = 0;
  const results = [];

  for (const test of testFiles) {
    if (!fs.existsSync(test.path)) {
      log(`⚠️  Skipped: ${test.name} (file not found)`, 'yellow');
      continue;
    }

    log(`\n📝 ${test.name}`, 'bright');
    log(`   Path: ${test.path}`, 'gray');
    log(`   Expected: ${test.expected} injected issues`, 'cyan');
    if (test.note) log(`   ⚠️  Note: ${test.note}`, 'yellow');

    try {
      const analysisResults = await analyzeFile(test.path, { silent: true });
      const detected = analysisResults.length;

      // Jaccard (IoU) scoring: TP = issues correctly found (capped at expected)
      // FP = extra detections beyond expected (noise / false alarms)
      // FN = expected issues the analyzer missed
      // Jaccard = TP / (TP + FP + FN) — equals recall when FP=0, penalises noise
      const truePositives  = Math.min(detected, test.expected);
      const falsePositives = Math.max(0, detected - test.expected);
      const falseNegatives = Math.max(0, test.expected - detected);
      const jaccard = (truePositives + falsePositives + falseNegatives) > 0
        ? truePositives / (truePositives + falsePositives + falseNegatives) : 0;
      const rate      = Math.round(jaccard * 100);  // primary score: Jaccard (0-100)

      // Collect per-category breakdown for dashboard
      const byCategory = {};
      analysisResults.forEach(d => {
        const cat = classifyCode(d.code || '');
        byCategory[cat] = (byCategory[cat] || 0) + 1;
      });

      const statusColor = rate >= 65 ? 'green' : rate >= 40 ? 'yellow' : 'red';
      const status = rate >= 65 ? '✅' : rate >= 40 ? '⚠️' : '❌';
      const fpNote = falsePositives > 0 ? `  ⚠️ +${falsePositives} FP` : '';

      log(`   TP: ${truePositives}/${test.expected}  FP: ${falsePositives}  FN: ${falseNegatives}  |  Jaccard: ${rate}% ${status}${fpNote}`, statusColor);

      totalExpected       += test.expected;
      totalDetected       += detected;
      totalTruePositives  += truePositives;
      totalFalsePositives += falsePositives;
      totalFalseNegatives += falseNegatives;

      results.push({
        name: test.name,
        expected: test.expected,
        detected,
        truePositives,
        falsePositives,
        falseNegatives,
        rate,  // = Jaccard score (0-100); used by regression detection and dashboard bars
        category: test.category || '',
        byCategory,
      });
    } catch (error) {
      log(`   ❌ Error: ${error.message}`, 'red');
    }
  }

  logSection('📊 Battle Test Summary');
  
  const table = `
| Skill | Injected | Detected | Rate | Category |
|-------|----------|----------|------|----------|
${results.map(r => `| ${r.name} | ${r.expected} | ${r.detected} | ${r.rate}% | ${r.category || ''} |`).join('\n')}
`;
  
  log(table);

  // Overall Jaccard across all categories: TP / (TP + FP + FN)
  const overallJaccard = (totalTruePositives + totalFalsePositives + totalFalseNegatives) > 0
    ? totalTruePositives / (totalTruePositives + totalFalsePositives + totalFalseNegatives) : 0;
  const overallRate = Math.round(overallJaccard * 100);

  const statusColor = overallRate >= 60 ? 'green' : overallRate >= 40 ? 'yellow' : 'red';
  const status = overallRate >= 60 ? '✅ GOOD' : overallRate >= 40 ? '⚠️ PARTIAL — some categories underperforming' : '❌ NEEDS WORK';

  log('-'.repeat(70), 'gray');
  log(`TOTAL: TP ${totalTruePositives}  FP ${totalFalsePositives}  FN ${totalFalseNegatives}`, 'gray');
  log(`SCORE: Jaccard: ${overallRate}%  TP: ${totalTruePositives}  FP: ${totalFalsePositives}  FN: ${totalFalseNegatives} ${status}`, statusColor);
  
  if (overallRate >= 55) {
    log('\n✅ Analyzer is performing well against known-detectable issue categories.', 'green');
    log('   Next step: implement enhancement roadmap items to raise ceiling above 65%.', 'gray');
  } else if (overallRate >= 40) {
    log('\n⚠️  Analyzer has partial coverage. Review per-category breakdown above.', 'yellow');
  } else {
    log('\n❌ Analyzer needs work before the enhancement roadmap can be meaningful.', 'red');
  }

  if (dashboard) {
    const record = {
      timestamp: new Date().toISOString(),
      branch: getCurrentBranch(),
      totalExpected,
      totalDetected,
      totalTruePositives,
      totalFalsePositives,
      totalFalseNegatives,
      overallRate,  // = Jaccard score (0-100)
      files: results,
    };
    const { isBaseline } = saveBattleResults(record);
    const { baseline, previous, latest } = loadBattleResults();

    // Regression check against previous run
    const regressions = detectRegressions(previous, latest);
    if (regressions.length > 0) {
      log('\n🔴 REGRESSION DETECTED vs previous run:', 'red');
      regressions.forEach(r => {
        log(`   ${r.label}: ${r.prev}% → ${r.curr}% (−${r.drop}% — tolerance ±${REGRESSION_TOLERANCE_PCT}%)`, 'red');
      });
    } else if (previous) {
      log('\n✅ No regressions vs previous run.', 'green');
    }

    const html = generateDashboardHTML(baseline, previous, latest);
    fs.writeFileSync(DASHBOARD_FILE, html);
    if (isBaseline) {
      log(`\n📊 Baseline saved → ${BASELINE_FILE}`, 'cyan');
      log(`   Run again after improvements to see a comparison.`, 'gray');
    } else {
      log(`\n📊 Results saved → ${LATEST_FILE}`, 'cyan');
    }
    log(`🌐 Dashboard → ${DASHBOARD_FILE}`, 'green');
    log(`   Open with: open "${DASHBOARD_FILE}"`, 'gray');

    // --check: exit non-zero if regressions found (useful for CI)
    if (dashboard === 'check' && regressions.length > 0) {
      log('\n❌ Exiting with code 1 due to regressions (--check mode).', 'red');
      process.exit(1);
    }
  }
}

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    log(`
LLM Analyzer CLI Adapter

Usage:
  node cli-analyzer.js <file-path>              Analyze single file
  node cli-analyzer.js <dir-path> --batch       Analyze all files in directory
  node cli-analyzer.js <file> --json            Output as JSON
  node cli-analyzer.js <file> --report          Generate markdown report
  node cli-analyzer.js --battle-test            Run primary battle test suite (91 issues, 6 files)
  node cli-analyzer.js --battle-test --integration  Also run integration tests (JIT-reference skills)
  node cli-analyzer.js --battle-test --dashboard    Save results + generate HTML dashboard
  node cli-analyzer.js --battle-test --check        Dashboard + exit code 1 if regression (CI use)

Examples:
  node cli-analyzer.js mock_skill/test-contradictions-direct/SKILL.md
  node cli-analyzer.js mock_skill --batch
  node cli-analyzer.js mock_skill/test-ambiguities/SKILL.md --json
  node cli-analyzer.js --battle-test
  node cli-analyzer.js --battle-test --dashboard
    `, 'cyan');
    process.exit(0);
  }

  const isBattleTest = args.includes('--battle-test');
  const isBatch = args.includes('--batch');
  const isJSON = args.includes('--json');
  const isReport = args.includes('--report');
  
  const filePath = args.find(arg => !arg.startsWith('--'));

  if (isBattleTest) {
    const integration = args.includes('--integration');
    // --dashboard: save results + generate HTML
    // --check: same as --dashboard but exits non-zero if regressions found (for CI)
    const dashboard = args.includes('--check') ? 'check' : args.includes('--dashboard') ? true : false;
    await runBattleTest({ integration, dashboard });
    process.exit(0);
  }

  if (!filePath) {
    log('❌ No file or directory specified', 'red');
    process.exit(1);
  }

  if (isBatch) {
    await analyzeBatch(filePath);
  } else {
    const results = await analyzeFile(filePath);
    
    if (isJSON) {
      console.log(formatAsJSON(results, filePath));
    } else if (isReport) {
      console.log(formatAsMarkdown(results, filePath));
    } else {
      logSection(`Analysis Results: ${path.basename(filePath)}`);
      formatAsTable(results);
    }
  }
}

main().catch(error => {
  log(`❌ Fatal error: ${error.message}`, 'red');
  if (process.env.DEBUG) {
    console.error(error);
  }
  process.exit(1);
});
