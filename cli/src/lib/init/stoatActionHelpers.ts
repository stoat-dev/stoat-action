import { getLocationForJsonPath, parseWithPointers } from '@stoplight/yaml';
import chalk from 'chalk';
import fs from 'fs';
import inquirer from 'inquirer';
import * as yaml from 'js-yaml';
import path from 'path';

import { gitRoot } from '../pathHelpers';
import { addStoatActionToYaml } from './configFileHelpers';

export interface GhJob {
  name: string;
  workflowFile: string;
}

function addStoatAction(jobs: GhJob[]) {
  jobs.forEach((job) => {
    const newYaml = addStoatActionToYaml(job);
    fs.writeFileSync(job.workflowFile, newYaml);
    console.log(`Added Stoat action for job: ${job.workflowFile} (${job.name})`);
  });
}

async function approveWorkflows(jobs: GhJob[]) {
  for (const job of jobs) {
    const questions = [
      {
        type: 'confirm',
        name: 'confirm',
        message: `Add Stoat action for: ${job.workflowFile} (${job.name})`,
        default: false
      }
    ];

    await inquirer.prompt(questions).then((answers: any) => {
      if (answers.confirm) {
        addStoatAction([job]);
      } else {
        console.log(`Skipping adding Stoat action for job: ${job.workflowFile} (${job.name})`);
      }
    });
  }

  console.log('\n');
}

function getRelevantJobs(dir: string): GhJob[] {
  const filenames = fs.readdirSync(dir);
  const matchingJobs: GhJob[] = [];

  for (const filename of filenames) {
    const fullPath = path.join(dir, filename);
    const isDirectory = fs.lstatSync(fullPath).isDirectory();

    if (isDirectory) {
      matchingJobs.push(...getRelevantJobs(fullPath));
    } else if (path.extname(filename) === '.yml' || path.extname(filename) === '.yaml') {
      const contents = fs.readFileSync(fullPath, 'utf8');

      try {
        const workflow: any = yaml.load(contents);

        if (('jobs' in workflow && 'on' in workflow && 'pull_request' in workflow.on) || 'push' in workflow.on) {
          for (const job in workflow.jobs) {
            if ('steps' in workflow.jobs[job]) {
              const steps = workflow.jobs[job].steps as any[];

              if (
                steps.length > 0 &&
                steps.filter((step) => 'uses' in step && step.uses.includes('stoat-dev/stoat-action')).length === 0
              ) {
                matchingJobs.push({ name: job, workflowFile: fullPath });
              }
            }
          }
        }
      } catch (e) {
        console.warn(chalk.yellow(`Skipping workflow ${filename}: invalid YAML`));
      }
    }
  }

  return matchingJobs;
}

export async function promptAddingStoatActions() {
  const relevantJobs = getRelevantJobs(path.join(gitRoot, '.github'));

  if (relevantJobs.length > 0) {
    const jobList = relevantJobs.map((job) => `   - ${job.workflowFile} (${job.name})`).join('\n');

    const questions = [
      {
        type: 'list',
        name: 'action',
        message: `\nThe following GitHub jobs do not have Stoat actions:\n${jobList}\n\nThe action is necessary to publish build artifacts or metrics to Stoat.\n\nWould you like to add the Stoat GitHub action as the final step to these workflows?`,
        choices: ['No (to all)', 'Yes (to all)', 'Approve each workflow individually'],
        filter(val: string) {
          return val.split(' ')[0].toLowerCase();
        }
      }
    ];

    await inquirer.prompt(questions).then(async (answers: any) => {
      console.log('\n');

      switch (answers.action) {
        case 'no': {
          break;
        }
        case 'yes': {
          addStoatAction(relevantJobs);
          break;
        }
        case 'approve': {
          await approveWorkflows(relevantJobs);
          break;
        }
        default: {
          throw new Error(`Invalid question response: ${answers.action}`);
        }
      }
    });
  }
}

export {};
