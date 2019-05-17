import { Command } from 'commander';
import Logger from '@faasjs/logger';
import { existsSync } from 'fs';
import deploy from './commands/deploy';

const commander: Command = new Command();
const logger = new Logger('@faasjs/cli');

commander
  .version('0.0.0-alpha.0')
  .usage('[command] [flags]')
  .option('-v --verbose', '显示调试日志')
  .option('-r --root <path>', '项目根目录，默认为命令执行时所在的目录')

  .on('option:verbose', function (this: { verbose?: boolean }) {
    if (this.verbose) {
      process.env.verbose = '1';
    }
    logger.debug('已启用调试信息展示');
  })
  .on('option:root', function (this: { root?: string }) {
    if (this.root && existsSync(this.root)) {
      process.env.faasRoot = this.root;
    } else {
      throw Error(`can't find root path: ${this.root}`);
    }
    logger.debug('root: %s', process.env.faasRoot);
  })
  .on('command:*', function () {
    logger.error('未知指令');
  });

// 加载命令
deploy(commander);

if (process.argv[0] !== 'fake') {
  commander.parse(process.argv);
}

export default commander;
