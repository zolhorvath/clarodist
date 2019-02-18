<?php

/**
 * @file
 * Contains code for Clarodist profile.
 */

use Drupal\Core\Url;

/**
 * Implements hook_toolbar().
 */
function clarodist_toolbar() {
  $items['clarodist_home'] = [
    '#type' => 'toolbar_item',
    'tab' => [
      '#type' => 'link',
      '#title' => t('Style Guide'),
      '#url' => Url::fromRoute('<front>'),
    ],
    '#weight' => 101,
  ];

  return $items;
}

/**
 * Implements hook_preprocess_HOOK() for menu__main.
 */
function clarodist_preprocess_menu__main(&$variables) {
  // Makes main menu items inline.
  $variables['attributes']['class'][] = 'inline';
}

/**
 * Implements hook_preprocess_HOOK() for links__language_block.
 */
function clarodist_preprocess_links__language_block(&$variables) {
  // Adds some top margins.
  $variables['attributes']['class'][] = 'leader';
}
