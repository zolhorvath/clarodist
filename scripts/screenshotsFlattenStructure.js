/**
 * @file
 * Copies regulat screenshots to the matching location.
 */

const path = require('path');
const fs = require('fs');
const screenshotsProcessedPath = path.join((process.env.PWD || process.cwd()), 'reports', 'screenshots', '_processed');
const flattener = (directory) => {
  const subdirs = fs.readdirSync(directory).filter((dirent) => fs.lstatSync(path.join(directory, dirent)).isDirectory()).map(dirent => path.join(directory, dirent));
  const files = fs.readdirSync(directory).filter((dirent) => fs.lstatSync(path.join(directory, dirent)).isFile()).map(dirent => path.join(directory, dirent));

  return {
    files: files,
    subdirs: subdirs
  };
};

const flattenDirStructure = () => {
  if (!fs.existsSync(screenshotsProcessedPath)) {
    console.log('Nothing to flatten. Run `yarn ssmfm` first!');
    return;
  }
  const basePath = path.parse(screenshotsProcessedPath)['dir'];
  const testDirs = fs.readdirSync(screenshotsProcessedPath).filter((dirent) => fs.lstatSync(path.join(screenshotsProcessedPath, dirent)).isDirectory() && ['_processed', '_temp_fixed', '_flattened', '_fixed'].indexOf(dirent) < 0).map(dirent => path.join(screenshotsProcessedPath, dirent));


  // Loop trough preprocessed screenshot directories.
  Array.from(testDirs).forEach((testDir) => {
    let subdirs = [];
    let files = [];
    const destPathComps = [basePath, '_flattened', path.basename(testDir)];
    const destPath = destPathComps.join(path.sep);
    const data = flattener(testDir);
    subdirs = subdirs.concat(data.subdirs);
    files = files.concat(data.files);

    // Populate files (and unprocessed subdirs).
    // Loop ends if every discovered subdir is checked.
    while (subdirs.length > 0) {
      const current = subdirs.shift();
      // Skip errored cases.
      if (path.basename(current) !== 'no-platform-no-browser') {
        const nestedData = flattener(current);
        subdirs = subdirs.concat(nestedData.subdirs);
        files = files.concat(nestedData.files);
      }
    }

    // Create the potentially missing directory structure.
    Array.from(destPathComps).forEach((item, pathCompIndex) => {
      const pathToCheck = destPathComps.slice(0, (pathCompIndex + 1)).join(path.sep);
      if (!fs.existsSync(pathToCheck)) {
        fs.mkdirSync(pathToCheck);
      }
    });

    // Copy files.
    Array.from(files).forEach(filePathOld => {
      fs.copyFile(
        filePathOld,
        path.join(destPath, path.basename(filePathOld)),
        (error) => {
          if (error) {
            throw error;
          }
        });
    });
  });
};

if (require.main === module) {
  flattenDirStructure();
}
