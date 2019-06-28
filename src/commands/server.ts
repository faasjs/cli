import { Command } from 'commander';
import { Server } from '@faasjs/server';
import { defaultsEnv } from '../helper';

export async function action (opts: {
  port: number;
}) {
  defaultsEnv();
  const server = new Server(process.env.FaasRoot!);

  const port = opts.port || 3000;
  server.listen(port);

  return true;
}

export default function (program: Command) {
  program
    .command('server')
    .name('server')
    .description('本地模拟服务器')
    .on('--help', function () {
      console.log(`
Examples:
  yarn server`);
    })
    .option('-p, --port <port>', '端口号', '3000')
    .action(action);
}
