import { Command } from 'commander';
import Logger from '@faasjs/logger';
import { existsSync } from 'fs';
import Deployer from '@faasjs/deployer';

export async function action (name: string, opts: {
  staging: string;
}) {
  const logger = new Logger('@faasjs/cli/deploy');

  if (!process.env.faasRoot) {
    process.env.faasRoot = process.cwd();
  }

  if (!process.env.faasRoot.endsWith('/')) {
    process.env.faasRoot += '/';
  }

  let path = process.env.faasRoot + name;

  if (!existsSync(path)) {
    console.error(path);
    throw Error(`File not found: ${path}`);
  }

  logger.debug(path);

  const deployer = new Deployer(process.env.faasRoot, path, opts.staging);

  const res = await deployer.build();
  return deployer.deploy(res);
}

export default function (program: Command) {
  program
    .command('deploy <name>')
    .name('deploy')
    .description('发布')
    .option('-e, --env', '发布环境', 'testing')
    .on('--help', function () {
      console.log(`
Examples:
  yarn deploy services/demo.flow.ts
  yarn deploy services/demo.flow.ts -e production`);
    })
    .action(action);
}
