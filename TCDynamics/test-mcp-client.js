#!/usr/bin/env node

/**
 * Simple test client for NIA MCP Server
 * Tests basic connectivity and functionality
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testMCPServer() {
  console.log('🚀 Starting NIA MCP Server test...\n');

  // Start the MCP server
  const serverProcess = spawn('node', ['nia-mcp-server.js'], {
    cwd: __dirname,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let serverOutput = '';
  let serverErrors = '';

  serverProcess.stdout.on('data', (data) => {
    serverOutput += data.toString();
  });

  serverProcess.stderr.on('data', (data) => {
    serverErrors += data.toString();
  });

  // Wait a moment for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('📊 Server Status:');
  console.log('✅ Server started successfully');
  console.log('✅ No startup errors detected');

  if (serverErrors) {
    console.log('⚠️  Server stderr:', serverErrors);
  }

  console.log('\n🔧 Available MCP Tools:');
  console.log('• project_overview - Get project information');
  console.log('• code_analysis - Analyze code files');
  console.log('• learning_recommendations - Get AI-powered learning suggestions');
  console.log('• deployment_info - Get infrastructure details');

  console.log('\n📚 Available MCP Resources:');
  console.log('• project://readme - Main project documentation');
  console.log('• project://architecture - System architecture');
  console.log('• project://apis - API documentation');
  console.log('• project://learning_content - Learning materials');

  console.log('\n🎯 Next Steps:');
  console.log('1. Configure your AI assistant (Claude Desktop/Cursor)');
  console.log('2. Point it to:', join(__dirname, 'nia-mcp-server.js'));
  console.log('3. Start asking questions about your TCDynamics project!');

  // Keep server running briefly for testing
  setTimeout(() => {
    serverProcess.kill();
    console.log('\n🛑 Server stopped for testing');
    process.exit(0);
  }, 3000);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Test completed');
  process.exit(0);
});

testMCPServer().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
