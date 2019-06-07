const path = require("path");
const fs = require("fs");

/**
 * Create and save a screenshot.
 *
 * @param {string} namePrefix
 *   Prefix for the file name, optional.
 * @param {string} nameSuffix
 *   Suffix for the file name, optional.
 * @param {string} name
 *   Test name override.
 * @param {bool} override
 *   Whether the destionation can be overridden if exists. True by default.
 *
 * @return {object}
 *   The 'browser' instance.
 */
exports.command = function savefullScreenShot(
  namePrefix = "",
  nameSuffix = "",
  name = "",
  override = typeof this.globals.fullScreenShotOverride !== "undefined"
    ? this.globals.fullScreenShotOverride
    : true
) {
  const _self = this;
  const platformName =
    _self.capabilities.platformName || _self.capabilities.platform || "nan";
  const browserName = _self.capabilities.browserName || "nan";
  const nameComponents = [
    name || _self.currentTest.name,
    platformName,
    browserName
  ];

  if (
    _self.capabilities.mobileEmulationEnabled &&
    _self.options.desiredCapabilities.chromeOptions &&
    _self.options.desiredCapabilities.chromeOptions.mobileEmulation &&
    _self.options.desiredCapabilities.chromeOptions.mobileEmulation.deviceName
  ) {
    nameComponents.push(
      _self.options.desiredCapabilities.chromeOptions.mobileEmulation.deviceName
        .replace(/\s/g, "")
        .replace(/\//g, "")
    );
  }
  if (namePrefix) {
    nameComponents.unshift(namePrefix);
  }
  if (nameSuffix) {
    nameComponents.push(nameSuffix);
  }
  const fileName = nameComponents.join("--").replace(/\s/g, "-");
  let fileNameWithPath = [
    this.options && this.options.screenshotsPath
      ? this.options.screenshotsPath
      : "screenshots",
    this.currentTest.module.split(path.sep).pop(),
    fileName
  ].join(path.sep);

  if (!override && fs.existsSync(`${fileNameWithPath}.png`)) {
    let index = 0;
    while (fs.existsSync(`${fileNameWithPath}_${index}.png`)) {
      index += 1;
    }
    fileNameWithPath += `_${index}`;
  }

  this.saveScreenshot(`${fileNameWithPath}.png`).pause(1);

  return this;
};
