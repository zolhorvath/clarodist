const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');
const screenshotsMainPath = path.join((process.env.PWD || process.cwd()), 'reports', 'screenshots');
const shotsetDirs = fs.readdirSync(screenshotsMainPath).filter(dirent => fs.lstatSync(path.join(screenshotsMainPath, dirent)).isDirectory() && dirent !== 'merged');
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
      let screenshotSet = [];
      let asyncCounter = [];

      const metaPieces = path.basename(set).split('--');
      let platform = (metaPieces[2] || 'no-platform').toLowerCase();
      platform = platform === 'macos' ? 'mac' : (platform === 'win8_1' ? 'windows' : (platform === 'linux' ? 'ubuntu' : platform));
      const browser = (metaPieces[3] || 'no-browser').toLowerCase();
      const langcode = 'langcode-' + (metaPieces[4] || 'default');
      const pathComps = [screenshotsMainPath, 'fixed', path.basename(set)];
      const shotPath = pathComps.join(path.sep);

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
          const pieceName = path.basename(shotPiecePath);

          Jimp.read(shotPiecePath, (err, piece) => {
            if (err) throw err;

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




      //
      // Array.from(setPieces).forEach((shotPiecePath, i) => {
      //   const regexp = /\/([\d]{1,})--([\d]{1,})x([\d]{1,})--([\d]{1,})\.(\d|\w{3,6})$/;
      //   const match = shotPiecePath.match(regexp);
      //
      //   const index = parseInt(match[1], 10);
      //   const width = parseInt(match[2], 10);
      //   const height = parseInt(match[3], 10);
      //   let offsetY = parseInt(match[4], 10);
      //
      //   Jimp.read(shotPiecePath, (err, piece) => {
      //     if (err) throw err;
      //
      //     if (piece.bitmap.height !== height) {
      //       offsetY = offsetY * (piece.bitmap.height / height);
      //     }
      //
      //     screenshotSet[index - 1] = {
      //       src: shotPiecePath,
      //       offsetY: offsetY ? offsetY * -1 : 0
      //     };
      //     asyncCounter.push(index - 1);
      //
      //     if (setPieces.length === asyncCounter.length) {
      //       imageMerger(screenshotSet, { direction: true }).then(merged => {
      //         const fileName = path.join(shotPath, path.basename(set)) + '--merged.png';
      //         if (piece.bitmap.height !== height) {
      //           merged.resize(width, Jimp.AUTO).write(fileName);
      //         }
      //         else {
      //           merged.write(fileName);
      //         }
      //         console.log(' ✔ Merged ' + path.basename(set));
      //       });
      //     }
      //   });
      // });






    })
  });
}

if (require.main === module) {
  shotSetFix();
}
