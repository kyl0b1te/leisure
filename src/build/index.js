const { resolve } = require('path');

const { getFlagValue, stdout } = require('../cli');

const Builder = require('./builder');
const Sitemap = require('./sitemap');

const getWebsiteDomain = (flags) => {
  const website = getFlagValue(flags, '-w');
  if (!website) {
    throw new Error('Website domain is missing. It should be passed with a `-w` flag.');
  }

  const withProtocol = /^http(s?):\/\/\w/.test(website);
  return withProtocol ? website : `https://${website}`;
};

module.exports = async (content, flags) => {
  const website = getWebsiteDomain(flags);

  if (!content.length) {
    throw new Error('Content path cannot be resolved.');
  }

  const buildPath = getFlagValue(flags, '-o', resolve(content, 'build'));

  const pagesPath = await Builder.getPagesPath(resolve(content));
  await Builder.cleanUp(buildPath);

  const files = await Builder.getPageFiles(pagesPath);
  stdout('Found %o pages', files.length, { colors: true });

  const routes = await Builder.buildPages(files, buildPath);

  await Sitemap(website, routes, buildPath);
  stdout('Sitemap generated');
  stdout('\nContent has been generated!\nWebsite static files are placed into %o', buildPath, { colors: true });
};
