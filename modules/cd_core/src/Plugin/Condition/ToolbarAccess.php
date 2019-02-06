<?php

namespace Drupal\cd_core\Plugin\Condition;

use Drupal\Core\Condition\ConditionPluginBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a 'Toolbar Access' condition.
 *
 * @Condition(
 *   id = "toolbar_access",
 *   label = @Translation("Toolbar Access"),
 *   context = {
 *     "current_user" = @ContextDefinition("entity:user", label = @Translation("Current user")),
 *   }
 * )
 */
class ToolbarAccess extends ConditionPluginBase {

  /**
   * {@inheritdoc}
   */
  public function evaluate() {
    return $this->getContextValue('current_user')->hasPermission('access toolbar');
  }

  /**
   * {@inheritdoc}
   */
  public function summary() {
    $enabled = $this->configuration['status'];

    if ($enabled && $this->isNegated()) {
      return $this->t("User can't access toolbar.");
    }

    if ($enabled && !$this->isNegated()) {
      return $this->t('User can use toolbar.');
    }
  }

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return ['status' => FALSE] + parent::defaultConfiguration();
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form['status'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Status'),
      '#default_value' => $this->configuration['status'],
      '#default_value' => $this->t('Enable or disable this condition'),
    ];
    return parent::buildConfigurationForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitConfigurationForm(array &$form, FormStateInterface $form_state) {
    $this->configuration['status'] = !empty($form_state->getValue('status'));
    parent::submitConfigurationForm($form, $form_state);
  }

}
