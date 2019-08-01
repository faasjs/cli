import { Command } from 'commander';
import { existsSync, lstatSync } from 'fs';
import { sync as globSync } from 'glob';
import { createInterface } from 'readline';
import { Deployer } from '@faasjs/deployer';
import { defaultsEnv } from '../helper';

export async function action (name: string) {
  defaultsEnv();

  let path = process.env.FaasRoot + name;

  if (!existsSync(path)) {
    console.error(path);
    throw Error(`File not found: ${path}`);
  }

  // 单个云函数文件直接部署
  if (lstatSync(path).isFile()) {
    const deployer = new Deployer({
      root: process.env.FaasRoot!,
      filename: path
    });
    await deployer.deploy();
  } else {
    // 文件夹
    if (!path.endsWith('/')) {
      path += '/';
    }
    const files = globSync(path + '*.func.ts').concat(globSync(path + '**/*.func.ts'));
    console.log(`[${process.env.FaasEnv}] 是否要发布以下云函数？`);
    console.log('');
    for (const file of files) {
      console.log(file);
    }
    console.log('');
    const readline = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    readline.question('输入 y 确认:', async function (res) {
      readline.close();

      if (res !== 'y') {
        console.error('停止发布');
        return;
      } else {
        for (const file of files) {
          const deployer = new Deployer({
            root: process.env.FaasRoot!,
            filename: file
          });
          await deployer.deploy();
        }
      }
    });
  }

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
  yarn deploy services/demo.func.ts -e production
  yarn deploy services/ -e testing`);
    })
    .action(action);
}
