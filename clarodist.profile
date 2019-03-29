<?php

/**
 * @file
 * Contains code for Clarodist profile.
 */

use Drupal\block\Entity\Block;
use Drupal\user\RoleInterface;

/**
 * Implements hook_modules_installed().
 *
 * Adds toolbar visibility condition for main menu blocks provided by this
 * distribution.
 */
function clarodist_modules_installed($modules) {
  if (in_array('cd_core', $modules)) {
    _clarodist_add_toolbar_visibility();
  }

  if (in_array('lang_hebrew', $modules)) {
    _clarodist_add_language_switcher();
  }

  if (in_array('styleguide', $modules)) {
    // Set front page to styleguide.
    \Drupal::service('config.factory')->getEditable('system.site')
      ->set('page.front', '/admin/appearance/styleguide')
      ->save();

    // Add the needed permissions to see the styleguide.
    user_role_grant_permissions(RoleInterface::ANONYMOUS_ID, [
      'view style guides',
    ]);
    user_role_grant_permissions(RoleInterface::AUTHENTICATED_ID, [
      'view style guides',
    ]);
  }
}

/**
 * Implements hook_modules_uninstalled().
 */
function clarodist_modules_uninstalled($modules) {
  if (in_array('styleguide', $modules)) {
    // Set front page to user.
    // Permissions will be revoced automatically.
    \Drupal::service('config.factory')->getEditable('system.site')
      ->set('page.front', '/user')
      ->save();
  }
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

/**
 * Helper function for cd_core.
 *
 * Adds toolbar visibility condition for main menu blocks provided by this
 * distribution.
 */
function _clarodist_add_toolbar_visibility() {
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
 * Helper function for lang_hebrew.
 *
 * Adds language switcher blocks if hebrew language module is installed.
 */
function _clarodist_add_language_switcher() {
  $block_ids = ['seven_language_switcher' => 'seven'];

  if (\Drupal::service('theme_handler')->themeExists('claro')) {
    $block_ids['claro_language_switcher'] = 'claro';
  }

  // Add the toolbar visibility condition provided by cd_core module.
  foreach ($block_ids as $block_id => $theme) {
    if (!empty(Block::load($block_id))) {
      continue;
    }

    $block_values = [
      'langcode' => 'en',
      'status' => 1,
      'id' => $block_id,
      'theme' => $theme,
      'region' => 'content',
      'weight' => 10,
      'plugin' => 'language_block:language_interface',
      'settings' => [
        'id' => 'language_block:language_interface',
        'label' => 'Language switcher',
        'provider' => 'language',
        'label_display' => '0',
      ],
    ];

    Block::create($block_values)->save();
  }
}
