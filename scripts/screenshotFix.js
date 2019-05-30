/**
 * @file
 * Fixes iOS screenshots.
 *
 * The skipTop and skipBottom values are for iPhone5's screen size.
 */

const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');
const screenshotsMainPath = path.join((process.env.PWD || process.cwd()), 'reports', 'screenshots');
const shotsetDirs = fs.readdirSync(screenshotsMainPath).filter(dirent => fs.lstatSync(path.join(screenshotsMainPath, dirent)).isDirectory() && ['_processed', '_temp_fixed', '_flattened', '_fixed'].indexOf(dirent) < 0);
const fixPattern = {
  'ios:safari': {
    skipTop: 55.5,
    skipBottom: 35.5
  }
};

const shotSetFix = () => {
  Array.from(shotsetDirs).forEach((rootDir) => {
    const rootDirAbs = path.join(screenshotsMainPath, rootDir);
    const dirents = fs.readdirSync(rootDirAbs);
    const sets = dirents.filter((dirent) => fs.lstatSync(path.join(rootDirAbs, dirent)).isDirectory()).map(dirent => path.join(rootDirAbs, dirent));

    Array.from(sets).forEach((set) => {
      const setDirents = fs.readdirSync(set);
      const setPieces = setDirents.filter(setDirent => !fs.lstatSync(path.join(set, setDirent)).isDirectory()).map(setDirent => path.join(set, setDirent));
      const metaPieces = path.basename(set).split('--');
      let platform = (metaPieces[2] || 'no-platform').toLowerCase();
      platform = platform === 'macos' ? 'mac' : platform;
      platform = platform === 'win8_1' ? 'windows' : platform;
      platform = platform === 'linux' ? 'ubuntu' : platform;
      const browser = (metaPieces[3] || 'no-browser').toLowerCase();
      const pathComps = [screenshotsMainPath, '_temp_fixed', rootDir, path.basename(set)];

      if (fixPattern[`${platform}:${browser}`]) {
        console.log('Fixing set ' + path.basename(set));

        const skipTop = fixPattern[`${platform}:${browser}`].skipTop || 0;
        const skipBottom = fixPattern[`${platform}:${browser}`].skipBottom || 0;

        Array.from(pathComps).forEach((item, pathCompIndex) => {
          const pathToCheck = pathComps.slice(0, (pathCompIndex + 1)).join(path.sep);
          if (!fs.existsSync(pathToCheck)) {
            fs.mkdirSync(pathToCheck);
          }
        });

        Array.from(setPieces).forEach((shotPiecePath) => {
          const regexp = /\/([\d]{1,})--([\d]{1,})x([\d]{1,})--([\d]{1,})\.(\d|\w{3,6})$/;
          const match = shotPiecePath.match(regexp);
          const height = parseInt(match[3], 10);

          Jimp.read(shotPiecePath, (error, piece) => {
            if (error) {
              throw error;
            }

            const multiplier = (piece.bitmap.height / height);
            const fixedHeight = (height - Math.round(skipTop + skipBottom));
            const pieceFixedName = [match[1], (match[2] + 'x' + fixedHeight), match[4]].join('--') + '.png';

            piece
              .clone()
              .crop(
                0,
                Math.round(multiplier * skipTop),
                piece.bitmap.width,
                Math.round(multiplier * fixedHeight)
              )
              .write(path.join(pathComps.join(path.sep), pieceFixedName));
          });
        });
      }
    });
  });
};

if (require.main === module) {
  shotSetFix();
}
