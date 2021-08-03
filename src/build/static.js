const fs = require('fs/promises');
const path = require('path');

const copyFiles = async (src, dest) => {
  const files = await fs.readdir(src, { encoding: 'utf8', withFileTypes: true });

  let subFolder = '';
  if (files.length) {
    subFolder = path.basename(src);
    // Create a sub folder only if it contains some files to copy
    await fs.mkdir(path.resolve(dest, subFolder), { recursive: true });
  }

  return files.map((file) => {
    const srcPath = path.resolve(src, file.name);
    const desPath = path.resolve(dest, subFolder, file.name);
    if (file.isDirectory()) {
      // recursion
      return copyFiles(srcPath, path.resolve(dest, subFolder));
    }

    // Copy static file into the destination folder
    return fs.copyFile(srcPath, desPath);
  });
};

module.exports = (staticContentPath, destinationPath) => {
  const promises = staticContentPath.map((src) => copyFiles(src, destinationPath));

  const wait = (copies) => {
    // Determine leftover copy promises
    const leftover = copies.reduce((acc, batch) => {
      if (!Array.isArray(batch)) {
        return acc;
      }
      return [...acc, ...batch.filter((op) => typeof op === 'object' && op instanceof Promise)];
    }, []);
    // recursion (wait for all leftovers to be done)
    return leftover.length ? Promise.all(leftover).then(wait) : true;
  };

  return Promise.all(promises).then(wait);
};
