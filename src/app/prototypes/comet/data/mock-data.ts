import { Organization, Account, YpTerminal, Partner, MerchantInfo, MerchantStatus, UserTokenInfo, MccCode, OAuthState } from '../types';

export const MOCK_ORGANIZATIONS: Organization[] = [
  {
    organizationId: '1',
    organizationName: 'ООО "Ресторанная группа Север"',
    stores: [
      { storeId: '101', storeName: 'Ресторан "Премьер"', hasYandexPayKey: true, terminalsConfigured: 'partial' },
      { storeId: '102', storeName: 'Кафе "Уют"', hasYandexPayKey: false, terminalsConfigured: 'none' },
      { storeId: '103', storeName: 'Бар "Огонёк"', hasYandexPayKey: false, terminalsConfigured: 'none' },
    ],
  },
  {
    organizationId: '2',
    organizationName: 'ИП Иванов А.В.',
    stores: [
      { storeId: '201', storeName: 'Пиццерия "Капричоза"', hasYandexPayKey: false, terminalsConfigured: 'none' },
      { storeId: '202', storeName: 'Суши-бар "Токио"', hasYandexPayKey: true, terminalsConfigured: 'full' },
    ],
  },
  {
    organizationId: '3',
    organizationName: 'ООО "Быстрое питание"',
    stores: [
      { storeId: '301', storeName: 'Бургерная №1', hasYandexPayKey: true, terminalsConfigured: 'none' },
      { storeId: '302', storeName: 'Бургерная №2', hasYandexPayKey: false, terminalsConfigured: 'none' },
      { storeId: '303', storeName: 'Бургерная №3', hasYandexPayKey: true, terminalsConfigured: 'full' },
    ],
  },
];

export const MOCK_ACCOUNTS: Account[] = [
  { key: 'BS1F00733B8T64BE8O1BT9CA8VLKIH69', name: 'QR табличка - ID 00095', active: 1 },
  { key: 'AS1R000RK04U6NRV8F1O5SRIRTJAHAHR', name: 'QR табличка - ID 35126', active: 1 },
  { key: 'CS1T001AB02C3DE4FG5H6IJ7KL8MN9OP', name: 'QR табличка - ID 48302', active: 1 },
];

export function getMockTerminals(storeId: string): YpTerminal[] {
  if (storeId === '301') {
    return [];
  }
  return [
    {
      terminalId: 't1',
      terminalName: 'Касса 1',
      accountKey: 'BS1F00733B8T64BE8O1BT9CA8VLKIH69',
      accountName: 'QR табличка - ID 00095',
    },
    { terminalId: 't2', terminalName: 'Касса 2', accountKey: null, accountName: null },
    {
      terminalId: 't3',
      terminalName: 'Касса 3',
      accountKey: 'AS1R000RK04U6NRV8F1O5SRIRTJAHAHR',
      accountName: 'QR табличка - ID 35126',
    },
  ];
}

export function getMockDefaultAccountKey(storeId: string): string | null {
  return storeId === '301' ? 'BS1F00733B8T64BE8O1BT9CA8VLKIH69' : null;
}

// --- OAuth-онбординг: мок-данные ---

/** Маппинг: storeId → merchantId (какой мерчант привязан к какому ресторану) */
export const MOCK_STORE_MERCHANT_MAP: Record<string, string> = {
  '101': 'merchant-101', // Премьер → active
  '102': 'merchant-102', // Уют → processing
  '103': 'merchant-103', // Огонёк → processing
  '201': 'merchant-201', // Капричоза → failed
  '202': 'merchant-202', // Токио → active
  '301': 'merchant-301', // Бургерная №1 → active
  '302': 'merchant-302', // Бургерная №2 → processing
  '303': 'merchant-303', // Бургерная №3 → active
};

/** Маппинг: organizationId → partner_id */
export const MOCK_ORG_PARTNER_MAP: Record<string, string> = {
  '1': 'partner-org-1',
  '2': 'partner-org-2',
  '3': 'partner-org-3',
};

export const MOCK_OAUTH_STATE: OAuthState = {
  isAuthorized: false,
  accessToken: null,
  expiresAt: null,
  userName: null,
  userEmail: null,
};

export const MOCK_PARTNERS: Partner[] = [
  {
    partner_id: 'partner-org-1',
    name: 'ООО "Ресторанная группа Север"',
    registration_data: {
      tax_ref_number: '7707083893',
      ogrn: '1027700132195',
      kpp: '770701001',
      legal_address: '119021, г. Москва, ул. Льва Толстого, д. 16',
      postal_address: '119021, г. Москва, ул. Льва Толстого, д. 16',
      postal_code: '119021',
      full_company_name: 'Общество с ограниченной ответственностью "Ресторанная группа Север"',
      ceo_name: 'Петров Алексей Михайлович',
      url: 'http://gruppa-sever.ru',
    },
    contact: {
      email: 'admin@gruppa-sever.ru',
      phone: '+79001234567',
      first_name: 'Алексей',
      last_name: 'Петров',
      middle_name: 'Михайлович',
    },
  },
  {
    partner_id: 'partner-org-2',
    name: 'ИП Иванов А.В.',
    registration_data: {
      tax_ref_number: '771234567890',
      ogrn: '318774600000000',
      kpp: '',
      legal_address: '125009, г. Москва, ул. Тверская, д. 22',
      postal_address: '125009, г. Москва, ул. Тверская, д. 22',
      postal_code: '125009',
      full_company_name: 'Индивидуальный предприниматель Иванов Андрей Владимирович',
      ceo_name: 'Иванов Андрей Владимирович',
      url: '',
    },
    contact: {
      email: 'ivanov.av@mail.ru',
      phone: '+79009876543',
      first_name: 'Андрей',
      last_name: 'Иванов',
      middle_name: 'Владимирович',
    },
  },
  {
    partner_id: 'partner-org-3',
    name: 'ООО "Быстрое питание"',
    registration_data: {
      tax_ref_number: '7709456789',
      ogrn: '1157746000000',
      kpp: '770901001',
      legal_address: '107023, г. Москва, ул. Большая Семёновская, д. 11',
      postal_address: '107023, г. Москва, ул. Большая Семёновская, д. 11',
      postal_code: '107023',
      full_company_name: 'Общество с ограниченной ответственностью "Быстрое питание"',
      ceo_name: 'Сидоров Дмитрий Николаевич',
      url: 'http://fast-food.ru',
    },
    contact: {
      email: 'info@fast-food.ru',
      phone: '+79005551234',
      first_name: 'Дмитрий',
      last_name: 'Сидоров',
      middle_name: 'Николаевич',
    },
  },
];

