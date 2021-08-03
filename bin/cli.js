const { format, formatWithOptions } = require('util');

/**
 * Detects execution flags
 * @returns {array} list of execution flags
 */
const getExecFlags = () => {
  const { argv } = process;
  const args = argv.slice(2);

  const flags = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i][0] === '-') {
      const flag = args[i];

      let arg = null;
      if (args[i + 1] && args[i + 1][0] !== '-') {
        arg = args[i + 1];
        i += 1;
      }

      flags.push([flag, arg]);
    }
  }

  return flags;
};

/**
 * Detects execution command
 * @returns {array} command as a first element and arguments as a second
 */
const getExecCommand = () => {
  if (process.argv.length <= 2) {
    return [null, []];
  }

  const cmd = process.argv[2];
  if (cmd.includes('-')) {
    return [null, []];
  }

  const args = [];
  for (let i = 3; i < process.argv.length; i += 1) {
    if (process.argv[i].includes('-')) {
      break;
    }
    args.push(process.argv[i]);
  }

  return [cmd, args.length === 1 ? args[0] : args];
};

/**
 * Retrieve execution flag value or return default value
 * @param {array} flags list of execution flags
 * @param {string} key searching flag name (ex. `-o`)
 * @param {*} defaultValue return this value if the flag is missing
 * @returns {*} execution flag value or passed default value
 */
const getFlagValue = (flags, key, defaultValue = null) => {
  const values = flags.reduce((acc, [flag, value]) => {
    if (flag === key) {
      acc.push(value);
    }
    return acc;
  }, []);

  if (values.length === 1) {
    return values[0];
  }

  return values.length ? values : defaultValue;
};

/**
 * Print message in a stdout
 * @param {string} template console message template (https://nodejs.org/api/util.html#util_util_format_format_args)
 * @param {array|*} args variables to replace in a template
 * @param {*} options list of formatting options (https://nodejs.org/api/util.html#util_util_inspect_object_showhidden_depth_colors)
 * @returns {boolean}
 */
const stdout = (template, args, options = null) => {
  let params = [];
  if (args !== undefined) {
    params = !Array.isArray(args) ? [args] : args;
  }

  const message = options
    ? formatWithOptions(options, template, ...params)
    : format(template, ...params);

  return process.stdout.write(`${message}\n`);
};

module.exports = {
  getExecFlags,
  getExecCommand,
  getFlagValue,
  stdout,
};
