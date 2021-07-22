const { format } = require('util');

const buildWebsite = require('./build');

const stdout = (template, args) => {
  let params = [];
  if (args !== undefined) {
    params = !Array.isArray(args) ? [args] : args;
  }

  const message = format(template, ...params);

  return global.console.log(message);
};

module.exports = {
  build: (contentPath, websiteURL, options = {}) => {
    buildWebsite(contentPath, websiteURL, { ...options, stdout });
  },
};
