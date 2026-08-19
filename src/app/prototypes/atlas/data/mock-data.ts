import { PaymentIntegration, RestaurantNode } from '../types';

/** Иконка сервиса СберЧаевые (белая линия, конвенция Киоск/Менюборд, вариант 1 «QR + монета») */
const SBER_TIPS_LOGO = '<svg width="75" height="75" viewBox="0 0 75 75" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M19 11h37c4.418 0 8 3.582 8 8v37c0 4.418-3.582 8-8 8H19c-4.418 0-8-3.582-8-8V19c0-4.418 3.582-8 8-8zm0 5h37c1.657 0 3 1.343 3 3v37c0 1.657-1.343 3-3 3H19c-1.657 0-3-1.343-3-3V19c0-1.657 1.343-3 3-3z" fill="white" fill-rule="evenodd"/>' +
  '<path d="M21 21h9v9h-9v-9zm2.7 2.7v3.6h3.6v-3.6h-3.6z" fill="white" fill-rule="evenodd"/>' +
  '<path d="M45 21h9v9h-9v-9zm2.7 2.7v3.6h3.6v-3.6h-3.6z" fill="white" fill-rule="evenodd"/>' +
  '<path d="M21 45h9v9h-9v-9zm2.7 2.7v3.6h3.6v-3.6h-3.6z" fill="white" fill-rule="evenodd"/>' +
  '<rect x="33.5" y="23" width="3" height="3" rx="1" fill="white" opacity=".75"/>' +
  '<rect x="38" y="27" width="3" height="3" rx="1" fill="white" opacity=".75"/>' +
  '<rect x="33" y="32" width="3" height="3" rx="1" fill="white" opacity=".75"/>' +
  '<rect x="41" y="32.5" width="3" height="3" rx="1" fill="white" opacity=".75"/>' +
  '<rect x="24" y="33" width="3" height="3" rx="1" fill="white" opacity=".75"/>' +
  '<rect x="47.5" y="34" width="3" height="3" rx="1" fill="white" opacity=".75"/>' +
  '<rect x="29" y="42" width="3" height="3" rx="1" fill="white" opacity=".75"/>' +
  '<path d="M45 42a7 7 0 1 0 0 14 7 7 0 1 0 0-14zm0 3.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 1 1 0-7z" fill="white" fill-rule="evenodd"/>' +
  '</svg>';

export const MOCK_INTEGRATIONS: PaymentIntegration[] = [
  {
    id: 'kaspi',
    name: 'Kaspi Bank',
    logoLetter: 'K',
    logoColor: 'bg-red-500',
    status: 'disconnected',
    connectedRestaurantIds: [],
    operationCategories: [
      { id: 'payments', label: 'Платёжные операции', description: 'Создание и возврат платежей через Kaspi QR', iconName: 'credit-card', allowed: false },
      { id: 'orders', label: 'Создание заказов доставки и самовывоза', description: 'Работа с меню, стоп-листами, создание заказов доставки и самовывоза', iconName: 'shopping-cart', allowed: false },
    ],
    paymentType: { name: 'Kaspi QR', fiscal: true, buttonLabel: 'Kaspi QR' },
    discount: null,
    requiredFields: [],
    licenseRequired: true,
  },
  {
    id: 'simplepay',
    name: 'Simple Pay',
    logoLetter: 'S',
    logoColor: 'bg-blue-600',
    status: 'disconnected',
    connectedRestaurantIds: [],
    operationCategories: [
      { id: 'payments', label: 'Платёжные операции', description: 'Приём платежей через Simple Pay', iconName: 'credit-card', allowed: false },
    ],
    paymentType: { name: 'Simple Pay', fiscal: false, buttonLabel: 'Simple Pay' },
    discount: null,
    requiredFields: [
      { key: 'xpkKey', label: 'XPK-ключ', type: 'password', required: true, placeholder: 'Введите XPK-ключ...', helpText: 'Выдаётся партнёром при подключении' },
    ],
    licenseRequired: true,
  },
  {
    id: 'sber-tips',
    name: 'СберЧаевые',
    logoLetter: 'C',
    logoColor: 'bg-green-600',
    logoIcon: SBER_TIPS_LOGO,
    status: 'disconnected',
    connectedRestaurantIds: [],
    operationCategories: [
      { id: 'payments', label: 'Платёжные операции', description: 'Приём оплаты счёта и чаевых по QR-коду', iconName: 'credit-card', allowed: false },
      { id: 'orders', label: 'Данные заказов и столов', description: 'Информация о заказах и столах для оплаты по QR', iconName: 'receipt', allowed: false },
      { id: 'qr', label: 'Печать QR на пречеке и чеке', description: 'QR-код печатается при любом способе оплаты', iconName: 'printer', allowed: false },
    ],
    paymentType: { name: 'Sbertips', fiscal: true, buttonLabel: 'СберЧаевые', note: 'Заменит существующий тип оплаты CoinBox' },
    discount: null,
    requiredFields: [
      { key: 'sberRestInstitutionId', label: 'Код ресторана в системе Сбера', type: 'text', required: true, placeholder: 'Например: 11111', helpText: 'Предоставляется банком при заключении договора (ранее прописывался вручную в ссылке QR-кода)' },
      { key: 'terminalGroup', label: 'Терминальная группа', type: 'select', required: true, helpText: 'Настройка применяется к главной кассе группы', options: [
        { value: 'zal', label: 'Зал' },
        { value: 'bar', label: 'Бар' },
        { value: 'terrace', label: 'Терраса' },
      ] },
      { key: 'qrSurface', label: 'Печать QR-кода', type: 'select', required: true, helpText: 'QR-код печатается при любом способе оплаты', options: [
        { value: '1', label: 'Только пречек' },
        { value: '3', label: 'Пречек и чек' },
        { value: '2', label: 'Только чек' },
        { value: '0', label: 'Не печатать' },
      ] },
      { key: 'qrHeaderText', label: 'Текст над QR-кодом', type: 'text', required: false, placeholder: 'Отсканируйте QR-код, чтобы оплатить счёт и оставить чаевые', helpText: 'Применится после закрытия/открытия кассовой смены' },
      { key: 'serviceName', label: 'Название сервиса на чеке', type: 'text', required: false, placeholder: 'СберЧаевые', helpText: 'Применится после закрытия/открытия кассовой смены' },
    ],
    licenseRequired: true,
    accessIntro: 'Сервис',
    consentText: 'Я даю согласие на активацию разрешительного сервиса для приложения «СберЧаевые». Подтверждаю, что ознакомлен с перечнем операций, к которым сервис получает доступ, и даю разрешение на автоматическое создание типа оплаты «Sbertips» и печать QR-кода на пречеке и чеке.',
    submitLabel: 'Подтвердить и активировать',
    activatedToast: 'Сервис СберЧаевые активирован',
    autoEntities: [
      { iconName: 'qr-code', title: 'Печать QR-кода на пречеке и чеке', subtitle: 'При любом способе оплаты (включая наличные)' },
    ],
    connectedNote: 'Тексты QR-кода, заданные в настройках, применятся после закрытия и открытия кассовой смены.',
    howToAccessNote: 'Как передать доступ банку: сообщите менеджеру банка CRM ID организации. Его можно найти в iikoOffice: Помощь → О программе → «ID организации».',
  },
];

