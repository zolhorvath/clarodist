const path = require('path');
const fs = require('fs');
const imageMerge = require('merge-img');

/**
 * Create and save a full-page 'screen' capture.
 *
 * @param {string} namePrefix
 *   Prefix for the file name, optional.
 * @param {string} nameSuffix
 *   Suffix for the file name, optional.
 * @param {string} name
 *   Test name override.
 * @param {bool} override
 *   Whether the destionation can be overridden if exists. True by default.
 * @param {bool} pieceShots
 *   Create 'normal' screenshots. False by default.
 *
 * @return {object}
 *   The 'browser' instance.
 */
exports.command = function savefullScreenShot(
  namePrefix = '',
  nameSuffix = '',
  name = '',
  override = (typeof this.globals.fullScreenShotOverride !== 'undefined' ?
    this.globals.fullScreenShotOverride : true),
  pieceShots = (typeof this.globals.fullScreenShotPieces !== 'undefined' ?
    this.globals.fullScreenShotPieces : false),
) {

  const _self = this;
  const platformName = _self.capabilities.platformName || _self.capabilities.platform || 'nan';
  const browserName = _self.capabilities.browserName || 'nan';
  let nameComponents = [(name ? name : _self.currentTest.name), platformName, browserName];
  if (
    _self.capabilities.mobileEmulationEnabled &&
    _self.options.desiredCapabilities.chromeOptions &&
    _self.options.desiredCapabilities.chromeOptions.mobileEmulation &&
    _self.options.desiredCapabilities.chromeOptions.mobileEmulation.deviceName) {
    nameComponents.push(_self.options.desiredCapabilities.chromeOptions.mobileEmulation.deviceName.replace(/\s/g, '').replace(/\//g, ''));
  }
  if (namePrefix) {
    nameComponents.unshift(namePrefix);
  }
  if (nameSuffix) {
    nameComponents.push(nameSuffix);
  }
  const fileName = nameComponents.join('--').replace(/\s/g, '-');
  let fileNameWithPath = [(this.options && this.options.screenshotsPath ?
    this.options.screenshotsPath : 'screenshots'), this.currentTest.module.split(path.sep).pop(), fileName].join(path.sep);

  if (!override && fs.existsSync(fileNameWithPath + '.png')) {
    let index = 0;
    while (fs.existsSync(`${fileNameWithPath}_${index}.png`)) {
      index++;
    }
    fileNameWithPath += `_${index}`;
  }

  // Common storage.
  let initialScrollPos = {};
  let windowDimensions = {};
  let documentDimensions = {};
  let viewportDimensions = {};
  let windowHandle;
  const documentElementTag = platformName === 'iOS' ? 'body' : 'html';

  // For first, we get dimensions of the document, viewPort and browser window, and
  // create 'real' screenshots (piece by piece) about the page.
  this
    // Get html element's size.
    .getElementSize(documentElementTag, (htmlSizeResult) => {
      if (!htmlSizeResult.errorStatus) {
        documentDimensions = htmlSizeResult.value;
      }
    })
    // Get window handle (id of the api window).
    .windowHandle((windowHandleResult) => {
      if (!windowHandleResult.errorStatus) {
        windowHandle = windowHandleResult.value;
      }
    })
    // Get browser window size.
    .perform(() => {
      this.windowSize(windowHandle, (windowSizeResult) => {
        if (!windowSizeResult.errorStatus) {
          windowDimensions = windowSizeResult.value;
        }
      })
    })
    // Get dimensions of the viewport.
    .execute(
      function () {
        // Return actual viewPort dimensions.
        return {
          width: Math.max(document.documentElement.clientWidth, (window.innerWidth || 0)),
          height: Math.max(document.documentElement.clientHeight, (window.innerHeight || 0))
        };
      },
      [],
      function (viewportSizeResult) {
        viewportDimensions = viewportSizeResult.value;
      }
    )
    // Get initial scroll position.
    .execute(
      function () {
        // Return actual scroll position difference.
        return {
          x: ((window.pageXOffset || document.documentElement.scrollLeft)  - (document.documentElement.clientLeft || 0)),
          y: ((window.pageYOffset || document.documentElement.scrollTop)  - (document.documentElement.clientTop || 0))
        };
      },
      [],
      function (initialScrollPosResult) {
        initialScrollPos = !initialScrollPosResult.errorStatus ? initialScrollPosResult.value : {};
      }
    )
    // Create 'normal' screenshots.
    // - capturing viewport from top (Y = 0)
    // - scroll to Y += viewport height
    // - continue this until bottom of the page reached.
    .perform(() => {
      if (pieceShots) {
        const steps = Math.ceil(documentDimensions.height / viewportDimensions.height);
        let shotSet = [];
        let offsetY = 0;

        this.perform(() => {
          Array.from(Array(steps).keys()).forEach(function(step) {
            this
              .execute(
                function () {
                  // Scroll.
                  window.scroll(0, arguments[0]);
                  // Return actual scroll position difference.
                  return arguments[0] - ((window.pageYOffset || document.documentElement.scrollTop)  - (document.documentElement.clientTop || 0));
                },
                [(step * viewportDimensions.height)],
                function (diff) {
                  offsetY = !diff.errorStatus ? diff.value : 0;
                }
              )
              .pause(50)
              .perform(() => {
                const src = path.join(fileNameWithPath, `${step + 1}--${viewportDimensions.width}x${viewportDimensions.height}--${offsetY}.png`);
                shotSet.push({
                  src: src,
                  offsetY: offsetY
                });
                this.saveScreenshot(src);
              });
          }, this);
        // We wound merge images here, but Nightwatch cannot handle promises
        // right now.
        // })
        // .perform(() => {
        //   // Merge shot pieces.
        //   console.log(`Attempt to write ${fileNameWithPath}.png`);
        //   imageMerge(shotSet, { direction: true }).then((fullShot) => {
        //     // Save image as file
        //     fullShot.write(fileNameWithPath + '.png', () => {
        //       // Remove stale shot pieces and their directory.
        //       shotSet.forEach((item) => {
        //         fs.unlinkSync(item.src);
        //       });
        //       fs.rmdirSync(fileNameWithPath);
        //       console.log(`Written ${fileNameWithPath}.png`);
        //     });
        //   }).catch((err) => {
        //     console.log(err);
        //   });
        //   this.pause(5000); // Give some time for Jimp to merge and write image.
        })
        .execute(function () {
          // Scroll back to the initial position.
          window.scroll(arguments[0], arguments[1]);
        }, [initialScrollPos.x, initialScrollPos.y]);
      }
    })
    // Try to create a singe full page screenshot by resizing the whole browser
    // window. This does not work for mobile devices like iOS or Android
    // (makes sense by the way).
    .perform(() => {
      if (!pieceShots && windowDimensions.height) {
        // Resize the browser window to make document fit into.
        this.resizeWindow(
          Math.floor(
            documentDimensions.width +
            // Add diff between the viewPort and window width.
            (windowDimensions.width - viewportDimensions.width)
          ),
          Math.floor(
            documentDimensions.height +
            // Add diff between the viewPort and window height.
            (windowDimensions.height - viewportDimensions.height)
          ),
          () => {
            this.saveScreenshot(fileNameWithPath + '.png');
          }).perform(() => {
            // Restore original window dimensions.
            if (windowDimensions.width && windowDimensions.height) {
              this
              .resizeWindow(windowDimensions.width, windowDimensions.height)
              .execute(function () {
                // Scroll to initial.
                window.scroll(arguments[0], arguments[1]);
              }, [initialScrollPos.x, initialScrollPos.y]);
            }
          });
      }
    })
    .pause(1);

  return this;

};
