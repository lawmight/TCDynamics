#!/usr/bin/env node

/**
 * Get failure context from a workflow run
 */

const { execSync } = require('child_process');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
const workflowId = process.argv[2];

if (!GITHUB_TOKEN || !GITHUB_REPOSITORY || !workflowId) {
  console.error('Usage: get-failure-context.js <workflow_id>');
  process.exit(1);
}

try {
  // Get workflow run details
  const runResponse = execSync(
    `curl -s -H "Authorization: token ${GITHUB_TOKEN}" \
     -H "Accept: application/vnd.github.v3+json" \
     "https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/runs/${workflowId}"`,
    { encoding: 'utf-8' }
  );

  const run = JSON.parse(runResponse);
  
  // Get jobs for this workflow
  const jobsResponse = execSync(
    `curl -s -H "Authorization: token ${GITHUB_TOKEN}" \
     -H "Accept: application/vnd.github.v3+json" \
     "${run.jobs_url}"`,
    { encoding: 'utf-8' }
  );

  const jobsData = JSON.parse(jobsResponse);
  const failedJobs = (jobsData.jobs || []).filter((job) => job.conclusion === 'failure');

  let context = `Workflow: ${run.name}\nStatus: ${run.conclusion}\nCommit: ${run.head_sha}\n\n`;

  if (failedJobs.length > 0) {
    context += `Failed Jobs:\n`;
    
    for (const job of failedJobs) {
      context += `\n- Job: ${job.name} (${job.conclusion})\n`;
      
      // Get steps for this job
      const stepsResponse = execSync(
        `curl -s -H "Authorization: token ${GITHUB_TOKEN}" \
         -H "Accept: application/vnd.github.v3+json" \
         "${job.steps_url}"`,
        { encoding: 'utf-8' }
      );

      const stepsData = JSON.parse(stepsResponse);
      const failedSteps = (stepsData.steps || []).filter(
        (step) => step.conclusion === 'failure'
      );

      if (failedSteps.length > 0) {
        context += `  Failed Steps:\n`;
        for (const step of failedSteps) {
          context += `    - ${step.name}: ${step.conclusion}\n`;
        }
      }
    }
  }

  console.log(context);
  process.exit(0);
} catch (error) {
  console.error('Error getting failure context:', error.message);
  // Return minimal context if API fails
  console.log(`Workflow ${workflowId} failed. Unable to fetch detailed context.`);
  process.exit(0);
}
