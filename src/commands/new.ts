import { Command } from 'commander';
import { defaultsEnv } from '../helper';
import { prompt } from 'enquirer';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const Region = ['ap-beijing', 'ap-shanghai', 'ap-guangzhou', 'ap-hongkong'];

const Validator = {
  name (input: string) {
    const match = /^[a-z0-9-_]+$/i.test(input) ? true : 'Must be a-z, 0-9 or -_';
    if (match !== true) return match;
    if (existsSync(input)) {
      return `${input} folder exists, please try another name`;
    }
    return true;
  },
  region (input: string) {
    return Region.indexOf(input) >= 0 ? true : 'Unknown region';
  },
  appId (input: string) {
    return /^[0-9]+$/.test(input) ? true : 'Wrong format';
  },
  secretId (input: string) {
    return /^[a-zA-Z0-9]+$/.test(input) ? true : 'Wrong format';
  },
  secretKey (input: string) {
    return /^[a-zA-Z0-9]+$/.test(input) ? true : 'Wrong format';
  }
};

export async function action (options?: {
  name?: string;
  region?: string;
  appId?: string;
  secretId?: string;
  secretKey?: string;
  example?: boolean;
}) {
  defaultsEnv();

  const questions: any[] = [];

  if (!options || !options.name || Validator.name(options.name) !== true) {
    questions.push({
      type: 'input',
      name: 'name',
      message: 'Project name',
      validate: Validator.name
    });
  }

  if (!options || !options.region || Validator.region(options.region) !== true) {
    questions.push({
      type: 'select',
      name: 'region',
      message: 'Region',
      choices: Region.concat([]), // choices 会修改 Region 对象，因此克隆一份
      validate: Validator.region
    });
  }

  if (!options || !options.appId || Validator.appId(options.appId) !== true) {
    questions.push({
      type: 'input',
      name: 'appId',
      message: 'appId (from https://console.cloud.tencent.com/developer)',
      validate: Validator.appId
    });
  }

  if (!options || !options.secretId || Validator.secretId(options.secretId) !== true) {
    questions.push({
      type: 'input',
      name: 'secretId (from https://console.cloud.tencent.com/cam/capi)',
      message: 'secretId',
      validate: Validator.secretId
    });
  }

  if (!options || !options.secretKey || Validator.secretKey(options.secretKey) !== true) {
    questions.push({
      type: 'input',
      name: 'secretKey',
      message: 'secretKey (from https://console.cloud.tencent.com/cam/capi)',
      validate: Validator.secretKey
    });
  }

  if (!options || options.example !== false) {
    questions.push({
      type: 'confirm',
      name: 'example',
      message: 'Add example files',
      initial: true
    });
  }

  prompt(questions).then(function (answers: {
    name: string;
    region: string;
    appId: string;
    secretId: string;
    secretKey: string;
    example: boolean;
  }) {
    answers = Object.assign(options, answers);

    mkdirSync(answers.name);
    writeFileSync(join(answers.name, 'faas.yaml'),
      `defaults:
  providers:
    tencentcloud:
      type: '@faasjs/tencentcloud'
      config:
        appId: ${answers.appId}
        secretId: ${answers.secretId}
        secretKey: ${answers.secretKey}
        region: ${answers.region}
  plugins:
    cloud_function:
      provider: tencentcloud
      type: cloud_function
    http:
      provider: tencentcloud
      type: http
development:
testing:
production:`);

    writeFileSync(join(answers.name, 'package.json'),
      `{
  "name": "${answers.name}",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "lint": "eslint --ext .ts ."
  },
  "dependencies": {
    "faasjs": "beta",
    "@faasjs/eslint-config-recommended": "beta"
  },
  "babel": {
    "presets": [
      [
        "@babel/preset-env",
        {
          "targets": {
            "node": 8
          }
        }
      ],
      "@babel/preset-typescript"
    ]
  },
  "eslintConfig": {
    "extends": [
      "@faasjs/recommended"
    ]
  },
  "eslintIgnore": [
    "tmp"
  ],
  "jest": {
    "collectCoverageFrom": [
      "**/*.ts"
    ],
    "testRegex": "/*\\\\.test\\\\.ts$",
    "modulePathIgnorePatterns": [
      "/tmp/"
    ]
  }
}`);

    writeFileSync(join(answers.name, 'tsconfig.json'), '{}');

    execSync(`yarn --cwd ${answers.name} install`, { stdio: 'inherit' });

    if (answers.example) {
      writeFileSync(join(answers.name, 'hello.func.ts'),
        `import { Func } from '@faasjs/func';
import { Http } from '@faasjs/http';

export default new Func({
  plugins: [new Http()],
  handler () {
    return 'Hello, world';
  }
});`);

      mkdirSync(join(answers.name, '__tests__'));
      writeFileSync(join(answers.name, '__tests__', 'hello.test.ts'),
        `import { FuncWarpper } from '@faasjs/test';

describe('hello', function () {
  test('should work', async function () {
    const func = new FuncWarpper(require.resolve('../hello.func'));

    const res = await func.handler({});

    expect(res.body).toEqual('{"data":"Hello, world"}');
  });
});`);

      execSync(`yarn --cwd ${answers.name} jest`, { stdio: 'inherit' });
    }
  });
}

export default function (program: Command) {
  program
    .command('new')
    .name('new')
    .description('创建新项目')
    .on('--help', function () {
      console.log(`
Examples:
  yarn new`);
    })
    .option('--name <name>', '项目名字')
    .option('--region <region>', '可用区')
    .option('--appId <appid>', 'appId')
    .option('--secretId <secretId>', 'secretId')
    .option('--secretKey <secretKey>', 'secretKey')
    .option('--example', '创建示例文件')
    .action(action);
}
