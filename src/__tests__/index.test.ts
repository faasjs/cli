import program from '../index';

test('verbose', function () {
  program.parse(['node', 'faas', '--verbose', '1']);

  expect(process.env.verbose).toEqual('1');

  delete (process.env.verbose);

  expect(process.env.verbose).toBeUndefined();
});

describe('root', function () {
  test('without root', function () {
    program.parse(['node', 'faas']);

    expect(process.env.faasRoot).toBeUndefined();
  });

  test('with root', function () {
    const root = process.cwd() + '/services';
    program.parse(['node', 'faas', '-r', root]);

    expect(process.env.faasRoot).toEqual(root);
  });

  test('with wrong root', function () {
    try {
      program.parse(['node', 'faas', '-r', '/abc']);
    } catch (error) {
      expect(error.message).toEqual('can\'t find root path: /abc');
    }
  });
});
