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

  test('should work', async function () {
    const res = await action('services/basic.flow.ts');

    expect(res).toBeTruthy();
  }, 30000);
});
