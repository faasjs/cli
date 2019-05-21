import { Command } from 'commander';
import Logger from '@faasjs/logger';
import { existsSync } from 'fs';
import Deployer from '@faasjs/deployer';
import { defaultsEnv } from '../helper';

export async function action (name: string) {
  defaultsEnv();
  const logger = new Logger('@faasjs/cli/deploy');

  if (!existsSync(process.env.FaasRoot + 'config/providers/' + process.env.FaasEnv + '.yaml')) {
    throw Error(`Config not found: ${process.env.FaasRoot}config/providers/${process.env.FaasEnv}.yaml'}`);
  }

  let path = process.env.FaasRoot + name;

  if (!existsSync(path)) {
    console.error(path);
    throw Error(`File not found: ${path}`);
  }

  logger.debug(path);

  const deployer = new Deployer(process.env.FaasRoot!, path, process.env.FaasEnv);

  const res = await deployer.build();
  return deployer.deploy(res);
}

export default function (program: Command) {
  program
    .command('deploy <name>')
    .name('deploy')
    .description('发布')
    .on('--help', function () {
      console.log(`
Examples:
  yarn deploy services/demo.flow.ts -e testing
  yarn deploy services/demo.flow.ts -e production`);
    })
    .action(action);
}
