/**
 * Waits for an element and clicks on it (hello, Safari!).
 *
 * Properly works around browser differences.
 *
 * @param {string} cssSelector
 *   The selector of the element.
 * @param {string} eventType
 *   The event to trigger for weird browsers, defaults to 'click'.
 * @param {function} callback
 *   Optional callback.
 *
 * @return {object}
 *   The 'browser' instance.
 */
exports.command = function smartClick(
  cssSelector,
  eventType = "click",
  callback
) {
  const _self = this;
  const weirdBrowsers = ["Safari"];
  const browserIsAnIdiot =
    weirdBrowsers.indexOf(this.capabilities.browserName) > -1;

  switch (browserIsAnIdiot) {
    case false:
      this.waitTillElementPresent(cssSelector).click(cssSelector);
      break;

    default:
      this.waitTillElementPresent(cssSelector)
        .moveToElement(cssSelector, 10, 10)
        .execute(
          /* eslint-disable func-names, prefer-rest-params, prettier/prettier */
          function() {
            document
              .querySelector(arguments[0])
              .dispatchEvent(new Event(arguments[1], { 'bubbles': true }));
          },
          /* eslint-enable func-names, prefer-rest-params, prettier/prettier */
          [cssSelector, eventType]
        );
  }

  if (typeof callback === "function") {
    callback.call(_self);
  }

  return this;
};
