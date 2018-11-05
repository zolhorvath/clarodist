/**
 * @file
 * Captures text input testform with different states.
 *
 * Error state's fileName vary by the state of the inline_form_errors module.
 */
module.exports = {
  '@tags': ['claro'],
  before(browser) {
    if (browser.drupalInstall) {
      browser.drupalInstall({
        installProfile: 'clarodist'
      });
    }
  },
  after(browser) {
    if (browser.drupalUninstall) {
      browser.drupalUninstall().end();
    }
    else {
      browser.end();
    }
  },
  'Navigation'(browser) {
    ['', 'he'].forEach((langprefix) => {
      browser
        .resizeWindow(1024, 600)
        // Navigation with two columns and in expanded mode.
        .smartURL((langprefix ? '/' + langprefix : '') + '/navigation/config')
        // Add a single assert.
        .waitTillElementPresent('.compact-link > a[href*="admin/compact/on?"]')
        .savefullScreenShot('01-config-expanded', langprefix)
        // Switch to compact mode.
        .click('.compact-link a[href*="admin/compact/on?"]')
        .waitTillElementPresent('.compact-link > a[href*="admin/compact?"]')
        .savefullScreenShot('02-config-compact', langprefix)
        .click('.compact-link a[href*="admin/compact?"]')
        // Visit admin tasks in compact mode (no switch link there).
        .smartURL((langprefix ? '/' + langprefix : '') + '/admin')
        .savefullScreenShot('03-tasks-expanded', langprefix)
        .smartURL((langprefix ? '/' + langprefix : '') + '/navigation/config')
        .click('.compact-link a[href*="admin/compact/on?"]')
        .smartURL((langprefix ? '/' + langprefix : '') + '/admin')
        .savefullScreenShot('04-tasks-compact', langprefix)
        .smartURL((langprefix ? '/' + langprefix : '') + '/admin/index')
        .click('.compact-link > a[href*="admin/compact?"]')
        .savefullScreenShot('05-index-expanded', langprefix)
        .click('.compact-link > a[href*="admin/compact/on?"]')
        .savefullScreenShot('06-index-compact', langprefix)
        .click('.compact-link a[href*="admin/compact?"]')
    });
  }
};
