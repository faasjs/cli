import TestCase from '../../src/helpers/test_case';

const trigger = new TestCase(require.resolve('../http.flow')).createTrigger('http');

test('http', async function () {
  const res = await trigger({}, {});

  expect(res.body).toEqual('{"data":true}');
});
