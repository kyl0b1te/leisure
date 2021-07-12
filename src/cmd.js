const pkg = require('../package.json');

const build = require('./build');

const version = () => {
  process.stdout.write(`v${pkg.version}\n`);
};

const help = () => {
  process.stdout.write('\nList of commands:\n* -v, version\n* -h, help\n* build\n\n');
};

module.exports = {
  '-v': version,
  version,
  '-h': help,
  help,
  build,
};
