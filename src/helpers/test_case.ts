import deepMerge from '@faasjs/deep_merge';
import Logger from '@faasjs/logger';
import * as YAML from 'js-yaml';
import { existsSync, readFileSync } from 'fs';
import Flow from '@faasjs/flow';

const loadConfig = function (root: string, file: string, staging: string) {
  const configs: any[] = [];

  const paths = file.replace(root, '').replace(/\/[^/]+$/, '').split('/');

  const roots = root.split('/');
  roots.pop();
  paths.unshift(roots.pop() as string);
  paths.unshift(roots.join('/'));

  paths.reduce(function (base, path) {
    const root = base + '/' + path;
    const defaults = root + '/config/providers/defaults.yaml';

    if (existsSync(defaults)) {
      configs.push(YAML.safeLoad(readFileSync(defaults).toString()));
    }

    const env = root + '/config/providers/' + staging + '.yaml';
    if (existsSync(env)) {
      configs.push(YAML.safeLoad(readFileSync(env).toString()));
    }

    return root;
  });

  return deepMerge.apply(null, configs);
};

const loadResource = function (targets: any, providers: any) {
  for (const type in targets) {
    if (targets.hasOwnProperty(type)) {
      // 增加触发器
      const target = targets[type as string];
      const targetResourceName = (target.resource ? target.resource.name : null) || providers.resources.defaults[type as string];
      if (!providers.resources[targetResourceName as string]) {
        throw Error('Resource not found: ' + targetResourceName);
      }
      const targetResource = deepMerge(
        providers.resources[targetResourceName as string],
        { name: targetResourceName },
        target.resource,
      );

      if (typeof targetResource!.provider === 'string') {
        targetResource!.provider = providers[targetResource!.provider];
      }

      target.resource = targetResource;
    }
  }
};

export default class TestCase {
  public file: string;
  public stagging: string;
  public logger: Logger;
  public providers: any;
  public flow: Flow;

  constructor (file: string) {
    this.file = file;
    this.stagging = process.env.FaasEnv || 'testing';
    this.logger = new Logger('TestCase');

    this.logger.info('Flow: [%s] %s', this.stagging, this.file);
    this.providers = loadConfig(process.cwd() + '/', this.file, this.stagging);
    // eslint-disable-next-line security/detect-non-literal-require
    this.flow = require(this.file).default;

    // 处理云函数的资源配置
    let resourceName = this.flow.config.resource!.name || this.providers.resources.defaults.function;

    if (!resourceName || !this.providers.resources[resourceName as string]) {
      throw Error('Not found resource: ' + resourceName);
    }

    this.flow.config.resource = deepMerge(this.providers.resources[resourceName as string], this.flow!.config.resource);

    if (typeof this.flow.config.resource!.provider === 'string') {
      this.flow.config.resource!.provider = this.providers.providers[this.flow.config.resource!.provider];
    }

    // 解析配置项中的云资源
    loadResource(this.flow.config.triggers, this.providers);
    loadResource(this.flow.config.resources, this.providers);
  }

  public createTrigger (key?: string | number) {
    return this.flow.createTrigger(key);
  }
}
