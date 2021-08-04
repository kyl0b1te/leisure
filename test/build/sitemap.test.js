const sitemap = require('../../src/build/sitemap');

const fs = require('fs/promises');
jest.mock('fs/promises');

const DOMAIN = 'http://www.example.com';
const ROUTES = ['/foo', '/baz'];

describe('src / sitemap', () => {
  // 2021-08-04
  Date.now = jest.fn().mockReturnValue(1628064926774);

  afterEach(fs.writeFile.mockClear);
  afterEach(Date.now.mockClear);

  it('should create a file with correct filename', () => {
    sitemap(DOMAIN, ROUTES, '/tmp');
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    expect(fs.writeFile.mock.calls[0]).toEqual(expect.arrayContaining(['/tmp/sitemap.xml']));
  });

  it('should contain all routes', () => {
    sitemap(DOMAIN, ROUTES, '/tmp');
    const [_, content] = fs.writeFile.mock.calls[0];
    expect(content).toContain(`${DOMAIN}${ROUTES[0]}`);
    expect(content).toContain(`${DOMAIN}${ROUTES[1]}`);
  });

  it('should contain last modification date', () => {
    sitemap(DOMAIN, ROUTES, '/tmp');
    const [_, content] = fs.writeFile.mock.calls[0];
    expect(content).toContain(`2021-08-04`);
  });

  it('should contain sitemap schema protocol url', () => {
    sitemap(DOMAIN, ROUTES, '/tmp');
    const [_, content] = fs.writeFile.mock.calls[0];
    expect(content).toContain(`<?xml version="1.0" encoding="UTF-8"?>`);
    expect(content).toContain(`http://www.sitemaps.org/schemas/sitemap/0.9`);
  });
});