export const MOCK_MERCHANTS: MerchantInfo[] = [
  // ООО "Ресторанная группа Север" — 3 ресторана
  {
    merchant_id: 'merchant-101',
    partner_id: 'partner-org-1',
    name: 'Ресторан "Премьер"',
    is_offline: true,
    enabled: true,
    registration_status: 'active',
    created: '2026-03-10T10:00:00Z',
    updated: '2026-03-15T14:00:00Z',
  },
  {
    merchant_id: 'merchant-102',
    partner_id: 'partner-org-1',
    name: 'Кафе "Уют"',
    is_offline: true,
    enabled: true,
    registration_status: 'processing',
    created: '2026-03-18T09:00:00Z',
    updated: '2026-03-18T09:00:00Z',
  },
  {
    merchant_id: 'merchant-103',
    partner_id: 'partner-org-1',
    name: 'Бар "Огонёк"',
    is_offline: true,
    enabled: true,
    registration_status: 'processing',
    created: '2026-03-19T11:00:00Z',
    updated: '2026-03-19T11:00:00Z',
  },
  // ИП Иванов А.В. — 2 ресторана
  {
    merchant_id: 'merchant-201',
    partner_id: 'partner-org-2',
    name: 'Пиццерия "Капричоза"',
    is_offline: true,
    enabled: true,
    registration_status: 'failed',
    created: '2026-03-12T08:00:00Z',
    updated: '2026-03-14T16:00:00Z',
  },
  {
    merchant_id: 'merchant-202',
    partner_id: 'partner-org-2',
    name: 'Суши-бар "Токио"',
    is_offline: true,
    enabled: true,
    registration_status: 'active',
    created: '2026-03-08T10:30:00Z',
    updated: '2026-03-10T12:00:00Z',
  },
  // ООО "Быстрое питание" — 3 бургерных
  {
    merchant_id: 'merchant-301',
    partner_id: 'partner-org-3',
    name: 'Бургерная №1',
    is_offline: true,
    enabled: true,
    registration_status: 'active',
    created: '2026-03-05T09:00:00Z',
    updated: '2026-03-06T11:00:00Z',
  },
  {
    merchant_id: 'merchant-302',
    partner_id: 'partner-org-3',
    name: 'Бургерная №2',
    is_offline: true,
    enabled: true,
    registration_status: 'processing',
    created: '2026-03-19T15:00:00Z',
    updated: '2026-03-19T15:00:00Z',
  },
  {
    merchant_id: 'merchant-303',
    partner_id: 'partner-org-3',
    name: 'Бургерная №3',
    is_offline: true,
    enabled: true,
    registration_status: 'active',
    created: '2026-03-07T13:00:00Z',
    updated: '2026-03-09T10:00:00Z',
  },
];

export const MOCK_MERCHANT_STATUS: MerchantStatus = {
  merchant_id: 'merchant-101',
  registration_status: 'active',
  poses: [
    {
      pos_id: 'pos-premier-1',
      title: 'Касса #1',
      activated: true,
      token: 'ut_premier_a1b2c3d4',
      qrc_id: 'qrc_premier_001',
      bind_status: 'bound',
    },
  ],
};

export const MOCK_USER_TOKENS: UserTokenInfo[] = [
  {
    id: 'tok-premier-001',
    merchant_id: 'merchant-101',
    partner_id: 'partner-org-1',
    last_four: 'c3d4',
    token_format: 'YANDEX_PAY',
    created_at: '2026-03-15T12:00:00Z',
  },
  {
    id: 'tok-tokyo-001',
    merchant_id: 'merchant-202',
    partner_id: 'partner-org-2',
    last_four: 'f7g8',
    token_format: 'YANDEX_PAY',
    created_at: '2026-03-10T14:00:00Z',
  },
  {
    id: 'tok-burger1-001',
    merchant_id: 'merchant-301',
    partner_id: 'partner-org-3',
    last_four: 'k9m0',
    token_format: 'YANDEX_PAY',
    created_at: '2026-03-06T16:00:00Z',
  },
  {
    id: 'tok-burger3-001',
    merchant_id: 'merchant-303',
    partner_id: 'partner-org-3',
    last_four: 'p2q3',
    token_format: 'YANDEX_PAY',
    created_at: '2026-03-09T11:00:00Z',
  },
];

export const MOCK_MCC_CODES: MccCode[] = [
  { mcc: '5812', name: 'Рестораны' },
  { mcc: '5813', name: 'Бары и ночные клубы' },
  { mcc: '5814', name: 'Фастфуд' },
  { mcc: '7230', name: 'Парикмахерские и косметические услуги' },
  { mcc: '7298', name: 'Оздоровительные и спа-услуги' },
];
