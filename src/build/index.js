const { resolve } = require('path');

const Builder = require('./builder');
const Sitemap = require('./sitemap');

const getWebsiteDomain = (website) => {
  if (!website) {
    throw new Error('Website domain is missing. It should be passed with a `-w` flag.');
  }

  const withProtocol = /^http(s?):\/\/\w/.test(website);
  return withProtocol ? website : `https://${website}`;
};

module.exports = async (contentPath, websiteURL, options) => {
  const website = getWebsiteDomain(websiteURL);

  if (!contentPath.length) {
    throw new Error('Content path cannot be resolved.');
  }

  const buildPath = options.outputPath || resolve(contentPath, 'build');
  const pagesPath = await Builder.getPagesPath(resolve(contentPath));
  await Builder.cleanUp(buildPath);

  const files = await Builder.getPageFiles(pagesPath);
  options.stdout('Found %o pages', files.length, { colors: true });

  const routes = await Builder.buildPages(files, buildPath, options.stdout);

  await Sitemap(website, routes, buildPath);
  options.stdout('Sitemap generated');
  options.stdout('\nContent has been generated!\nWebsite static files are placed into %o', buildPath, { colors: true });
};
