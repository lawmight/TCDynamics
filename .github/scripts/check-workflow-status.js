#!/usr/bin/env node

/**
 * Check if there are any failed workflows for the current push
 */

const { execSync } = require('child_process');
const fs = require('fs');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
const GITHUB_SHA = process.env.GITHUB_SHA;

if (!GITHUB_TOKEN || !GITHUB_REPOSITORY || !GITHUB_SHA) {
  console.error('Missing required environment variables');
  console.error(`GITHUB_TOKEN: ${GITHUB_TOKEN ? 'set' : 'missing'}`);
  console.error(`GITHUB_REPOSITORY: ${GITHUB_REPOSITORY || 'missing'}`);
  console.error(`GITHUB_SHA: ${GITHUB_SHA || 'missing'}`);
  // Don't fail the workflow, just report no failures
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    fs.appendFileSync(outputFile, 'failed=false\n');
  }
  process.exit(0);
}

try {
  // Get workflows for this commit
  const response = execSync(
    `curl -s -H "Authorization: token ${GITHUB_TOKEN}" \
     -H "Accept: application/vnd.github.v3+json" \
     "https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/runs?head_sha=${GITHUB_SHA}"`,
    { encoding: 'utf-8' }
  );

  const data = JSON.parse(response);
  const runs = data.workflow_runs || [];

  // Check for failed runs (excluding this workflow)
  const failedRuns = runs.filter(
    (run) =>
      run.conclusion === 'failure' &&
      run.name !== 'Cursor CI Agent' &&
      run.status === 'completed'
  );

  const outputFile = process.env.GITHUB_OUTPUT;
  
  if (failedRuns.length > 0) {
    console.log(`Found ${failedRuns.length} failed workflow(s)`);
    
    if (outputFile) {
      fs.appendFileSync(
        outputFile,
        `failed=true\nfailed_count=${failedRuns.length}\nworkflow_ids=${failedRuns.map((r) => r.id).join(',')}\n`
      );
    } else {
      // Fallback for local testing
      console.log(`::set-output name=failed::true`);
      console.log(`::set-output name=failed_count::${failedRuns.length}`);
      console.log(`::set-output name=workflow_ids::${failedRuns.map((r) => r.id).join(',')}`);
    }
    
    process.exit(0);
  } else {
    console.log('No failed workflows found');
    
    if (outputFile) {
      fs.appendFileSync(outputFile, 'failed=false\n');
    } else {
      console.log(`::set-output name=failed::false`);
    }
    
    process.exit(0);
  }
} catch (error) {
  console.error('Error checking workflow status:', error.message);
  // Don't fail the workflow if we can't check status
  process.exit(0);
}
