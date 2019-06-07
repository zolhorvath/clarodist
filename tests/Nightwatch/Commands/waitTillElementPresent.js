/**
 * Click on an element and wait 1s if it's inside an ajaxified parent.
 *
 * @param {string} cssSelector
 *   The selector of the input.
 * @param {number} timeout
 *   The timeout.
 * @param {function} callback
 *   A callback which will be called, when the creating the use is finished.
 *
 * @return {object}
 *   The 'browser' instance.
 */
exports.command = function waitTillElementPresent(
  cssSelector,
  timeout = 10000
) {
  const checkInterval = 50;
  timeout = timeout
    ? Math.ceil(timeout / checkInterval) * checkInterval
    : checkInterval * 10;
  const steps = timeout / checkInterval;
  let found = false;
  const method = "A"; // "A" works.
  const multiMessage = process.stdout._type === "tty";

  if (multiMessage) {
    process.stdout.write(` 🔍 Waiting for <${cssSelector}> `);
  }

  this.element("css selector", cssSelector, result => {
    found = typeof result.errorStatus === "undefined";

    // Not found.
    if (!found) {
      this.pause(1).perform(() => {
        switch (method) {
          case "A": {
            Array.from(Array(steps).keys()).forEach(() => {
              this.element("css selector", cssSelector, stepResult => {
                found = found || typeof stepResult.errorStatus === "undefined";
                if (!found) {
                  this.perform(() => {
                    if (multiMessage) {
                      process.stdout.write(".");
                    }
                  }).pause(checkInterval);
                }
              });
            }, this);
            break;
          }

          default: {
            // Create loop: calls perform 'steps' times.
            // The while loop ends immediately, that's why I need the second 'pi'
            // index.
            // I still have issues when checkInterval < ~500.
            let whileLoopIndex = 0;
            let pi = 0;

            while (whileLoopIndex < steps && !found) {
              // eslint-disable-next-line no-loop-func
              this.perform(() => {
                if (pi < steps && !found) {
                  this.element(
                    "css selector",
                    cssSelector,
                    fallbackStepResult => {
                      // Break the outer while loop if true.
                      found =
                        found ||
                        typeof fallbackStepResult.errorStatus === "undefined";
                      if (!found) {
                        this.perform(() => {
                          if (multiMessage) {
                            process.stdout.write(".");
                          }
                        }).pause(checkInterval);
                      }
                    }
                  );
                }
                pi += 1;
              });
              whileLoopIndex += 1;
            }
          }
        }
      });
    }
  })
    .perform(() => {
      if (!found) {
        this.pause(1000).element("css selector", cssSelector, result => {
          if (typeof result.errorStatus !== "undefined") {
            if (multiMessage) {
              process.stdout.write(` ✖\n`);
            }
            if (!multiMessage) {
              process.stdout.write(` 🔍 Waiting for <${cssSelector}> ✖\n`);
            }
          }
        });
      }

      if (found && multiMessage) {
        process.stdout.write(` ✔\n`);
      }

      if (found && !multiMessage) {
        process.stdout.write(` 🔍 Waiting for <${cssSelector}> ✔\n`);
      }
    })
    .assert.elementPresent(cssSelector, "Found");

  return this;
};
