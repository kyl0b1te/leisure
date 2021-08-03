const util = require('util');
util.formatWithOptions = jest.fn().mockImplementation((_, msg) => msg);

const cli = require('../../bin/cli');

describe('bin / cli', () => {

  describe('getExecFlags', () => {
    const originalArgs = [...process.argv];
    afterAll(() => process.argv = [...originalArgs]);

    setArgv = (...args) => process.argv = ['/usr/local/node', 'leisure', ...args];

    it('should return an empty list', () => {
      setArgv();
      const res = cli.getExecFlags();
      expect(res).toEqual([]);
    });

    it('should return a list of flag tuples', () => {
      setArgv('test', '-foo', 99, '-baz', 98);
      const res = cli.getExecFlags();
      expect(res).toEqual([['-foo', 99], ['-baz', 98]]);
    });
  });

  describe('getExecCommand', () => {
    const originalArgs = [...process.argv];
    afterAll(() => process.argv = [...originalArgs]);

    setArgv = (...args) => process.argv = ['/usr/local/node', 'leisure', ...args];

    it('should return an empty tuple for short arguments list', () => {
      setArgv();
      const res = cli.getExecCommand();
      expect(res).toEqual([null, []]);
    });

    it('should return an empty tuple if command starts with flag', () => {
      setArgv('-h');
      const res = cli.getExecCommand();
      expect(res).toEqual([null, []]);
    });

    it('should return a command with one argument', () => {
      setArgv('test', 'foo');
      const res = cli.getExecCommand();
      expect(res).toEqual(['test', 'foo']);
    });

    it('should return a command with list of arguments', () => {
      setArgv('test', 'foo', 'baz');
      const res = cli.getExecCommand();
      expect(res).toEqual(['test', ['foo', 'baz']]);
    });

    it('should not return a flag values in commaon aguments', () => {
      setArgv('test', 'foo', 'baz', '-f', 'value');
      const res = cli.getExecCommand();
      expect(res).toEqual(['test', ['foo', 'baz']]);
    });
  });

  describe('getFlagValue', () => {
    
    it('should return default value for empty flags', () => {
      const res = cli.getFlagValue([], 'foo', 'DEFAULT');
      expect(res).toEqual('DEFAULT');
    });

    it('should return default value for missing flag key', () => {
      const res = cli.getFlagValue([['baz', 99]], 'foo', 'DEFAULT');
      expect(res).toEqual('DEFAULT');
    });

    it('should return a value for flag key that exists', () => {
      const res = cli.getFlagValue([['foo', 99]], 'foo', 'DEFAULT');
      expect(res).toEqual(99);
    });

    it('should return `null` as a default value', () => {
      const res = cli.getFlagValue([['baz', 99]], 'foo');
      expect(res).toEqual(null);
    });

    it('should return a multiple values for flag duplication', () => {
      const res = cli.getFlagValue([['a', 1], ['b', 2], ['a', 3]], 'a');
      expect(res).toEqual([1, 3]);
    });
  });

  describe('stdout', () => {
    process.stdout.write = jest.fn();

    afterEach(process.stdout.write.mockClear);
    afterEach(util.formatWithOptions.mockClear);

    afterAll(process.stdout.write.mockReset);

    it('should print a plain message with break line', () => {
      cli.stdout('plain text');
      expect(process.stdout.write).toHaveBeenCalledWith('plain text\n');
    });

    it('should print a template with variable in it', () => {
      cli.stdout('template with %d variable value', 99);
      expect(process.stdout.write).toHaveBeenCalledWith('template with 99 variable value\n');
    });

    it('should print a template with multiple variables in it', () => {
      cli.stdout('template with decimal %d and string %s values', [99, 'TEST']);
      expect(process.stdout.write).toHaveBeenCalledWith('template with decimal 99 and string TEST values\n');
    });

    it('should print a style formatted message', () => {
      cli.stdout('plain text', undefined, { colors: true });
      expect(util.formatWithOptions).toHaveBeenCalledWith({ colors: true }, 'plain text');
      expect(process.stdout.write).toHaveBeenCalledWith('plain text\n');
    });
  });
});
