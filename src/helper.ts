export function defaultsEnv () {
  // 设置默认环境变量
  if (!process.env.FaasRoot) {
    process.env.FaasRoot = process.cwd() + '/';
  }
  if (!process.env.FaasRoot.endsWith('/')) {
    process.env.FaasRoot += '/';
  }
}