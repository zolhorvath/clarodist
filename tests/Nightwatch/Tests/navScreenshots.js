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
        //
        // Navigation with two columns (expanded mode first).
        //
        .smartURL((langprefix ? '/' + langprefix : '') + '/navigation/config')
        .elements('css selector', '.compact-link > a[href*="admin/compact?"]', (result) => {
          if (result.value.length) {
            browser.click('.compact-link > a[href*="admin/compact?"]');
          }
        })
        .waitTillElementPresent('.compact-link > a[href*="admin/compact/on?"]')
        .savefullScreenShot('01-config-expanded', langprefix)
        // Switch to compact mode.
        .click('.compact-link a[href*="admin/compact/on?"]')
        .waitTillElementPresent('.compact-link > a[href*="admin/compact?"]')
        .savefullScreenShot('02-config-compact', langprefix)
        //
        // Admin tasks (compact first).
        //
        .smartURL((langprefix ? '/' + langprefix : '') + '/admin')
        .waitTillElementPresent('.compact-link > a[href*="admin/compact?"]')
        .savefullScreenShot('04-tasks-compact', langprefix)
        // Expanded.
        .click('.compact-link a[href*="admin/compact?"]')
        .waitTillElementPresent('.compact-link > a[href*="admin/compact/on?"]')
        .savefullScreenShot('03-tasks-expanded', langprefix)
        //
        // Admin index (expanded mode).
        //
        .smartURL((langprefix ? '/' + langprefix : '') + '/admin/index')
        .waitTillElementPresent('.compact-link > a[href*="admin/compact/on?"]')
        .savefullScreenShot('05-index-expanded', langprefix)
        // Compact.
        .click('.compact-link > a[href*="admin/compact/on?"]')
        .waitTillElementPresent('.compact-link > a[href*="admin/compact?"]')
        .savefullScreenShot('06-index-compact', langprefix)
        // Switching off compact mode for further tests.
        .click('.compact-link a[href*="admin/compact?"]')
    });
  }
};
