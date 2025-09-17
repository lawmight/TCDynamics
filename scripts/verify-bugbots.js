#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying BugBots setup...');

const checks = [
  {
    name: 'GitHub Actions workflow',
    path: '.github/workflows/auto-bug-fix.yml',
    required: true
  },
  {
    name: 'CodeQL workflow',
    path: '.github/workflows/codeql.yml',
    required: true
  },
  {
    name: 'Dependabot configuration',
    path: '.github/dependabot.yml',
    required: true
  },
  {
    name: 'Auto bug fixer script',
    path: 'scripts/auto-bug-fixer.js',
    required: true
  },
  {
    name: 'Bug monitor script',
    path: 'scripts/bug-monitor.js',
    required: true
  },
  {
    name: 'ESLint configuration',
    path: '.eslintrc.js',
    required: false
  },
  {
    name: 'Prettier configuration',
    path: '.prettierrc',
    required: false
  }
];

let allGood = true;

checks.forEach(check => {
  if (fs.existsSync(check.path)) {
    console.log(`✅ ${check.name}: Found`);
  } else {
    if (check.required) {
      console.log(`❌ ${check.name}: Missing (required)`);
      allGood = false;
    } else {
      console.log(`⚠️  ${check.name}: Missing (optional)`);
    }
  }
});

// Check package.json scripts
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = ['bug-fix', 'bug-monitor'];

requiredScripts.forEach(script => {
  if (packageJson.scripts && packageJson.scripts[script]) {
    console.log(`✅ Package script '${script}': Found`);
  } else {
    console.log(`❌ Package script '${script}': Missing`);
    allGood = false;
  }
});

if (allGood) {
  console.log('\n🎉 BugBots setup verification passed!');
  console.log('\nNext steps:');
  console.log('1. Copy .env.bugbots to .env and configure your tokens');
  console.log('2. Run: npm run bug-fix:dry');
  console.log('3. Run: npm run bug-monitor');
} else {
  console.log('\n❌ BugBots setup verification failed!');
  console.log('Please check the missing components above.');
  process.exit(1);
}
