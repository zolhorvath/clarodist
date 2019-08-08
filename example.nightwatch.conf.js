/**
 * @file
 * Example nightwatch overrides.
 *
 * To personalize environment settings easily, copy this file to
 * `./nightwatch.conf.js` and modify that instead of directly manipulate
 * the main `nightwatch.json` configuration.
 */

const os = require("os");

const ifaces = os.networkInterfaces();
const ips = [];

Object.keys(ifaces).forEach(ifname => {
  ifaces[ifname].forEach(iface => {
    if (iface.family !== "IPv4" || iface.internal !== false) {
      // Skip internal (i.e. 127.0.0.1) and non-ipv4 addresses.
      return;
    }
    ips.push(iface.address);
  });
});

module.exports = (settings => {
  // Whether existing screen capture files should be overridden or not.
  // If this is not defined or is not false then the generated pngs get
  // overridden on each test run.
  settings.test_settings.default.globals.screenShotOverride = true;
  // Whether produce pieces or not (useful for mobile and some non-headless
  // browsers).
  settings.test_settings.default.globals.fullScreenShotInPieces = true;
  // If IE11 creates full page screenshots even if fullScreenShotInPieces is set
  // to true, set this to true, and we will ignore piece generation for
  // IE11 on Windows.
  settings.test_settings.default.globals.ie11IsWeird = true;

  const customIp = "172.16.0.189";
  const ip = ips[0] || customIp;

  settings.test_settings.default.selenium_host = ip;
  settings.test_settings.default.launch_url = `http://${ip}/clarodist/zdev/public_html`;

  // Different iOS version.
  settings.test_settings.iPhone5.desiredCapabilities.platformVersion = "12.1";

  // // Ask headless browsers where possible.
  // Object.keys(settings.test_settings).forEach(browserName => {
  //   if (settings.test_settings[browserName].desiredCapabilities) {
  //     // Chrome – legacy driver.
  //     if (
  //       settings.test_settings[browserName].desiredCapabilities.chromeOptions &&
  //       settings.test_settings[browserName].desiredCapabilities.chromeOptions.args
  //     ) {
  //       settings.test_settings[browserName].desiredCapabilities.chromeOptions.args.push("headless");
  //       settings.test_settings[browserName].desiredCapabilities.chromeOptions.args.push("disable-gpu");
  //     }
  //     // Chrome.
  //     if (
  //       settings.test_settings[browserName].desiredCapabilities['goog:chromeOptions'] &&
  //       settings.test_settings[browserName].desiredCapabilities['goog:chromeOptions'].args
  //     ) {
  //       settings.test_settings[browserName].desiredCapabilities['goog:chromeOptions'].args.push("headless");
  //       settings.test_settings[browserName].desiredCapabilities['goog:chromeOptions'].args.push("disable-gpu");
  //     }
  //
  //     // Firefox.
  //     if (
  //       settings.test_settings[browserName].desiredCapabilities['moz:firefoxOptions'] &&
  //       settings.test_settings[browserName].desiredCapabilities['moz:firefoxOptions'].args
  //     ) {
  //       settings.test_settings[browserName].desiredCapabilities['moz:firefoxOptions'].args.push("-headless");
  //     }
  //   }
  // });

  // // Custom arguments for Chrome.
  // settings.test_settings.default.desiredCapabilities["goog:chromeOptions"].args = [
  //   "disable-gpu",
  //   "disable-web-security",
  //   "ignore-certificate-errors"
  // ];

  // // Real profile for Firefox.
  // settings.test_settings.firefox.desiredCapabilities["moz:firefoxOptions"].args.push("-profile", "/path/to/profile");

  return settings;
})(require("./nightwatch.json"));
