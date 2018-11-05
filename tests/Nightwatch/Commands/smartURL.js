/**
 * Navigates to an url.
 *
 * @param {string} relativeUri
 *   The relative path to navigate to.
 *
 * @return {object}
 *   The 'browser' instance.
 */
exports.command = function smartURL(relativeUri) {

  if (this.drupalRelativeURL) {
    this.drupalRelativeURL(relativeUri);
  }
  else {
    this.url(this.launchUrl + relativeUri);
  }
  // Nightwatch doesn't like it when no actions are added in a command file.
  // https://github.com/nightwatchjs/nightwatch/issues/1792
  this.pause(1);

  return this;

};
