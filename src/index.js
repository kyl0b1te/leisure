const { getExecFlags, getExecCommand } = require('./cli');
const commands = require('./cmd');

const exitOnError = (err, flags) => {
  const debug = flags.find(([key]) => key === '-d');

  let message = `ERROR: ${err.message}`;
  if (debug) {
    message += `\n\nTRACE: ${err.stack}`;
  }

  process.stderr.write(`\n\x1b[31m${message}\x1b[0m\n\n`);
  process.exit(1);
};

(async () => {
  let [cmd, arg] = getExecCommand();
  const flg = getExecFlags();

  if (!cmd && flg.length) {
    // use flag as a command
    [cmd, arg] = flg.shift(0);
  }

  if (!commands[cmd]) {
    // invalid command
    cmd = 'help';
  }

  try {
    await commands[cmd](arg, flg);
  } catch (err) {
    exitOnError(err, flg);
  }

  return null;
})();
