#!/usr/bin/env node

/**
 * Get the latest failed workflow ID for the current commit
 */

const { execSync } = require('child_process');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
const GITHUB_SHA = process.env.GITHUB_SHA;

if (!GITHUB_TOKEN || !GITHUB_REPOSITORY || !GITHUB_SHA) {
  console.error('Missing required environment variables');
  process.exit(1);
}

try {
  const response = execSync(
    `curl -s -H "Authorization: token ${GITHUB_TOKEN}" \
     -H "Accept: application/vnd.github.v3+json" \
     "https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/runs?head_sha=${GITHUB_SHA}&status=completed&conclusion=failure&per_page=1"`,
    { encoding: 'utf-8' }
  );

  const data = JSON.parse(response);
  const runs = data.workflow_runs || [];

  if (runs.length > 0) {
    const latestFailed = runs[0];
    console.log(latestFailed.id);
    process.exit(0);
  } else {
    console.error('No failed workflows found');
    process.exit(1);
  }
} catch (error) {
  console.error('Error getting failed workflow:', error.message);
  process.exit(1);
}