export const MOCK_CHAIN_RESTAURANTS: RestaurantNode[] = [
  {
    id: 'group-center',
    name: 'Центр',
    address: 'Группа ресторанов',
    children: [
      { id: 'r-001', name: 'Тверская 12', address: 'ул. Тверская, 12', isConnected: false },
      { id: 'r-002', name: 'Арбат 25', address: 'ул. Арбат, 25', isConnected: false },
      { id: 'r-003', name: 'Красная Пресня 3', address: 'ул. Красная Пресня, 3', isConnected: false },
    ],
    isConnected: false,
  },
  {
    id: 'group-north',
    name: 'Север',
    address: 'Группа ресторанов',
    children: [
      { id: 'r-004', name: 'Дмитровское ш. 89', address: 'Дмитровское ш., 89', isConnected: false },
      { id: 'r-005', name: 'Ленинградка 45', address: 'Ленинградский пр-т, 45', isConnected: false },
      { id: 'r-006', name: 'Алтуфьево 12', address: 'Алтуфьевское ш., 12', isConnected: false },
    ],
    isConnected: false,
  },
  {
    id: 'group-south',
    name: 'Юг',
    address: 'Группа ресторанов',
    children: [
      { id: 'r-007', name: 'Варшавка 56', address: 'Варшавское ш., 56', isConnected: false },
      { id: 'r-008', name: 'Каширка 34', address: 'Каширское ш., 34', isConnected: false },
    ],
    isConnected: false,
  },
  {
    id: 'group-east',
    name: 'Восток',
    address: 'Группа ресторанов',
    children: [
      { id: 'r-009', name: 'Щёлковская 7', address: 'Щёлковское ш., 7', isConnected: false },
      { id: 'r-010', name: 'Энтузиастов 22', address: 'ш. Энтузиастов, 22', isConnected: false },
    ],
    isConnected: false,
  },
  { id: 'r-011', name: 'Пятницкая 15', address: 'ул. Пятницкая, 15', isConnected: false },
  { id: 'r-012', name: 'Покровка 8', address: 'ул. Покровка, 8', isConnected: false },
  { id: 'r-013', name: 'Профсоюзная 67', address: 'ул. Профсоюзная, 67', isConnected: false },
  { id: 'r-014', name: 'Кутузовский 33', address: 'Кутузовский пр-т, 33', isConnected: false },
  { id: 'r-015', name: 'Новый Арбат 21', address: 'ул. Новый Арбат, 21', isConnected: false },
];

export const MOCK_RMS_RESTAURANT: RestaurantNode[] = [
  { id: 'r-001', name: 'Тверская 12', address: 'ул. Тверская, 12', isConnected: false },
];
