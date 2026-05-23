#!/usr/bin/env node

/**
 * Comparative Analyzer Test Wrapper
 * 
 * Tests both the feature branch (with enhancements) and main branch
 * against the battle test suite, then shows side-by-side comparison
 * 
 * Usage:
 *   node test-comparison.js                    # Test both branches
 *   node test-comparison.js --feature-only     # Test feature branch only
 *   node test-comparison.js --main-only        # Test main branch only
 *   node test-comparison.js --report           # Generate comparison report
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  log(`\n${'='.repeat(80)}`, 'blue');
  log(`${title}`, 'bright');
  log(`${'='.repeat(80)}\n`, 'blue');
}

function exec(command, options = {}) {
  try {
    return execSync(command, { 
      cwd: __dirname,
      encoding: 'utf8',
      stdio: options.stdio || 'pipe',
      ...options 
    });
  } catch (error) {
    if (options.ignoreError) {
      return '';
    }
    throw error;
  }
}

/**
 * Get current git branch
 */
function getCurrentBranch() {
  return exec('git rev-parse --abbrev-ref HEAD').trim();
}

/**
 * Get git status
 */
function getGitStatus() {
  const status = exec('git status --porcelain', { ignoreError: true });
  return status.trim().split('\n').filter(line => line);
}

/**
 * Stash changes
 */
function stashChanges() {
  log('📦 Stashing changes...', 'cyan');
  exec('git stash');
  log('✅ Changes stashed\n', 'green');
}

/**
 * Restore changes
 */
function restoreChanges() {
  log('📦 Restoring changes...', 'cyan');
  exec('git stash pop', { ignoreError: true });
  log('✅ Changes restored\n', 'green');
}

/**
 * Switch to branch
 */
function switchBranch(branch) {
  log(`🔀 Switching to branch: ${branch}`, 'cyan');
  exec(`git checkout ${branch}`);
  log(`✅ On branch: ${branch}\n`, 'green');
}

/**
 * Run battle test and extract results
 */
async function runBattleTest() {
  log('🧪 Running battle test...', 'cyan');
  
  try {
    const output = exec('npm run analyze:battle 2>&1', { stdio: 'pipe' });
    
    // Parse results from output
    const lines = output.split('\n');
    const results = {
      comprehensive: null,
      actions: null,
      codespaces: null,
      total: null,
    };

    for (const line of lines) {
      if (line.includes('Comprehensive Test Skill')) {
        const match = line.match(/(\d+)\/(\d+)/);
        if (match) results.comprehensive = { detected: parseInt(match[1]), expected: parseInt(match[2]) };
      }
      if (line.includes('GitHub Actions Efficiency')) {
        const match = line.match(/(\d+)\/(\d+)/);
        if (match) results.actions = { detected: parseInt(match[1]), expected: parseInt(match[2]) };
      }
      if (line.includes('GitHub Codespaces Efficiency')) {
        const match = line.match(/(\d+)\/(\d+)/);
        if (match) results.codespaces = { detected: parseInt(match[1]), expected: parseInt(match[2]) };
      }
      if (line.includes('TOTAL:')) {
        const match = line.match(/(\d+)\/(\d+)/);
        if (match) results.total = { detected: parseInt(match[1]), expected: parseInt(match[2]) };
      }
    }

    log('✅ Battle test complete\n', 'green');
    return results;
  } catch (error) {
    log(`❌ Battle test failed: ${error.message}`, 'red');
    return null;
  }
}

/**
 * Build project
 */
