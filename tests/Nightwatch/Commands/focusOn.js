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
  this.execute(
    /* eslint-disable func-names, prefer-rest-params, prefer-arrow-callback */
    function() {
      try {
        // Chrome throws error on this...
        document.querySelector(arguments[0]).focus(false);
      } catch (e) {
        document.querySelector(arguments[0]).focus();
      }
    },
    /* eslint-enable func-names, prefer-rest-params, prefer-arrow-callback */
    [cssSelector]
  );

  if (typeof callback === "function") {
    callback.call(_self);
  }

  return this;
};
