import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';

const WORKSPACE_FOLDER = path.resolve(__dirname, '..');
const TEST_TIMEOUT = 120000;

test('Extension loads and analyzes skill file', { timeout: TEST_TIMEOUT }, async ({ page }) => {
  // Create a temporary directory for test data
  const testDir = `/tmp/vscode-test-${Date.now()}`;
  const configDir = path.join(testDir, '.config');
  
  try {
    fs.mkdirSync(testDir, { recursive: true });
    fs.mkdirSync(configDir, { recursive: true });

    // Create a test skill file with minimal content
    const skillFile = path.join(testDir, 'test.skill.md');
    const skillContent = `---
name: Test Skill  
description: A test skill
---

# Test Skill

Respond as a helpful assistant.`;
    
    fs.writeFileSync(skillFile, skillContent);
    console.log(`Created test skill file: ${skillFile}`);

    // Build the extension first
    console.log('Building extension...');
    const buildResult = child_process.spawnSync('npm', ['run', 'build'], {
      cwd: WORKSPACE_FOLDER,
      encoding: 'utf8',
      stdio: 'pipe',
    });
    
    if (buildResult.status !== 0) {
      console.error('Build failed:', buildResult.stderr);
      throw new Error(`Build failed: ${buildResult.stderr}`);
    }
    console.log('Build succeeded');

    // Launch VS Code with extension development path
    console.log('Launching VS Code...');
    const vscodeProcess = child_process.spawn('code', [
      '--extensionDevelopmentPath=' + WORKSPACE_FOLDER,
      '--user-data-dir=' + configDir,
      '--no-sandbox',
      skillFile,
    ], {
      stdio: 'pipe',
      detached: true,
    });

    const vscodeStartTime = Date.now();
    const maxWait = 60000; // 60 second startup timeout
    
    // Wait for VS Code to start
    await new Promise(resolve => setTimeout(resolve, 10000));

    console.log('VS Code should be starting...');
    console.log(`Test file at: ${skillFile}`);
    console.log(`Config dir: ${configDir}`);
    
    // Check for log files
    const logsDir = path.join(configDir, 'User', 'workspaceStorage');
    console.log(`Looking for logs in: ${logsDir}`);
    
    // Wait a bit more for logs to be written
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    if (fs.existsSync(logsDir)) {
      const entries = fs.readdirSync(logsDir, { recursive: true });
      console.log(`Found log entries:`, entries);
      
      // Find Chat Customizations log
      const chatLogFiles = entries.filter(e => 
        typeof e === 'string' && e.includes('Chat Customizations') && e.endsWith('.log')
      );
      
      console.log(`Chat Customizations logs:`, chatLogFiles);
      
      if (chatLogFiles.length > 0) {
        const logPath = path.join(logsDir as string, chatLogFiles[0] as string);
        console.log(`Reading log from: ${logPath}`);
        const logContent = fs.readFileSync(logPath, 'utf8');
        console.log('=== Extension Output ===');
        console.log(logContent);
        console.log('=== End of Output ===');
        
        // Check for errors
        if (logContent.includes('Error')) {
          console.error('⚠️ Errors found in log:');
          const errorLines = logContent.split('\n').filter(l => l.includes('Error'));
          errorLines.forEach(line => console.error(`  ${line}`));
        }
      }
    } else {
      console.log('No logs directory found yet');
    }
    
    // Try to cleanup VS Code
    try {
      child_process.spawnSync('pkill', ['-f', 'code.*' + WORKSPACE_FOLDER], {
        stdio: 'ignore',
      });
    } catch (e) {
      console.log('Could not kill VS Code, it may have already exited');
    }

  } finally {
    // Cleanup
    console.log('Cleaning up test directory...');
    try {
      fs.rmSync(testDir, { recursive: true, force: true });
    } catch (e) {
      console.log(`Could not cleanup ${testDir}:`, e);
    }
  }
});
