jest.mock('../../bin/cmd', () => ({
  failure: jest.fn().mockImplementation(() => {
    throw new Error('FAIL');
  }),
  ...(jest.requireActual('../../bin/cmd'))
}));

describe('bin', () => {
  process.stdout.write = jest.fn();
  process.stderr.write = jest.fn();
  process.exit = jest.fn();

  const originalArgs = [...process.argv];

  afterEach(process.stdout.write.mockClear);
  afterEach(process.stderr.write.mockClear);
  afterEach(jest.resetModules);

  afterAll(process.stdout.write.mockReset);
  afterAll(process.stderr.write.mockReset);
  afterAll(process.exit.mockReset);

  afterAll(() => process.argv = [...originalArgs]);

  setArgv = (...args) => process.argv = ['/usr/local/node', 'leisure', ...args];

  it('should print version information', () => {
    setArgv('version');
    require('../../bin/');
    expect(process.stdout.write).toHaveBeenCalledWith('v0.0.1\n');
  });

  it('should print help details', () => {
    setArgv('help');
    require('../../bin/');
    expect(process.stdout.write).toHaveBeenCalled();

    const call = process.stdout.write.mock.calls[0][0];
    expect(call).toEqual(expect.stringContaining('List of commands:'));
  });

  it('should print help details if no commands has been passed', () => {
    setArgv('');
    require('../../bin/');
    expect(process.stdout.write).toHaveBeenCalled();

    const call = process.stdout.write.mock.calls[0][0];
    expect(call).toEqual(expect.stringContaining('List of commands:'));
  });

  it('should print help details if no commands has been passed', () => {
    setArgv('failure');
    require('../../bin/');
    expect(process.stdout.write).not.toHaveBeenCalled();
    expect(process.stderr.write).toHaveBeenCalled();

    const call = process.stderr.write.mock.calls[0][0];
    expect(call).toEqual(expect.stringContaining('ERROR:'));
  });
});
