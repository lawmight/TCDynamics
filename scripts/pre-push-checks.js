#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runCommand(command, description, cwd = process.cwd()) {
  try {
    console.log(`🔍 ${description}...`);
    execSync(command, {
      cwd,
      stdio: 'inherit',
      env: { ...process.env, CI: 'true' }
    });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed`);
    process.exit(1);
  }
}

function main() {
  console.log('🚀 Running comprehensive pre-push checks...\n');

  // Build verification
  runCommand('npm run build', 'Verifying build');

  // Run full test suite
  runCommand('npm run test -- --run', 'Running full test suite');

  // Backend checks
  console.log('\n🔧 Checking backend...');
  const backendPath = path.join(process.cwd(), 'backend');
  try {
    runCommand('npm ci --silent', 'Installing backend dependencies', backendPath);
    runCommand('npm run lint', 'Running backend linting', backendPath);
    runCommand('npm run test', 'Running backend tests', backendPath);
  } catch (error) {
    console.error('❌ Backend checks failed');
    process.exit(1);
  }

  // Azure Functions checks
  console.log('\n☁️ Checking Azure Functions...');
  const functionsPath = path.join(process.cwd(), 'TCDynamics');
  try {
    // Check if requirements.txt exists
    if (fs.existsSync(path.join(functionsPath, 'requirements.txt'))) {
      runCommand('pip install -r requirements.txt --quiet', 'Installing Python dependencies', functionsPath);
      runCommand('python -m flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics || true', 'Running Python linting', functionsPath);
      runCommand('python -m pytest --tb=short -q || true', 'Running Python tests', functionsPath);
    } else {
      console.log('⚠️ No requirements.txt found, skipping Python checks');
    }
  } catch (error) {
    console.error('❌ Azure Functions checks failed');
    process.exit(1);
  }

  // Security audit
  runCommand('npm audit --audit-level high', 'Auditing dependencies for security vulnerabilities');

  console.log('\n✅ All pre-push checks passed!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
