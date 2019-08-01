import { action } from '../commands/deploy';

describe('deploy', function () {
  jest.mock(process.cwd() + '/node_modules/cos-nodejs-sdk-v5', () => {
    return class Client {
      sliceUploadFile (params, callback) {
        callback();
      }
    };
  });

  jest.mock(process.cwd() + '/node_modules/@faasjs/request', () => {
    return async function () {
      return {
        body: '{"Response":{}}'
      };
    };
  });

  test('a file', async function () {
    const res = await action('src/__tests__/funcs/basic.func.ts');

    expect(res).toBeTruthy();
  }, 30000);

  test('a folder', async function () {
    const res = await action('src/__tests__/funcs/');

    expect(res).toBeTruthy();
  }, 30000);
});
