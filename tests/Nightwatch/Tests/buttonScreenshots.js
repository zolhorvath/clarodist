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
  'Buttons'(browser) {
    ['', 'he'].forEach((langprefix) => {
      browser
        .resizeWindow(1024, 600)
        .smartURL((langprefix ? '/' + langprefix : '') + '/buttons')
        .waitForElementVisible('.sbs-layout__region--main', 5000)
        .elements('css selector', '.sbs-layout__region--main .button', (result) => {
          let i = 1;
          result.value.forEach(elem => {
            browser.perform(done => {
              i++;
              browser.elementIdAttribute(elem.ELEMENT, 'id', result => {
                if (result.value) {
                  browser
                    .focusOn('#' + result.value)
                    .pause(100)
                    .saveScreenShot(i.toString().padStart(2, '0'), langprefix);
                }
              });
              done();
            });
          });
        })
        .savefullScreenShot('01', langprefix);
    });
  }
};