function buildProject() {
  log('🔨 Building project...', 'cyan');
  try {
    exec('npm run build 2>&1', { stdio: 'pipe' });
    log('✅ Build successful\n', 'green');
    return true;
  } catch (error) {
    log(`❌ Build failed: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Format results table
 */
function formatResults(results) {
  if (!results || !results.total) {
    return 'FAILED TO RUN';
  }

  const rate = Math.round((results.total.detected / results.total.expected) * 100);
  const status = rate >= 77 ? '✅' : rate >= 60 ? '⚠️' : '❌';

  let table = `
| Skill | Expected | Detected | Rate |
|-------|----------|----------|------|
`;
  
  if (results.comprehensive) {
    const cRate = Math.round((results.comprehensive.detected / results.comprehensive.expected) * 100);
    table += `| Comprehensive | ${results.comprehensive.expected} | ${results.comprehensive.detected} | ${cRate}% |\n`;
  }
  
  if (results.actions) {
    const aRate = Math.round((results.actions.detected / results.actions.expected) * 100);
    table += `| Actions | ${results.actions.expected} | ${results.actions.detected} | ${aRate}% |\n`;
  }
  
  if (results.codespaces) {
    const coRate = Math.round((results.codespaces.detected / results.codespaces.expected) * 100);
    table += `| Codespaces | ${results.codespaces.expected} | ${results.codespaces.detected} | ${coRate}% |\n`;
  }

  table += `\n**TOTAL:** ${results.total.detected}/${results.total.expected} (${rate}%) ${status}`;

  return table;
}

/**
 * Main comparison test
 */
async function main() {
  const args = process.argv.slice(2);
  const featureOnly = args.includes('--feature-only');
  const mainOnly = args.includes('--main-only');
  const generateReport = args.includes('--report');

  logSection('🔬 Comparative Analyzer Test');

  // Check git status
  const currentBranch = getCurrentBranch();
  const isDirty = getGitStatus().length > 0;

  log(`Current branch: ${currentBranch}`, 'cyan');
  log(`Working directory: ${isDirty ? 'DIRTY (has changes)' : 'CLEAN'}`, isDirty ? 'yellow' : 'green');

  if (isDirty && !mainOnly) {
    log('\n⚠️  You have uncommitted changes. These will be stashed for testing.', 'yellow');
    log('   They will be restored after testing.\n', 'yellow');
  }

  const results = {};

  // Test feature branch
  if (!mainOnly) {
    logSection('📊 Testing Feature Branch (with enhancements)');
    
    if (currentBranch !== 'feature/safe-model-selection') {
      log('⚠️  Not on feature branch, switching now...', 'yellow');
      switchBranch('feature/safe-model-selection');
    }

    if (!buildProject()) {
      log('❌ Build failed, aborting', 'red');
      process.exit(1);
    }

    results.feature = await runBattleTest();
  }

  // Test main branch
  if (!featureOnly) {
    logSection('📊 Testing Main Branch (unmodified)');

    if (isDirty && !mainOnly) {
      stashChanges();
    }

    switchBranch('main');

    if (!buildProject()) {
      log('❌ Build failed on main branch', 'red');
      switchBranch('feature/safe-model-selection');
      if (isDirty) restoreChanges();
      process.exit(1);
    }

    results.main = await runBattleTest();

    // Switch back and restore
    switchBranch('feature/safe-model-selection');
    if (isDirty && !mainOnly) {
      restoreChanges();
    }
  }

  // Display comparison
  logSection('📈 Comparison Results');

  if (results.main && results.feature) {
    log('MAIN BRANCH (unmodified):\n', 'cyan');
    log(formatResults(results.main));

    log('\n\n' + '='.repeat(80) + '\n', 'gray');

    log('FEATURE BRANCH (with enhancements):\n', 'cyan');
    log(formatResults(results.feature));

    // Calculate improvement
    if (results.main.total && results.feature.total) {
      const mainRate = Math.round((results.main.total.detected / results.main.total.expected) * 100);
      const featureRate = Math.round((results.feature.total.detected / results.feature.total.expected) * 100);
      const improvement = featureRate - mainRate;

      log('\n' + '='.repeat(80) + '\n', 'gray');

      const improvementColor = improvement > 0 ? 'green' : improvement < 0 ? 'red' : 'gray';
      const sign = improvement > 0 ? '+' : '';

      log(`📊 IMPROVEMENT: ${sign}${improvement}% (${mainRate}% → ${featureRate}%)`, improvementColor);

      if (improvement >= 10) {
        log('🎉 Significant improvement detected!', 'green');
      } else if (improvement > 0) {
        log('✅ Modest improvement detected', 'green');
      } else if (improvement === 0) {
        log('ℹ️  No change in detection rate', 'gray');
      } else {
        log('⚠️  Detection rate decreased', 'yellow');
      }
    }
  } else if (results.feature) {
    log('FEATURE BRANCH (with enhancements):\n', 'cyan');
    log(formatResults(results.feature));
  } else if (results.main) {
    log('MAIN BRANCH (unmodified):\n', 'cyan');
    log(formatResults(results.main));
  }

  // Generate report if requested
  if (generateReport) {
    generateMarkdownReport(results);
  }

  logSection('✅ Test Complete');
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(results) {
  const timestamp = new Date().toISOString();
  const mainCommit = exec('git rev-parse main').trim().substring(0, 7);
  const featureCommit = exec('git rev-parse feature/safe-model-selection').trim().substring(0, 7);

  let report = `# Analyzer Comparison Report

**Generated:** ${timestamp}

## Branches Tested

- **Main:** ${mainCommit}
- **Feature:** ${featureCommit}

## Results

### Main Branch (Unmodified Analyzer)

${results.main ? formatResults(results.main) : 'NOT TESTED'}

### Feature Branch (With Enhancements)

${results.feature ? formatResults(results.feature) : 'NOT TESTED'}

## Analysis

`;

  if (results.main && results.feature) {
    const mainRate = Math.round((results.main.total.detected / results.main.total.expected) * 100);
    const featureRate = Math.round((results.feature.total.detected / results.feature.total.expected) * 100);
    const improvement = featureRate - mainRate;

    report += `### Detection Rate Improvement

- **Main:** ${mainRate}%
- **Feature:** ${featureRate}%
- **Improvement:** +${improvement}%

### Conclusion

`;

    if (improvement >= 15) {
      report += `The feature branch shows **substantial improvement** (${improvement}% better detection rate). This validates that the analyzer enhancements are effective at catching real-world issues.`;
    } else if (improvement >= 5) {
      report += `The feature branch shows **meaningful improvement** (${improvement}% better detection rate). The enhancements improve detection capability.`;
    } else if (improvement > 0) {
      report += `The feature branch shows **modest improvement** (${improvement}% better detection rate). Further refinement may be beneficial.`;
    } else if (improvement === 0) {
      report += `The feature branch shows **no change** in detection rate. The enhancements may target different issue types.`;
    } else {
      report += `The feature branch shows **lower detection rate** (${improvement}% worse). This may indicate regressions that need investigation.`;
    }
  }

  const reportPath = path.join(__dirname, 'COMPARISON-REPORT.md');
  fs.writeFileSync(reportPath, report);
  
  log(`\n📄 Report saved: ${reportPath}`, 'cyan');
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
