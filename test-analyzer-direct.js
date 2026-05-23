#!/usr/bin/env node
/**
 * Direct analyzer test with debug logging
 * Runs without Playwright or browser dependencies
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE = __dirname; // Project root is where this script is
const DEBUG_LOG = '/tmp/vscode-analyzer-debug.log';
const MOCK_SKILL = path.join(WORKSPACE, 'mock_skill', 'github-codespaces-efficiency', 'SKILL.md');

// Set up debug logging
process.env.DEBUG_LOG = DEBUG_LOG;

console.log('🧪 Direct Analyzer Test');
console.log('=====================\n');

console.log('📝 Configuration:');
console.log(`  Workspace: ${WORKSPACE}`);
console.log(`  Debug Log: ${DEBUG_LOG}`);
console.log(`  Skill File: ${MOCK_SKILL}`);

if (!fs.existsSync(MOCK_SKILL)) {
  console.error(`❌ Skill file not found: ${MOCK_SKILL}`);
  process.exit(1);
}

// Clean old debug log
if (fs.existsSync(DEBUG_LOG)) {
  fs.unlinkSync(DEBUG_LOG);
  console.log('✅ Cleared old debug log\n');
}

// Import analyzer
console.log('📦 Importing LLMAnalyzer...');
try {
  const analyzerModule = await import(path.join(WORKSPACE, 'out', 'analyzers', 'llm.js'));
  const LLMAnalyzer = analyzerModule.LLMAnalyzer;
  
  console.log('✅ Analyzer imported\n');
  
  // Read skill file
  console.log('📖 Reading skill file...');
  const skillContent = fs.readFileSync(MOCK_SKILL, 'utf8');
  console.log(`✅ Read ${skillContent.length} characters\n`);
  
  // Create mock text document
  console.log('🔨 Creating mock TextDocument...');
  const mockDoc = {
    uri: MOCK_SKILL,
    getText: () => skillContent,
    languageId: 'markdown',
    lineCount: skillContent.split('\n').length,
    getLineContent: (line) => skillContent.split('\n')[line] || '',
  };
  console.log('✅ Mock TextDocument created\n');
  
  // Create analyzer
  console.log('🔧 Creating analyzer instance...');
  const analyzer = new LLMAnalyzer();
  
  // Mock the proxy function - just return empty results
  analyzer.setProxyFn(async (request) => {
    console.log('📡 LLM proxy called (mocked)\n');
    
    // Return mock analysis results
    return {
      text: JSON.stringify({
        contradictions: [],
        ambiguity_issues: [{
          text: 'Test ambiguity',
          type: 'term',
          severity: 'info',
          problem: 'Test issue',
          suggestion: 'Test suggestion'
        }],
        persona_issues: [],
        cognitive_load: { issues: [] },
        semantic_coverage: { issues: [] }
      }),
      error: undefined,
    };
  });
  
  console.log('✅ Analyzer configured with mock proxy\n');
  
  // Run analysis
  console.log('🚀 Running analysis...\n');
  const results = await analyzer.analyze(mockDoc);
  
  console.log(`✅ Analysis complete: ${results.length} results\n`);
  
  // Display results
  console.log('📊 Results:');
  results.forEach((r, i) => {
    console.log(`  ${i + 1}. [${r.severity}] ${r.code}: ${r.message}`);
  });
  
  // Read and display debug log
  console.log('\n' + '='.repeat(60));
  console.log('📋 DEBUG LOG');
  console.log('='.repeat(60) + '\n');
  
  if (fs.existsSync(DEBUG_LOG)) {
    const debugContent = fs.readFileSync(DEBUG_LOG, 'utf8');
    console.log(debugContent);
    
    // Analyze debug log
    console.log('\n' + '='.repeat(60));
    console.log('📊 ANALYSIS:');
    console.log('='.repeat(60));
    
    const lines = debugContent.split('\n');
    console.log(`Total log lines: ${lines.length}`);
    
    const parseErrors = lines.filter(l => l.includes('PARSE ERROR'));
    console.log(`Parse errors: ${parseErrors.length}`);
    if (parseErrors.length > 0) {
      console.log('Error details:');
      parseErrors.forEach(e => console.log('  ', e));
    }
    
    const started = lines.some(l => l.includes('=== Starting analysis'));
    const completed = lines.some(l => l.includes('=== Analysis complete'));
    
    console.log(`Analysis started: ${started ? '✅' : '❌'}`);
    console.log(`Analysis completed: ${completed ? '✅' : '❌'}`);
  } else {
    console.warn('⚠️  No debug log created');
  }
  
  console.log('\n✅ Test completed successfully!');
  process.exit(0);
  
} catch (error) {
  console.error('❌ Test failed:');
  console.error(error);
  
  // Show debug log if it was created
  if (fs.existsSync(DEBUG_LOG)) {
    console.log('\n📋 Debug log contents:');
    console.log(fs.readFileSync(DEBUG_LOG, 'utf8'));
  }
  
  process.exit(1);
}
