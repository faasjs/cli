import { Command } from 'commander';
import Logger from '@faasjs/logger';
import { existsSync } from 'fs';
import deploy from './commands/deploy';
import server from './commands/server';

require('ts-node').register({
  project: process.cwd() + '/tsconfig.json',
  compilerOptions: {
    module: 'commonjs'
  }
});

const commander: Command = new Command();
const logger = new Logger('Cli');

// 设置命令
commander
  .version('beta')
  .usage('[command] [flags]')
  .option('-v --verbose', '显示调试日志')
  .option('-r --root <path>', '项目根目录，默认为命令执行时所在的目录')
  .option('-e --env <staging>', '环境，默认为 development', 'development')

  .on('option:verbose', function (this: { verbose?: boolean }) {
    if (this.verbose) {
      process.env.verbose = '1';
      process.env.FaasLog = 'debug';
    }
    logger.debug('已启用调试信息展示');
  })
  .on('option:root', function (this: { root?: string }) {
    if (this.root && existsSync(this.root)) {
      process.env.FaasRoot = this.root;
      if (!this.root.endsWith('/')) {
        process.env.FaasRoot += '/';
      }
    } else {
      throw Error(`can't find root path: ${this.root}`);
    }
    logger.debug('root: %s', process.env.FaasRoot);
  })
  .on('option:env', function (this: { env?: string }) {
    if (this.env) {
      process.env.FaasEnv = this.env;
    }
    logger.debug('env: %s', process.env.FaasEnv);
  })
  .on('command:*', function () {
    logger.error('未知指令');
  });

// 加载命令
deploy(commander);
server(commander);

if (!process.env.CI && process.argv[0] !== 'fake') {
  commander.parse(process.argv);
}

export default commander;
