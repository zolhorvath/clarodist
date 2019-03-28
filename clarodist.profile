<?php

/**
 * @file
 * Contains code for Clarodist profile.
 */

use Drupal\block\Entity\Block;
use Drupal\Core\Url;

/**
 * Implements hook_modules_installed().
 *
 * Adds toolbar visibility condition for main menu blocks provided by this
 * distribution.
 */
function clarodist_modules_installed($modules) {
  if (!in_array('cd_core', $modules)) {
    return;
  }

  if (\Drupal::service('plugin.manager.condition')->hasDefinition('toolbar_access')) {
    $claro_is_available = \Drupal::service('theme_handler')->themeExists('claro');
    $block_ids = ['seven_main_navigation'];

    if ($claro_is_available) {
      $block_ids[] = 'claro_main_navigation';
    }

    // Add the toolbar visibility condition provided by cd_core module.
    foreach ($block_ids as $block_id) {
      $block_config = Block::load($block_id);

      if ($block_config) {
        $block_config->setVisibilityConfig('toolbar_access', [
          'status' => TRUE,
          'negate' => TRUE,
          'context_mapping' => [
            'current_user' => '@user.current_user_context:current_user',
          ],
        ]);
        $block_config->save();
      }
    }
  }
}

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
