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

/**
 * Run battle test suite
 */
async function runBattleTest({ integration = false } = {}) {
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
  let totalDetected = 0;
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
      const rate = Math.round((detected / test.expected) * 100);
      
      const statusColor = rate >= 75 ? 'green' : rate >= 50 ? 'yellow' : 'red';
      const status = rate >= 75 ? '✅' : rate >= 50 ? '⚠️' : '❌';
      
      log(`   Detected: ${detected}/${test.expected} (${rate}%) ${status}`, statusColor);

      totalExpected += test.expected;
      totalDetected += detected;
      
      results.push({
        name: test.name,
        expected: test.expected,
        detected,
        rate,
        category: test.category || '',
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

  const overallRate = Math.round((totalDetected / totalExpected) * 100);
  // Thresholds reflect that ~32/91 injected issues require new analyzer categories
  // (context waste, weak directives, dead instructions) not yet implemented.
  // Maximum theoretical detection with current tool: ~65%.
  const statusColor = overallRate >= 55 ? 'green' : overallRate >= 40 ? 'yellow' : 'red';
  const status = overallRate >= 55 ? '✅ GOOD — at or above expected baseline' : overallRate >= 40 ? '⚠️ PARTIAL — some categories underperforming' : '❌ NEEDS WORK — below expected baseline';

  log('-'.repeat(70), 'gray');
  log(`TOTAL: ${totalDetected}/${totalExpected} injected issues detected (${overallRate}%) ${status}`, statusColor);
  log('(~32 of 91 issues require new analyzer categories — see /memories/repo/analyzer-enhancement-roadmap.md)', 'gray');
  
  if (overallRate >= 55) {
    log('\n✅ Analyzer is performing well against known-detectable issue categories.', 'green');
    log('   Next step: implement enhancement roadmap items to raise ceiling above 65%.', 'gray');
  } else if (overallRate >= 40) {
    log('\n⚠️  Analyzer has partial coverage. Review per-category breakdown above.', 'yellow');
  } else {
    log('\n❌ Analyzer needs work before the enhancement roadmap can be meaningful.', 'red');
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

Examples:
  node cli-analyzer.js mock_skill/test-contradictions-direct/SKILL.md
  node cli-analyzer.js mock_skill --batch
  node cli-analyzer.js mock_skill/test-ambiguities/SKILL.md --json
  node cli-analyzer.js --battle-test
  node cli-analyzer.js --battle-test --integration
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
    await runBattleTest({ integration });
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
