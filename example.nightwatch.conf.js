/**
 * @file
 * Example nightwatch overrides.
 *
 * To personalize environment settings easily, copy this file to
 * `./nightwatch.conf.js` and modify that instead of directly manipulate
 * the main `nightwatch.json` configuration.
 */

const os = require('os');
const ifaces = os.networkInterfaces();
let ips = [];

Object.keys(ifaces).forEach(function (ifname) {
  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // Skip internal (i.e. 127.0.0.1) and non-ipv4 addresses.
      return;
    }
    ips.push(iface.address);
  });
});

module.exports = ((settings) => {
  // Don't override full screen capture files.
  // If this is not defined or is not false then the generated pngs get
  // overridden on each test run.
  settings.test_settings.default.globals.fullScreenShotOverride = true;
  // Don't produce pieces.
  settings.test_settings.default.globals.fullScreenShotPieces = false;

  // const customIp = '127.0.0.1';
  // const customIp = '192.168.0.102';
  const customIp = '172.16.0.189';
  const ip = ips[0] || customIp;

  console.info('Current host IP:', ip);

  settings.test_settings.default.selenium_host = ip;
  // Customize test site url.
  settings.test_settings.default.launch_url = `http://${ip}/clarodist/incubator/public_html`;

  // // Custom arguments for Chrome.
  // settings.test_settings.default.desiredCapabilities['goog:chromeOptions'].args = [
  //   'disable-gpu',
  //   'disable-web-security',
  //   'ignore-certificate-errors'
  // ];
  //
  // // Real profile for Firefox.
  // settings.test_settings.firefox.desiredCapabilities['moz:firefoxOptions'].args = [];
  // // Real profile for Firefox.
  // settings.test_settings.firefox.desiredCapabilities['moz:firefoxOptions'].args.push('-profile', '/path/to/profile');

  return settings;
})(require('./nightwatch.json'));
