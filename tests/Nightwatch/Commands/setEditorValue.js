/**
 * Sets value of a textarea with CKEditor by js.
 *
 * Properly works around browser differences.
 *
 * @param {string} cssSelector
 *   The selector of the textarea element.
 * @param {string} value
 *   String to set.
 * @param {function} callback
 *   Optional callback.
 *
 * @return {object}
 *   The 'browser' instance.
 */
exports.command = function setEditorValue(cssSelector, value = '', callback) {
  const _self = this;

  const editorFrameSelector = cssSelector + ' ~ div .cke_wysiwyg_frame';
  this.assert.elementPresent(cssSelector);

  // Safari is a bit confused when trying to assert element type.
  const weirdBrowsers = ['Safari'];
  if (weirdBrowsers.indexOf(this.capabilities.browserName) < 0) {
    this.expect.element(cssSelector).to.be.a('textarea');
  }

  // Filling the editor.
  this.elements('css selector', editorFrameSelector, (results) => {
    if (!results.value.length) {
      this
        .clearValue(cssSelector)
        .setValue(cssSelector, value)
        .execute(
          function () {
            document.querySelector(arguments[0]).value = arguments[1];
            document.querySelector(arguments[0]).dispatchEvent(new Event('change'));
          },
          [cssSelector, value]
        );
    }
    else {
      this
        .click(editorFrameSelector) // To have focus...
        .perform(() => {
          this.getAttribute(cssSelector, 'id', (result) => {
            let editorId = result.value;
            this.execute(
              function () {
                CKEDITOR.instances[arguments[0]].setData(arguments[1]);
                CKEDITOR.instances[arguments[0]].fire('change');
              },
              [editorId, value]
            );
          });
        });
    }
  });

  if (typeof callback === 'function') {
    callback.call(_self);
  }

  return this;

};
