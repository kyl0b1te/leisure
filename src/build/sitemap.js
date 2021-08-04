const { format } = require('util');
const { resolve } = require('path');
const { writeFile } = require('fs/promises');

const SITEMAP_DOC_TEMPLATE = `
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">%s
</urlset>
`;

const SITEMAP_LINK_TEMPLATE = `
<url>
  <loc>%s</loc>
  <lastmod>%s</lastmod>
</url>`;

/**
 * Construct sitemap route last modification string from the current date
 * @returns {string} formatted last modification date string
 */
const getLastMod = () => {
  const date = new Date(Date.now());
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

/**
 * Get list of routes for store in a sitemap xml file
 * @param {string} domain website domain name (starts with protocol)
 * @param {array} routes list of website routes
 * @param {string} lastMod string routes modification date
 * @returns {array} list of routes prepared for storing in sitemap
 */
const getSitemapLinks = (domain, routes, lastMod) => routes.map((route) => {
  const link = new URL(route, domain);
  return format(SITEMAP_LINK_TEMPLATE, `${link.href}`, lastMod);
});

/**
 * Generate and save sitemap information into the file
 * @param {string} domain website domain name (starts with protocol)
 * @param {array} routes list of website routes
 * @param {string} output sitemap file location path
 * @returns {Promise} result of sitemap information save operation
 */
const build = (domain, routes, output) => {
  const links = getSitemapLinks(domain, routes, getLastMod());
  const sitemap = format(SITEMAP_DOC_TEMPLATE, links.join(''));

  const path = resolve(output, 'sitemap.xml');
  return writeFile(path, sitemap);
};

module.exports = build;
