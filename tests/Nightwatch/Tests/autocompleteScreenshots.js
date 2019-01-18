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
  'Autocomplete'(browser) {
    const path = require('path');

    ['', 'he'].forEach((langprefix) => {
      browser
        .resizeWindow(1024, 600)
        .smartURL((langprefix ? '/' + langprefix : '') + '/autocomplete')
        .setValue('[name="country_autocomplete"]', 'td')
        .waitForElementVisible('.ui-autocomplete:first-of-type', 5000)
        .click('.ui-autocomplete:first-of-type .ui-menu-item-wrapper:last-child')
        .setValue('[name="country_autocomplete"]', ',').pause(400)
        .setValue('[name="country_autocomplete"]', 'do')
        .waitForElementVisible('.ui-autocomplete:first-of-type', 5000)
        .click('.ui-autocomplete:first-of-type .ui-menu-item-wrapper:last-child')
        .setValue('[name="country_autocomplete"]', ',').pause(400)
        .setValue('[name="country_autocomplete"]', ' ').pause(400)
        .setValue('[name="country_autocomplete"]', 'a')
        .savefullScreenShot('01', langprefix)
        .waitForElementVisible('.ui-autocomplete:first-of-type', 5000)
        .savefullScreenShot('02', langprefix)
        .setValue('[name="autocomplete_multipe[0][country]"]', 'gf')
        .waitForElementVisible('.ui-autocomplete:last-of-type', 5000)
        .click('.ui-autocomplete:last-of-type .ui-menu-item-wrapper:last-child')
        .click('[name="claro-autocomplete-country_add_more"]')
        .waitForElementVisible('[name="autocomplete_multipe[1][country]"]', 5000)
        .setValue('[name="autocomplete_multipe[1][country]"]', 'ee')
        .waitForElementVisible('.ui-autocomplete:last-of-type', 5000)
        .click('.ui-autocomplete:last-of-type .ui-menu-item-wrapper:last-child')
        .click('[name="claro-autocomplete-country_add_more"]')
        .waitForElementVisible('[name="autocomplete_multipe[2][country]"]', 5000)
        .savefullScreenShot('03', langprefix);

        // .waitForElementVisible('.ui-autocomplete:first-of-type', 5000)
        // .click('.ui-autocomplete:first-of-type .ui-menu-item-wrapper:last-child')
        // .click('input#edit-submit')
        // .waitTillElementPresent('.messages', 5000)
        // .savefullScreenShot('02', langprefix);
        // .elements('css selector', '.form-item__error-message,.form-item--error-message', (results) => {
        //   browser.savefullScreenShot((results.value.length ? '03' : '02'), langprefix, (results.value.length ? 'Inline errors' : 'Errors'));
        // });
    });
  }
};
