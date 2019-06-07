/**
 * @file
 * Copies regulat screenshots to the matching location.
 */

const path = require("path");
const fs = require("fs");

const screenshotsMainPath = path.join(
  process.env.PWD || process.cwd(),
  "reports",
  "screenshots"
);
const shotDirs = fs
  .readdirSync(screenshotsMainPath)
  .filter(
    dirent =>
      fs.lstatSync(path.join(screenshotsMainPath, dirent)).isDirectory() &&
      ["_processed", "_temp_fixed", "_flattened", "_fixed"].indexOf(dirent) < 0
  );
const imageOrganize = () => {
  Array.from(shotDirs).forEach(rootDir => {
    const rootDirAbs = path.join(screenshotsMainPath, rootDir);
    const dirents = fs.readdirSync(rootDirAbs);
    const files = dirents
      .filter(dirent => fs.lstatSync(path.join(rootDirAbs, dirent)).isFile())
      .map(dirent => path.join(rootDirAbs, dirent));

    Array.from(files).forEach(file => {
      const metaPieces = path.basename(file, path.extname(file)).split("--");
      let platform = (metaPieces[2] || "no-platform").toLowerCase();
      platform = platform === "macos" ? "mac" : platform;
      platform = platform === "win8_1" ? "windows" : platform;
      platform = platform === "linux" ? "ubuntu" : platform;
      const browser = (metaPieces[3] || "no-browser").toLowerCase();
      const langcode = `langcode-${metaPieces[4] || "default"}`;
      const pathComps = [
        screenshotsMainPath,
        "_processed",
        rootDir,
        [platform, browser].join("-"),
        langcode
      ];
      const shotPath = pathComps.join(path.sep);

      Array.from(pathComps).forEach((item, pathCompIndex) => {
        const pathToCheck = pathComps
          .slice(0, pathCompIndex + 1)
          .join(path.sep);
        if (!fs.existsSync(pathToCheck)) {
          fs.mkdirSync(pathToCheck);
        }
      });

      const filenameBase = path.basename(file, path.extname(file));
      const fileName = path.join(
        shotPath,
        `${filenameBase}--partial${path.extname(file)}`
      );

      fs.copyFile(file, fileName, error => {
        if (error) {
          throw error;
        }
      });
    });
  });
};

if (require.main === module) {
  imageOrganize();
}
