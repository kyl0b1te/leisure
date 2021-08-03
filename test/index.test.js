let buildWebsiteArguments = null;
jest.mock('../src/build', () => {
  return (...args) => {
    buildWebsiteArguments = args;
  };
});

describe('index', () => {

  afterEach(jest.resetModules);
  afterEach(() => buildWebsiteArguments = null);

  describe('build', () => {

    it('should export build function', () => {
      const res = require('../src');
      expect(res.build).toBeDefined();
      expect(typeof res.build).toEqual('function');
    });
  
    it('should call website build function', () => {
      const res = require('../src');
      res.build();
      expect(buildWebsiteArguments).not.toEqual(null);
    });
  
    it('should pass `content path` parameter correctly', () => {
      require('../src').build('CONTENT-PATH');
      expect(Array.isArray(buildWebsiteArguments)).toEqual(true);
      expect(buildWebsiteArguments[0]).toEqual('CONTENT-PATH');
    });
  
    it('should pass `website url` parameter correctly', () => {
      require('../src').build('CONTENT-PATH', 'WEBSITE-URL');
      expect(Array.isArray(buildWebsiteArguments)).toEqual(true);
      expect(buildWebsiteArguments[1]).toEqual('WEBSITE-URL');
    });
  
    it('should pass dict of execution options', () => {
      require('../src').build('CONTENT-PATH', 'WEBSITE-URL', { foo: 'baz' });
      expect(Array.isArray(buildWebsiteArguments)).toEqual(true);
      expect(buildWebsiteArguments[2].stdout).toBeDefined();
      expect(typeof buildWebsiteArguments[2].stdout).toEqual('function');
      expect(buildWebsiteArguments[2]).toEqual(expect.objectContaining({ foo: 'baz' }));
    });
  
    it('should pass stdout function', () => {
      require('../src').build('CONTENT-PATH', 'WEBSITE-URL');
      expect(Array.isArray(buildWebsiteArguments)).toEqual(true);
      expect(buildWebsiteArguments[2].stdout).toBeDefined();
      expect(typeof buildWebsiteArguments[2].stdout).toEqual('function');
    });
  });
});
