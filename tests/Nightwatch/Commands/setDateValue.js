/**
 * Sets date value by js.
 *
 * Properly works around browser differences.
 *
 * @param {string} cssSelector
 *   The selector of the input field.
 * @param {string} value
 *   Date as ISO-8601 string: yyyy-mm-dd.
 * @param {function} callback
 *   A callback which will be called, when the creating the use is finished.
 *
 * @return {object}
 *   The 'browser' instance.
 */
exports.command = function setDateValue(cssSelector, value = '', callback) {
  const _self = this;
  const platformName = (_self.capabilities.platformName || _self.capabilities.platform || 'nan').toLowerCase();
  const browserName = (_self.capabilities.browserName || 'nan').toLowerCase();
  // Year: dateparts[0], month: dateparts[1], day: dateparts[2];
  const dateparts = value.split('-');
  const fillPattern = {
    'chrome::mac': dateparts[0] + this.Keys.TAB + dateparts[1] + dateparts[2],
    'chrome': dateparts[1] + dateparts[2] + dateparts[0]
  };

  this
    .execute(function () {
        document.querySelector(arguments[0]).value = arguments[1];
      },
      [cssSelector, value]
    )
    .setValue(cssSelector, (fillPattern[`${browserName}::${platformName}`] || fillPattern[browserName] || value));

  if (typeof callback === 'function') {
    callback.call(_self);
  }

  return this;

};
