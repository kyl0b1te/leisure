const { getFlagValue, stdout } = require('./cli');

const pkg = require('../package.json');
const build = require('../src/build');

const commands = {};

const addCommand = (fn, ...names) => {
  if (!names.length) return;

  names.forEach((name) => {
    commands[name] = fn;
  });
};

addCommand(() => {
  process.stdout.write(`v${pkg.version}\n`);
}, 'version', '-v');

addCommand(() => {
  process.stdout.write('\nList of commands:\n* -v, version\n* -h, help\n* build\n\n');
}, 'help', '-h');

addCommand(async (argument, flags) => {
  const website = getFlagValue(flags, '-w', null);
  const outputPath = getFlagValue(flags, '-o', null);

  await build(argument, website, { outputPath, stdout });
}, 'build');

module.exports = commands;
