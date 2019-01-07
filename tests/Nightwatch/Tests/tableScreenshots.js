/**
 * @file
 * Captures tables.
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
  'Content form'(browser) {
    ['', 'he'].forEach((langprefix) => {
      browser
        .resizeWindow(1024, 600)
        .smartURL((langprefix ? '/' + langprefix : '') + '/table')
        .waitTillElementPresent('table.test-table')
        .savefullScreenShot('01', langprefix);
    });
  },
  'Field UI form'(browser) {
    ['', 'he'].forEach((langprefix) => {
      browser
        .resizeWindow(1024, 600)
        .smartURL((langprefix ? '/' + langprefix : '') + '/admin/structure/types/manage/test_type/display')
        .waitTillElementPresent('table.field-ui-overview')
        .savefullScreenShot('02', langprefix);
    });
  }
};
