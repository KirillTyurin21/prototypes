import { PermissionNode, Role } from '../types';

/** Список ролей (как на стенде) */
export const MOCK_ROLES: Role[] = [
  { code: 'barmen', name: 'Бармен' },
  { code: 'cashier', name: 'Кассир' },
  { code: 'fastfood_cashier', name: 'Кассир фаст-фуда' },
  { code: 'courier', name: 'Курьер' },
  { code: 'manager', name: 'Менеджер' },
  { code: 'waiter', name: 'Официант' },
  { code: 'guard', name: 'Охранник' },
  { code: 'cook', name: 'Повар' },
  { code: 'dishwasher', name: 'Посудомойка' },
  { code: 'admin', name: 'Управляющий' },
];

/**
 * ЦЕЛЕВОЕ дерево прав доступа (после внедрения DS-доработок).
 *
 * Структура основана на спецификации DS-Права-доступа, раздел 4.1:
 * - Новая папка «Экраны и звуки» верхнего уровня
 * - 5 подпапок с 5 кодами APP_*
 * - 3 новых кода (APP_CUSTOMER_SCREEN, APP_HINTS, APP_MENU_BOARD)
 * - 2 кода перенесены с корневого уровня (APP_ARRIVALS, APP_DIGITAL_VOICE)
 */
