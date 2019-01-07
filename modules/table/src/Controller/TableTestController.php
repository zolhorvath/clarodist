<?php

namespace Drupal\table\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\Link;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Ships test page for tables.
 */
class TableTestController extends ControllerBase {

  /**
   * The date formatter service.
   *
   * @var \Drupal\Core\Datetime\DateFormatterInterface
   */
  protected $dateFormatter;

  /**
   * Constructs the TableTestController object.
   *
   * @param \Drupal\Core\Datetime\DateFormatterInterface $date_formatter
   *   The date formatter service.
   */
  public function __construct(DateFormatterInterface $date_formatter) {
    $this->dateFormatter = $date_formatter;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('date.formatter')
    );
  }

  /**
   * Returns a renderable array for a test page.
   */
  public function defaultContent() {
    $build['table'] = $this->getTableSceleton() + [
      '#caption' => $this->t('Caption of Example Table'),
      '#attributes' => [
        'class' => ['test-table', 'test-table--filled'],
      ],
    ];

    $rows = [
      [
        'title' => $this->t('Sed at eros in nisi pellentesque'),
        'type' => $this->t('Basic page'),
        'author' => 'John',
        'status' => $this->t('Published'),
        'updated' => 1545860911,
      ],
      [
        'title' => $this->t('Curabitur varius ligula magna, ut fringilla ante sagittis sit amet – enean mattis quam sed egestas porttitor — ed mauris nulla, gravida id sapien non, dictum pulvinar felis'),
        'type' => $this->t('Basic page'),
        'author' => 'Mark',
        'status' => $this->t('Published'),
        'updated' => 1544430128,
      ],
      [
        'title' => $this->t('Sed mauris nulla, gravida id sapien non!'),
        'type' => $this->t('Article'),
        'author' => 'Jason',
        'status' => $this->t('Unpublished'),
        'updated' => 1546100119,
      ],
      [
        'title' => $this->t('Aliquam rhoncus'),
        'type' => $this->t('Basic page'),
        'author' => 'Jason',
        'status' => $this->t('Unpublished'),
        'updated' => 1546570910,
      ],
    ];

    $order = tablesort_get_order($build['table']['#header']);
    $sort = tablesort_get_sort($build['table']['#header']);
    $sort_option = [];

    foreach ($rows as $delta => $row) {
      $sort_option[$delta] = $row[$order['sql']];
    }

    array_multisort($sort_option, ($sort === 'asc' ? SORT_ASC : SORT_DESC), $rows, ($sort === 'asc' ? SORT_ASC : SORT_DESC));

    $front_url = Url::fromRoute('<front>');

    foreach ($rows as $delta => $values) {
      $build['table'][$delta]['checkbox'] = [
        '#type' => 'checkbox',
        '#title' => $this->t('Modify this item'),
        '#title_display' => 'invisible',
      ];
      foreach ($values as $key => $value) {
        $renderable = ['#markup' => $value];

        switch ($key) {
          case 'updated':
            $renderable['#markup'] = $this->dateFormatter->format($value, 'long');
            break;

          case 'title':
            $renderable = Link::fromTextAndUrl($value, $front_url)->toRenderable();
            break;
        }

        $build['table'][$delta][$key] = $renderable;
      }
      $build['table'][$delta]['operations'] = [
        '#type' => 'dropbutton',
        '#links' => [
          'dummy_edit' => [
            'title' => $this->t('Edit'),
            'url' => $front_url,
          ],
          'dummy_delete' => [
            'title' => $this->t('Delete'),
            'url' => $front_url,
          ],
        ],
      ];
    }

    if (!empty($rows)) {
      $build['table']['#footer'] = [
        [
          'data' => [
            '',
            [
              'data' => 'Table footer — last change',
              'colspan' => 4,
            ],
            [
              'data' => $this->dateFormatter->format(max(array_column($rows, 'updated')), 'long'),
              'colspan' => 2,
            ],
          ],
        ],
      ];
    }

    // Empty table.
    $build['table_empty'] = $this->getTableSceleton() + [
      '#caption' => $this->t('Caption of Empty Table'),
      '#attributes' => [
        'class' => ['test-table', 'test-table--empty'],
      ],
    ];

    $build['#cache']['contexts'] = [
      'url.query_args',
      'languages:language_interface',
    ];

    return $build;
  }

  /**
   * Returns sceleton for example tables.
   */
  public function getTableSceleton() {
    return [
      '#type' => 'table',
      '#empty' => $this->t('No content available.'),
      '#header' => [
        '',
        [
          'data' => $this->t('Title'),
          'field' => 'title',
        ],
        [
          'data' => $this->t('Content type'),
          'field' => 'type',
          'class' => [RESPONSIVE_PRIORITY_LOW],
        ],
        [
          'data' => $this->t('Author'),
          'class' => [RESPONSIVE_PRIORITY_LOW],
        ],
        [
          'data' => $this->t('Status'),
          'field' => 'status',
          'class' => [RESPONSIVE_PRIORITY_MEDIUM],
        ],
        [
          'data' => $this->t('Updated'),
          'field' => 'updated',
          'sort' => 'desc',
        ],
        [
          'data' => $this->t('Operations'),
          'class' => [RESPONSIVE_PRIORITY_MEDIUM],
        ],
      ],
    ];
  }

}
