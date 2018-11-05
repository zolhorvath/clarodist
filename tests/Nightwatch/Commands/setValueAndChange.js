/**
 * Sets value and triggers change event.
 *
 * Properly works around browser differences and emits change event.
 * Contains specific code for handling special inputs:
 * - CKEditor
 * - select
 * - date input.
 * Tries to clear the input before adding the new value.
 *
 * @param {string} cssSelector
 *   The selector of the input.
 * @param {string} value
 *   The new value.
 * @param {function} callback
 *   A callback which will be called, when the creating the use is finished.
 *
 * @return {object}
 *   The 'browser' instance.
 */
exports.command = function setValueAndChange(cssSelector, value = '', callback) {
  const _self = this;

  this.assert.elementPresent(cssSelector);

  this.element('css selector', cssSelector, (result) => {
    const inputId = result.value['ELEMENT'];

    this.elementIdName(inputId, (result) => {
      switch (result.value.toLowerCase()) { // Switch on input tag name.
        case 'textarea':
          this.setEditorValue(cssSelector, value);
          break;

        case 'select':
          this.setSelectValue(cssSelector, value);
          break;

        case 'input':
          // We have some input hacks as well...
          this.elementIdAttribute(inputId, 'type', (type) => {
            switch (type.value) { // Switch on input tag's type attribute.
              case 'date':
                this
                  .setDateValue(cssSelector, value)
                  .pause(1)
                  .execute(
                    function () {
                      // Dispatch the change.
                      document.querySelector(arguments[0]).dispatchEvent(new Event('change'));
                    },
                    [cssSelector]
                  );
                break;

              case 'file':
                this.getAttribute(cssSelector, 'id', (result) => {
                  cssSelector = 'input#' + result.value;
                  this
                    .uploadLocalFile(cssSelector, value)
                    .pause(1)
                    .execute(
                      function () {
                        // Dispatch the change.
                        document.querySelector(arguments[0]).dispatchEvent(new Event('change'));
                      },
                      [cssSelector]
                    );
                });
                break;

              default:
                this
                  .setValue(cssSelector, value)
                  .pause(1)
                  .execute(
                    function () {
                      // Only Safari works without this value assignment
                      // (probably because it's not headless?)...
                      document.querySelector(arguments[0]).value = arguments[1];
                      // Dispatch the change.
                      document.querySelector(arguments[0]).dispatchEvent(new Event('change'));
                    },
                    [cssSelector, value ]
                  );
            }
          });
          break;
      }
    });
  });

  if (typeof callback === 'function') {
    callback.call(_self);
  }

  return this;
};