export const MOCK_PERMISSION_TREE: PermissionNode[] = [
  {
    id: 'folder_kassa',
    type: 'folder',
    label: 'Касса и зал',
    children: [],
    checked: false,
  },
  {
    id: 'folder_menu',
    type: 'folder',
    label: 'Меню',
    children: [],
    checked: false,
  },
  {
    id: 'folder_sklad',
    type: 'folder',
    label: 'Склад',
    children: [],
    checked: false,
  },
  {
    id: 'folder_finance',
    type: 'folder',
    label: 'Финансы',
    children: [],
    checked: false,
  },
  {
    id: 'folder_kitchen',
    type: 'folder',
    label: 'Кухня',
    children: [],
    checked: false,
  },
  {
    id: 'folder_employees',
    type: 'folder',
    label: 'Сотрудники',
    children: [],
    checked: false,
  },
  {
    id: 'folder_guests',
    type: 'folder',
    label: 'Гости',
    children: [],
    checked: false,
  },
  {
    id: 'folder_business',
    type: 'folder',
    label: 'Бизнес',
    children: [],
    checked: false,
  },
  {
    id: 'folder_delivery',
    type: 'folder',
    label: 'Доставка',
    children: [],
    checked: false,
  },
  {
    id: 'folder_production',
    type: 'folder',
    label: 'Производство',
    children: [],
    checked: false,
  },
  {
    id: 'folder_admin',
    type: 'folder',
    label: 'Администрирование',
    children: [
      {
        id: 'folder_calendar',
        type: 'folder',
        label: 'Календарь',
        children: [],
        checked: false,
      },
      {
        id: 'folder_general_settings',
        type: 'folder',
        label: 'Основные настройки',
        children: [],
        checked: false,
      },
      {
        id: 'folder_plugins',
        type: 'folder',
        label: 'Кассовые плагины',
        children: [
          {
            id: 'code_plugin_configurator',
            type: 'code',
            label: 'Доступ в приложение "Конфигуратор плагинов"',
            code: 'APP_PLUGIN_CONFIGURATOR_APP',
            nameEn: 'Access to Plugin Configurator',
            checked: false,
          },
        ],
        checked: false,
      },
      {
        id: 'folder_import',
        type: 'folder',
        label: 'Импорт данных',
        children: [],
        checked: false,
      },
      {
        id: 'folder_all_settings',
        type: 'folder',
        label: 'Все настройки',
        children: [],
        checked: false,
      },
      {
        id: 'code_app_mapping',
        type: 'code',
        label: 'APP_MAPPING',
        code: 'APP_MAPPING',
        nameEn: 'Access to Mapping',
        checked: false,
      },
      {
        id: 'code_transport_config',
        type: 'code',
        label: 'APP_TRANSPORT_CONFIG',
        code: 'APP_TRANSPORT_CONFIG',
        nameEn: 'Access to Transport Config',
        checked: false,
      },
      {
        id: 'code_app_configuration',
        type: 'code',
        label: 'APP_CONFIGURATION',
        code: 'APP_CONFIGURATION',
        nameEn: 'Access to Configuration',
        checked: false,
      },
      {
        id: 'code_main_config',
        type: 'code',
        label: 'MAIN_CONFIG_SETTINGS',
        code: 'MAIN_CONFIG_SETTINGS',
        nameEn: 'Main Config Settings',
        checked: false,
      },
    ],
    checked: false,
  },
  {
    id: 'folder_integrations',
    type: 'folder',
    label: 'Интеграции',
    children: [
      {
        id: 'code_app_xero',
        type: 'code',
        label: 'APP_XERO',
        code: 'APP_XERO',
        nameEn: 'Access to Xero',
        checked: false,
      },
      {
        id: 'code_app_exchange',
        type: 'code',
        label: 'APP_EXCHANGE',
        code: 'APP_EXCHANGE',
        nameEn: 'Access to Exchange',
        checked: false,
      },
      {
        id: 'code_ozon',
        type: 'code',
        label: 'OZON_INTEGRATION_PERMISSION',
        code: 'OZON_INTEGRATION_PERMISSION',
        nameEn: 'Ozon Integration Permission',
        checked: false,
      },
      {
        id: 'code_app_licensing',
        type: 'code',
        label: 'APP_LICENSING_MAIN',
        code: 'APP_LICENSING_MAIN',
        nameEn: 'Access to Licensing',
        checked: false,
      },
    ],
    checked: false,
  },
  {
    id: 'folder_lk',
    type: 'folder',
    label: 'Личный кабинет',
    children: [],
    checked: false,
  },
  {
    id: 'folder_egais',
    type: 'folder',
    label: 'Документы ЕГАИС',
    children: [],
    checked: false,
  },
  // === НОВАЯ папка «Экраны и звуки» (DS-доработка) ===
  {
    id: 'folder_ds',
    type: 'folder',
    label: 'Экраны и звуки',
    children: [
      {
        id: 'folder_customer_screen',
        type: 'folder',
        label: 'Экран покупателя',
        children: [
          {
            id: 'code_app_customer_screen',
            type: 'code',
            label: 'Доступ в приложение "Экран покупателя"',
            code: 'APP_CUSTOMER_SCREEN',
            nameEn: 'Access to Customer Screen',
            description: 'Управление дисплеями, темами и контролами экрана покупателя',
            isNew: true,
            checked: false,
          },
        ],
        checked: false,
      },
      {
        id: 'folder_arrivals',
        type: 'folder',
        label: 'iikoArrivals',
        children: [
          {
            id: 'code_app_arrivals',
            type: 'code',
            label: 'Доступ в приложение "Электронная очередь"',
            code: 'APP_ARRIVALS',
            nameEn: 'Access to Arrivals Screens',
            description: 'Управление табло прибытия, темами и настройками очереди',
            checked: false,
          },
        ],
        checked: false,
      },
      {
        id: 'folder_hints',
        type: 'folder',
        label: 'Подсказки',
        children: [
          {
            id: 'code_app_hints',
            type: 'code',
            label: 'Доступ в приложение "Подсказки"',
            code: 'APP_HINTS',
            nameEn: 'Access to Hints',
            description: 'Управление подсказками на экране покупателя',
            isNew: true,
            checked: false,
          },
        ],
        checked: false,
      },
      {
        id: 'folder_digital_voice',
        type: 'folder',
        label: 'Озвучка',
        children: [
          {
            id: 'code_app_digital_voice',
            type: 'code',
            label: 'Доступ в приложение "Звуки"',
            code: 'APP_DIGITAL_VOICE',
            nameEn: 'Access to Sounds',
            description: 'Управление звуковыми событиями и настройками озвучки',
            checked: false,
          },
        ],
        checked: false,
      },
      {
        id: 'folder_menu_board',
        type: 'folder',
        label: 'MenuBoard',
        children: [
          {
            id: 'code_app_menu_board',
            type: 'code',
            label: 'Доступ в приложение "MenuBoard"',
            code: 'APP_MENU_BOARD',
            nameEn: 'Access to Menu Board',
            description: 'Управление цифровыми меню-бордами',
            isNew: true,
            checked: false,
          },
        ],
        checked: false,
      },
    ],
    checked: false,
  },
];

/** Начальное состояние чекбоксов для роли «Бармен» (пример) */
export const MOCK_INITIAL_CHECKED: Record<string, string[]> = {
  barmen: [],
  cashier: ['code_app_arrivals', 'code_app_digital_voice'],
  manager: [
    'code_app_arrivals',
    'code_app_digital_voice',
    'code_app_customer_screen',
    'code_app_hints',
    'code_app_menu_board',
  ],
  admin: [
    'code_app_arrivals',
    'code_app_digital_voice',
    'code_app_customer_screen',
    'code_app_hints',
    'code_app_menu_board',
    'code_plugin_configurator',
    'code_app_xero',
    'code_app_exchange',
    'code_ozon',
    'code_app_licensing',
    'code_app_mapping',
    'code_transport_config',
    'code_app_configuration',
    'code_main_config',
  ],
};
