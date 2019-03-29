# Claro Distribution

Drupal 8 distribution for Claro theme development


## Getting dependecies

### Clarodist core

Includes Test node (`cd_node`), Text fixtures (`textfixtures`), Hebrew language
(`lang_hebrew`) and Dev help (`devhelp`) submodules.

* `composer config repositories.'zolhorvath/cd_core' github
https://github.com/zolhorvath/cd_core.git`
* `composer require zolhorvath/cd_core`


### Clarodist tools

Contains dashboard and markup generator modules with nightwatch.js tests.

* `composer config repositories.'zolhorvath/cd_tools' github
https://github.com/zolhorvath/cd_tools.git`
* `composer require zolhorvath/cd_tools`


## Getting Clarodist

* `composer config repositories.'zolhorvath/clarodist' github
https://github.com/zolhorvath/clarodist.git`
* `composer require zolhorvath/clarodist`
* `drush si clarodist`


## Automatic webpage captures

* Installed Drupal instance with this profile.
* `java -jar selenium-server-standalone-[VERSION].jar -port 4444`
  Selenium on port 4444.
* Change dir to the root of this profile.
* Copy `example.nightwatch.conf.js` as `nightwatch.conf.js` and override env
  vars, for example `settings.test_settings.default.launch_url`.
* `yarn`
  Get NodeJs dependencies (recommended node v8), and...
* `./node_modules/.bin/nightwatch`
  Create screenshots with the default env, which uses `chrome`, so it should be
  installed (and should be available for Selenium)

  Additional environments:
  * `chrome`
  * `firefox`
  * `safari` [How to enable Safari WebDriver][1]
  * `chromeLinux`
  * `firefoxLinux`
  * `chromeWin`
  * `firefoxWin`
  * `ie11`
  * `edge`
  * `android` (with Chrome browser)
  * `iPhone5`

  `./node_modules/.bin/nightwatch -e chrome,firefox,safari`
  To create screenshots in every defined env (parallelly).

  `./node_modules/.bin/nightwatch tests/Nightwatch/Tests/textInputTest.js`
  To run only a single test.
* Screenshots will be saved to `reports/screenshots/[testName]`.
* Screenshots merge: `yarn ssmfm`


## Further tools

* [Incubator][2] for Drupal 8 extension development
  A simple _Grunt Drupal Tasks_-based scaffolding tool what provides a flexible
  local environment for Drupal contrib extension development

[1]:
http://developer.apple.com/documentation/webkit/testing_with_webdriver_in_safari
[2]: https://gitlab.com/z.a.horvath/incubator
