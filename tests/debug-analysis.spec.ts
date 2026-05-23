import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';

const WORKSPACE_FOLDER = path.resolve(__dirname, '..');
const TEST_TIMEOUT = 180000;
const DEBUG_LOG = '/tmp/vscode-analyzer-debug.log';

test('Analyze skill file with debug logging', { timeout: TEST_TIMEOUT }, async ({ page }) => {
  // Clean up old debug log
  if (fs.existsSync(DEBUG_LOG)) {
    fs.unlinkSync(DEBUG_LOG);
  }

  const testDir = `/tmp/vscode-test-${Date.now()}`;
  const configDir = path.join(testDir, '.config');
  const skillFile = path.join(testDir, 'github-codespaces-efficiency.md');
  
  try {
    // Create test directory structure
    fs.mkdirSync(testDir, { recursive: true });
    fs.mkdirSync(configDir, { recursive: true });

    // Copy the mock skill file to test directory
    const sourceSkillFile = path.join(WORKSPACE_FOLDER, 'mock_skill', 'github-codespaces-efficiency', 'SKILL.md');
    const skillContent = fs.readFileSync(sourceSkillFile, 'utf8');
    fs.writeFileSync(skillFile, skillContent);
    console.log(`Created test skill file: ${skillFile}`);
    console.log(`Skill content length: ${skillContent.length} chars`);

    // Build extension
    console.log('\n📦 Building extension...');
    const buildResult = child_process.spawnSync('npm', ['run', 'build'], {
      cwd: WORKSPACE_FOLDER,
      encoding: 'utf8',
      stdio: 'pipe',
    });
    
    if (buildResult.status !== 0) {
      console.error('❌ Build failed:', buildResult.stderr);
      throw new Error(`Build failed: ${buildResult.stderr}`);
    }
    console.log('✅ Build succeeded');

    // Launch VS Code with debug logging enabled
    console.log('\n🚀 Launching VS Code with extension...');
    const env = { ...process.env, DEBUG_LOG };
    
    const vscodeProcess = child_process.spawn('code', [
      '--extensionDevelopmentPath=' + WORKSPACE_FOLDER,
      '--user-data-dir=' + configDir,
      '--no-sandbox',
      '--wait',
      skillFile,
    ], {
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
    });

    // Wait for VS Code to fully load and process
    console.log('⏳ Waiting for VS Code to launch and process file...');
    await new Promise(resolve => setTimeout(resolve, 15000));

    // Trigger analysis via command line
    console.log('📝 Triggering analysis via VS Code commands...');
    try {
      // Use VS Code CLI to run commands
      child_process.spawnSync('code', [
        '--folder-uri=' + 'file://' + skillFile,
        '--command=chatCustomizationsEvaluations.analyzePrompt',
      ], {
        env,
        stdio: 'ignore',
        timeout: 30000,
      });
    } catch (e) {
      console.log('Command execution note:', e);
    }

    // Wait for analysis to complete and debug log to be written
    console.log('⏳ Waiting for analysis to complete...');
    await new Promise(resolve => setTimeout(resolve, 20000));

    // Kill any lingering VS Code processes
    console.log('🛑 Cleaning up VS Code processes...');
    try {
      child_process.spawnSync('pkill', ['-9', '-f', 'code.*' + WORKSPACE_FOLDER], {
        stdio: 'ignore',
      });
    } catch (e) {
      // Ignore errors
    }

    // Check for debug log
    console.log('\n📋 Looking for debug log at:', DEBUG_LOG);
    if (!fs.existsSync(DEBUG_LOG)) {
      console.warn('⚠️  Debug log not found. This may indicate the extension never ran.');
      // Try to find logs in config dir instead
      const logsDir = path.join(configDir, 'User', 'workspaceStorage');
      if (fs.existsSync(logsDir)) {
        console.log('📂 Checking workspace storage...');
        const entries = fs.readdirSync(logsDir, { recursive: true });
        console.log('Entries found:', entries);
      }
    } else {
      const debugLog = fs.readFileSync(DEBUG_LOG, 'utf8');
      console.log('\n📄 ===== DEBUG LOG CONTENTS =====');
      console.log(debugLog);
      console.log('===== END DEBUG LOG =====\n');

      // Parse debug log to find issues
      const lines = debugLog.split('\n');
      const errors = lines.filter(l => l.includes('PARSE ERROR') || l.includes('failed'));
      const succeeded = lines.filter(l => l.includes('Successfully parsed'));
      
      console.log(`✅ Successful parses: ${succeeded.length}`);
      console.log(`❌ Parse errors: ${errors.length}`);

      if (errors.length > 0) {
        console.log('\n⚠️  ERROR DETAILS:');
        errors.forEach(err => console.log('  ', err));
      }

      // Check for specific phases
      const analysisStart = lines.find(l => l.includes('=== Starting analysis'));
      const analysisComplete = lines.find(l => l.includes('=== Analysis complete'));
      const loopDetected = lines.find(l => l.includes('Loop detected'));

      console.log('\n📊 ANALYSIS SUMMARY:');
      console.log('  Analysis started:', !!analysisStart);
      console.log('  Analysis completed:', !!analysisComplete);
      console.log('  Loop detected:', !!loopDetected);

      // Assertions
      expect(debugLog).toContain('=== Starting analysis ===');
      expect(debugLog).not.toContain('PARSE ERROR');
    }

  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    try {
      fs.rmSync(testDir, { recursive: true, force: true });
    } catch (e) {
      console.log(`Could not cleanup ${testDir}:`, e);
    }
    if (fs.existsSync(DEBUG_LOG)) {
      console.log(`Debug log saved at: ${DEBUG_LOG}`);
    }
  }
});
