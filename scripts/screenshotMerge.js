/**
 * @file
 * Merges screenshot pieces into one image.
 *
 * If '--fixed-only' arg present, it will merge only fixed (iOS Safari) shots
 * located inside the '_temp_fixed' screenshot subdir.
 */

const imageMerger = require('merge-img');
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');
const screenshotsMainPath = path.join((process.env.PWD || process.cwd()), 'reports', 'screenshots');
const fixedOnly = process.argv.slice(2).indexOf('--fixed-only') > -1;
const fixedPath = path.join(screenshotsMainPath, '_temp_fixed');
const fixedShotsDirs = fs.existsSync(fixedPath) && fs.lstatSync(fixedPath).isDirectory() ? fs.readdirSync(fixedPath).filter(dirent => { return fs.lstatSync(path.join(fixedPath, dirent)).isDirectory(); }) : [];
const shotsetDirs = !fixedOnly ? fs.readdirSync(screenshotsMainPath).filter(dirent => { return fs.lstatSync(path.join(screenshotsMainPath, dirent)).isDirectory() && ['_processed', '_temp_fixed', '_flattened', '_fixed'].indexOf(dirent) < 0; }) : fixedShotsDirs;

const imageMerge = () => {
  Array.from(shotsetDirs).forEach((rootDir) => {
    const realSubDir = fixedOnly ? path.join('_temp_fixed', rootDir) : rootDir;
    const rootDirAbs = path.join(screenshotsMainPath, realSubDir);
    const dirents = fs.readdirSync(rootDirAbs);
    const sets = dirents.filter((dirent) => fs.lstatSync(path.join(rootDirAbs, dirent)).isDirectory()).map(dirent => path.join(rootDirAbs, dirent));

    Array.from(sets).forEach((set) => {
      const setDirents = fs.readdirSync(set);
      const setPieces = setDirents.filter(setDirent => !fs.lstatSync(path.join(set, setDirent)).isDirectory()).map(setDirent => path.join(set, setDirent));
      let screenshotSet = [];
      let asyncCounter = [];

      console.log('Processing set ' + path.basename(set));

      const metaPieces = path.basename(set).split('--');
      let platform = (metaPieces[2] || 'no-platform').toLowerCase();
      platform = platform === 'macos' ? 'mac' : platform;
      platform = platform === 'win8_1' ? 'windows' : platform;
      platform = platform === 'linux' ? 'ubuntu' : platform;
      const browser = (metaPieces[3] || 'no-browser').toLowerCase();
      const langcode = 'langcode-' + (metaPieces[4] || 'default');
      const pathComps = [screenshotsMainPath, '_processed', rootDir, [platform, browser].join('-'), langcode];
      const shotPath = pathComps.join(path.sep);

      Array.from(pathComps).forEach((item, pathCompIndex) => {
        const pathToCheck = pathComps.slice(0, (pathCompIndex + 1)).join(path.sep);
        if (!fs.existsSync(pathToCheck)) {
          fs.mkdirSync(pathToCheck);
        }
      });

      Array.from(setPieces).forEach((shotPiecePath, i) => {
        const regexp = /\/([\d]{1,})--([\d]{1,})x([\d]{1,})--([\d]{1,})\.(\d|\w{3,6})$/;
        const match = shotPiecePath.match(regexp);
        const index = parseInt(match[1], 10);
        const width = parseInt(match[2], 10);
        const height = parseInt(match[3], 10);
        let offsetY = parseInt(match[4], 10);

        Jimp.read(shotPiecePath, (error, piece) => {
          if (error) {
            throw error;
          }

          if (piece.bitmap.height !== height) {
            offsetY = offsetY * (piece.bitmap.height / height);
          }

          screenshotSet[index - 1] = {
            src: shotPiecePath,
            offsetY: offsetY ? offsetY * -1 : 0
          };
          asyncCounter.push(index - 1);

          if (setPieces.length === asyncCounter.length) {
            imageMerger(screenshotSet, {direction: true}).then(merged => {
              const fileName = path.join(shotPath, path.basename(set)) + '--merged.png';
              if (piece.bitmap.height !== height) {
                merged.resize(width, Jimp.AUTO).write(fileName);
              }
              else {
                merged.write(fileName);
              }
              console.log(' ✔ Merged ' + path.basename(set));
            });
          }
        });
      });
    });
  });
};

if (require.main === module) {
  imageMerge();
}
