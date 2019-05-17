import { Command } from 'commander';
import Logger from '@faasjs/logger';
import { existsSync } from 'fs';
import Deployer from '@faasjs/deployer';

export async function action (name: string, opts: {
  env: string;
}) {
  const logger = new Logger('@faasjs/cli/deploy');

  if (!process.env.faasRoot) {
    process.env.faasRoot = process.cwd();
  }

  if (!process.env.faasRoot.endsWith('/')) {
    process.env.faasRoot += '/';
  }

  if (!existsSync(process.env.faasRoot + 'config/providers/' + opts.env + '.yaml')) {
    throw Error(`Config not found: ${process.env.faasRoot}config/providers/${opts.env}.yaml'}`);
  }

  let path = process.env.faasRoot + name;

  if (!existsSync(path)) {
    console.error(path);
    throw Error(`File not found: ${path}`);
  }

  logger.debug(path);

  const deployer = new Deployer(process.env.faasRoot, path, opts.env);

  const res = await deployer.build();
  return deployer.deploy(res);
}

export default function (program: Command) {
  program
    .command('deploy <name>')
    .name('deploy')
    .description('发布')
    .option('-e, --env <staging>', '环境', 'testing')
    .on('--help', function () {
      console.log(`
Examples:
  yarn deploy services/demo.flow.ts -e testing
  yarn deploy services/demo.flow.ts -e production`);
    })
    .action(action);
}
