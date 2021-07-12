const path = require('path');
const fs = require('fs/promises');

const renderEJS = async (filePath, data) => {
  // eslint-disable-next-line import/no-extraneous-dependencies,global-require
  const ejs = require('ejs');

  return new Promise((resolve, reject) => {
    ejs.renderFile(filePath, { config: data }, (err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
  });
};

const ENGINES = {
  '.ejs': { pkg: 'ejs', render: renderEJS },
};

const getTemplateEngine = (extension) => {
  if (!ENGINES[extension]) {
    throw new Error(`Unsupported template extension '${extension}'`);
  }

  const engine = ENGINES[extension];
  require.resolve(engine.pkg);

  return engine;
};

const getTemplateConfig = async (folderPath) => {
  const configPath = path.resolve(folderPath, '@config.json');
  try {
    const buffer = await fs.readFile(configPath);
    return JSON.parse(buffer.toString());
  } catch {
    return {};
  }
};

module.exports = async (filePath) => {
  const ext = path.extname(filePath);
  const config = await getTemplateConfig(path.dirname(filePath));
  const { render } = getTemplateEngine(ext);

  return render(filePath, config);
};
