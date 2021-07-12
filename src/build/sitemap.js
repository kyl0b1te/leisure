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

const getLastMod = () => {
  const date = new Date(Date.now());
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(0, 2);
  return `${date.getFullYear()}-${month}-${day}`;
};

const getSitemapLinks = (domain, routes, lastMod) => routes.map((route) => {
  const link = new URL(route, domain);
  return format(SITEMAP_LINK_TEMPLATE, `${link.href}`, lastMod);
});

const build = (domain, routes, output) => {
  const links = getSitemapLinks(domain, routes, getLastMod());
  const sitemap = format(SITEMAP_DOC_TEMPLATE, links.join(''));

  const path = resolve(output, 'sitemap.xml');
  return writeFile(path, sitemap);
};

module.exports = build;
