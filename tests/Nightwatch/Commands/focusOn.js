/**
 * Triggers focus by js.
 *
 * @param {string} cssSelector
 *   The selector of the input field.
 * @param {function} callback
 *   A callback which will be called, when the creating the use is finished.
 *
 * @return {object}
 *   The 'browser' instance.
 */
exports.command = function setDateValue(cssSelector, callback) {
  const _self = this;
  this
    .execute(function () {
      try {
        // Chrome throws error on this...
        document.querySelector(arguments[0]).focus(false);
      }
      catch (e) {
        document.querySelector(arguments[0]).focus();
      }
    },
    [cssSelector]
    );
  if (typeof callback === 'function') {
    callback.call(_self);
  }

  return this;

};
