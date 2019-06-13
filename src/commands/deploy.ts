import { Command } from 'commander';
import Logger from '@faasjs/logger';
import { existsSync } from 'fs';
import { Deployer } from '@faasjs/deployer';
import { defaultsEnv } from '../helper';

export async function action (name: string) {
  defaultsEnv();
  const logger = new Logger('Cli');

  let path = process.env.FaasRoot + name;

  if (!existsSync(path)) {
    console.error(path);
    throw Error(`File not found: ${path}`);
  }

  logger.debug(path);

  const deployer = new Deployer({
    root: process.env.FaasRoot!,
    filename: path
  });

  await deployer.deploy();

  return true;
}

export default function (program: Command) {
  program
    .command('deploy <name>')
    .name('deploy')
    .description('发布')
    .on('--help', function () {
      console.log(`
Examples:
  yarn deploy services/demo.func.ts -e testing
  yarn deploy services/demo.func.ts -e production`);
    })
    .action(action);
}
