const copy = require('../../src/build/static');

const fs = require('fs/promises');
jest.mock('fs/promises');

const NO_SUB_FOLDERS = [
  { name: 'foo.txt', isDirectory: () => false },
  { name: 'baz.txt', isDirectory: () => false }
];

const WITH_SUB_FOLDER = [
  { name: 'test.txt', isDirectory: () => false },
  { name: 'sub', isDirectory: () => true }
];

describe('build / static', () => {
  fs.readdir.mockResolvedValue(NO_SUB_FOLDERS);

  afterEach(fs.readdir.mockClear);
  afterEach(fs.mkdir.mockClear);
  afterEach(fs.copyFile.mockClear);

  it('should call fs module copy file function for all files', async () => {
    await copy(['/src'], '/des');
    expect(fs.copyFile).toHaveBeenCalledTimes(2);
    expect(fs.copyFile).toHaveBeenCalledWith('/src/foo.txt', '/des/src/foo.txt');
    expect(fs.copyFile).toHaveBeenCalledWith('/src/baz.txt', '/des/src/baz.txt');
  });

  it('should scan folder with correct parameters', async () => {
    await copy(['/src'], '/des');
    expect(fs.readdir).toHaveBeenCalledTimes(1);
    expect(fs.readdir).toHaveBeenCalledWith('/src', { encoding: 'utf8', withFileTypes: true });
  });

  it('should proceed all source folders', async () => {
    await copy(['/src1', '/src2'], '/des');
    expect(fs.copyFile).toHaveBeenCalledTimes(4);
    expect(fs.copyFile).toHaveBeenCalledWith('/src1/foo.txt', '/des/src1/foo.txt');
    expect(fs.copyFile).toHaveBeenCalledWith('/src1/baz.txt', '/des/src1/baz.txt');
    expect(fs.copyFile).toHaveBeenCalledWith('/src2/foo.txt', '/des/src2/foo.txt');
    expect(fs.copyFile).toHaveBeenCalledWith('/src2/baz.txt', '/des/src2/baz.txt');
  });

  it('should create a subfolder in destination', async () => {
    fs.readdir.mockResolvedValueOnce(WITH_SUB_FOLDER);
    await copy(['/src'], '/des');
    expect(fs.mkdir).toHaveBeenCalledTimes(2);
    expect(fs.mkdir).toHaveBeenCalledWith('/des/src', { recursive: true });
    expect(fs.mkdir).toHaveBeenCalledWith('/des/src/sub', { recursive: true });
  });

  it('should correctly copy files from subfolder', async () => {
    fs.readdir.mockResolvedValueOnce(WITH_SUB_FOLDER);
    await copy(['/src'], '/des');
    expect(fs.copyFile).toHaveBeenCalledTimes(3);
    expect(fs.copyFile).toHaveBeenCalledWith('/src/test.txt', '/des/src/test.txt');
    expect(fs.copyFile).toHaveBeenCalledWith('/src/sub/foo.txt', '/des/src/sub/foo.txt');
    expect(fs.copyFile).toHaveBeenCalledWith('/src/sub/baz.txt', '/des/src/sub/baz.txt');
  });
});
