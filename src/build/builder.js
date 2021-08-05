const path = require('path');
const fs = require('fs/promises');
const { S_IROTH } = require('constants');

const render = require('./render');

/**
 * Verify passed content path and return website pages folder path
 * @param {string} content path to the website content folder
 * @returns {string} path to the website pages folder
 */
const getPagesPath = async (content) => {
  const errPrefix = `Content path \`${content}\``;

  const stats = await fs.stat(content);
  if (!stats.isDirectory()) {
    throw new Error(`${errPrefix} should be a folder`);
  }

  // eslint-disable-next-line no-bitwise
  if (!(stats.mode & S_IROTH)) {
    throw new Error(`${errPrefix} should be readable`);
  }

  const pages = path.resolve(content, 'pages');
  try {
    const pagesStats = await fs.stat(pages);

    if (!pagesStats.isDirectory()) {
      throw new Error('pages should be a folder');
    }
  } catch {
    throw new Error(`${errPrefix} should have a \`pages\` sub-folder`);
  }

  return pages;
};

/**
 * Resolves page URL based on a file path
 * @param {string} filePath website page file path
 * @returns {string} page website route
 */
const getRouteFromFilePath = (filePath) => {
  const pieces = filePath.split(`${path.sep}pages`);
  return pieces[1].replace(/index\.(.*)/, '');
};

/**
 * Scan website pages folder and return a list of page files path
 * @param {string} pagesPath website content pages folder path
 * @returns {array} list of website page file path
 */
const getPageFiles = async (pagesPath) => {
  const files = await fs.readdir(pagesPath, { encoding: 'utf8', withFileTypes: true });

  const promises = files.map((file) => {
    if (file.isDirectory()) {
      const subFolderPath = path.resolve(pagesPath, file.name);
      // recursion
      return getPageFiles(subFolderPath);
    }

    if (file.name.includes('index.')) {
      const filePath = path.resolve(pagesPath, file.name);
      return Promise.resolve(filePath);
    }

    return Promise.resolve(null);
  });

  // Unpack subfolder(s)
  const flatten = (items) => items.reduce((acc, item) => {
    if (Array.isArray(item)) {
      // recursion
      return [...acc, ...flatten(item)];
    }
    if (item === null) {
      // Skip non-index files
      return acc;
    }
    return [...acc, item];
  }, []);

  return Promise.all(promises).then((res) => flatten(res));
};

/**
 * Render website pages template into the output folder
 * @param {array} pages list of website page file paths
 * @param {string} outputPath website build folder path
 * @returns {array} list of website page routes
 */
const buildPages = (pages, outputPath, stdout) => {
  const builds = pages.map(async (page) => {
    const html = await render(page);

    const route = getRouteFromFilePath(page);

    const pageFolderPath = path.resolve(outputPath, route.slice(1));
    await fs.mkdir(pageFolderPath, { recursive: true });

    const pageFilePath = path.resolve(pageFolderPath, 'index.html');
    await fs.writeFile(pageFilePath, html);

    stdout('Compiled %o', pageFilePath, { colors: true });

    return route;
  });

  return Promise.all(builds);
};

/**
 * Cleanup output folder
 * @param {string} outputPath website build folder path
 */
const cleanUp = async (outputPath) => {
  await fs.rm(outputPath, { recursive: true, force: true });

  await fs.mkdir(outputPath, { recursive: true });
};

module.exports = {
  getPagesPath,
  getPageFiles,
  buildPages,
  cleanUp,
};
