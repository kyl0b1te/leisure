const build = require('../../src/build');
jest.mock('../../src/build');

const commands = require('../../bin/cmd');

describe('bin / cmd', () => {
  process.stdout.write = jest.fn();

  afterEach(process.stdout.write.mockClear);
  afterAll(process.stdout.write.mockReset);

  describe('version', () => {
    it('should declare version command', () => {
      expect(commands.version).toBeDefined();
    });

    it('should declare version command shortcut', () => {
      expect(commands['-v']).toBeDefined();
    });

    it('should print package version', () => {
      commands.version();
      expect(process.stdout.write).toHaveBeenCalledWith('v0.0.1\n');
    });
  });

  describe('help', () => {
    it('should declare help command', () => {
      expect(commands.help).toBeDefined();
    });

    it('should declare help command shortcut', () => {
      expect(commands['-h']).toBeDefined();
    });

    it('should print help information', () => {
      commands.help();
      expect(process.stdout.write).toHaveBeenCalled();

      const call = process.stdout.write.mock.calls[0][0];
      expect(call).toEqual(expect.stringContaining('version'));
      expect(call).toEqual(expect.stringContaining('help'));
      expect(call).toEqual(expect.stringContaining('build'));
    });
  });

  describe('build', () => {
    afterEach(build.mockClear);

    it('should declare build command', () => {
      expect(commands.build).toBeDefined();
    });

    it('should call website build logic', () => {
      commands.build('CONTENT-PATH', [['-w', 'www.domain.org'], ['-o', '/tmp']]);
      expect(build).toHaveBeenCalled();

      const callArguments = build.mock.calls[0];
      expect(callArguments).toEqual(expect.arrayContaining(['CONTENT-PATH', 'www.domain.org']));
      expect(callArguments[callArguments.length - 1].outputPath).toEqual('/tmp');
    });
  });
});
