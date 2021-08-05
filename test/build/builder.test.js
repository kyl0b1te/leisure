const { S_IROTH } = require('constants');

const builder = require('../../src/build/builder');

const fs = require('fs/promises');
jest.mock('fs/promises');

const render = require('../../src/build/render');
jest.mock('../../src/build/render');

const READABLE_DIRECTORY = { isDirectory: () => true, mode: S_IROTH };
const NOT_READABLE_DIRECTORY = { isDirectory: () => true, mode: 0 };
const NOT_A_DIRECTORY = { isDirectory: () => false };

const NO_INDEX = [
  { name: 'foo.html', isDirectory: () => false },
];

const NO_SUB_FOLDERS = [
  { name: 'index.html', isDirectory: () => false },
];

const WITH_SUB_FOLDER = [
  { name: 'index.html', isDirectory: () => false },
  { name: 'foo', isDirectory: () => true }
];

const PAGES_TO_BUILD = [
  '/tmp/pages/index.html',
  '/tmp/pages/foo/index.html',
  '/tmp/pages/foo/baz/index.html'
];

describe('build / builder', () => {
  afterEach(fs.stat.mockClear);
  afterEach(fs.readdir.mockClear);
  afterEach(fs.rm.mockClear);
  afterEach(fs.mkdir.mockClear);
  afterEach(fs.writeFile.mockClear);

  afterEach(render.mockClear);

  describe('getPagesPath', () => {
    fs.stat.mockResolvedValue(READABLE_DIRECTORY);

    it('should throw an error for non directory path', async () => {
      fs.stat.mockResolvedValueOnce(NOT_A_DIRECTORY);
      await expect(builder.getPagesPath('/tmp')).rejects.toEqual(
        new Error('Content path `/tmp` should be a folder')
      );
    });

    it('should throw an error if content path is not readable', async () => {
      fs.stat.mockResolvedValueOnce(NOT_READABLE_DIRECTORY);
      await expect(builder.getPagesPath('/tmp')).rejects.toEqual(
        new Error('Content path `/tmp` should be readable')
      );
    });

    it('should throw an error if pages directory is not exists', async () => {
      fs.stat.mockImplementationOnce(() => READABLE_DIRECTORY);
      fs.stat.mockImplementationOnce(() => NOT_A_DIRECTORY);
      await expect(builder.getPagesPath('/tmp')).rejects.toEqual(
        new Error('Content path `/tmp` should have a `pages` sub-folder')
      );
    });

    it('should return an absolute path to the pages directory', async () => {
      await expect(builder.getPagesPath('/tmp')).resolves.toEqual('/tmp/pages');
    });
  });

  describe('getPageFiles', () => {
    fs.readdir.mockResolvedValue(NO_SUB_FOLDERS);

    it('should scan folder with correct parameters', async () => {
      await builder.getPageFiles('/tmp/pages');
      expect(fs.readdir).toHaveBeenCalledTimes(1);
      expect(fs.readdir).toHaveBeenCalledWith('/tmp/pages', { encoding: 'utf8', withFileTypes: true });
    });

    it('should return all root folder pages', async () => {
      const res = await builder.getPageFiles('/tmp/pages');
      expect(Array.isArray(res)).toEqual(true);
      expect(res.length).toEqual(1);
      expect(res).toEqual(['/tmp/pages/index.html']);
    });

    it('should return pages with sub directories', async () => {
      fs.readdir.mockResolvedValueOnce(WITH_SUB_FOLDER);
      const res = await builder.getPageFiles('/tmp/pages');
      expect(Array.isArray(res)).toEqual(true);
      expect(res.length).toEqual(2);
      expect(res).toEqual([
        '/tmp/pages/index.html',
        '/tmp/pages/foo/index.html'
      ]);
    });

    it('should skip all not relevant files', async () => {
      fs.readdir.mockResolvedValueOnce(NO_INDEX);
      const res = await builder.getPageFiles('/tmp/pages');
      expect(Array.isArray(res)).toEqual(true);
      expect(res.length).toEqual(0);
    });
  });

  describe('buildPages', () => {
    render.mockResolvedValue('CONTENT');

    it('should create required sub directories', async () => {
      await builder.buildPages(PAGES_TO_BUILD, '/tmp/out', jest.fn());
      expect(fs.mkdir).toHaveBeenCalledTimes(3);
      expect(fs.mkdir).toHaveBeenCalledWith('/tmp/out', { recursive: true });
      expect(fs.mkdir).toHaveBeenCalledWith('/tmp/out/foo', { recursive: true });
      expect(fs.mkdir).toHaveBeenCalledWith('/tmp/out/foo/baz', { recursive: true });
    });

    it('should write file content', async () => {
      await builder.buildPages(PAGES_TO_BUILD, '/tmp/out', jest.fn());
      expect(fs.writeFile).toHaveBeenCalledTimes(3);
      expect(fs.writeFile).toHaveBeenCalledWith('/tmp/out/index.html', 'CONTENT');
      expect(fs.writeFile).toHaveBeenCalledWith('/tmp/out/foo/index.html', 'CONTENT');
      expect(fs.writeFile).toHaveBeenCalledWith('/tmp/out/foo/baz/index.html', 'CONTENT');
    });

    it('should log progress', async () => {
      const log = jest.fn();
      await builder.buildPages(PAGES_TO_BUILD, '/tmp/out', log);
      expect(log).toHaveBeenCalledTimes(3);
      expect(log).toHaveBeenCalledWith('Compiled %o', '/tmp/out/index.html', { colors: true });
      expect(log).toHaveBeenCalledWith('Compiled %o', '/tmp/out/foo/index.html', { colors: true });
      expect(log).toHaveBeenCalledWith('Compiled %o', '/tmp/out/foo/baz/index.html', { colors: true });
    });
  });

  describe('cleanup', () => {

    it('should remove output directory', async () => {
      await builder.cleanUp('/tmp/output');
      expect(fs.rm).toHaveBeenCalledTimes(1);
      expect(fs.rm).toHaveBeenCalledWith('/tmp/output', { recursive: true, force: true });
    });

    it('should create an output directory', async () => {
      await builder.cleanUp('/tmp/output');
      expect(fs.mkdir).toHaveBeenCalledTimes(1);
      expect(fs.mkdir).toHaveBeenCalledWith('/tmp/output', { recursive: true });
    });
  });
});
