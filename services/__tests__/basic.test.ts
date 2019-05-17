import TestCase from '../../src/helpers/test_case';

const trigger = new TestCase(require.resolve('../basic.flow')).createTrigger();

test('basic', async function () {
  const res = await trigger({}, {});

  expect(res).toEqual(true);
});
