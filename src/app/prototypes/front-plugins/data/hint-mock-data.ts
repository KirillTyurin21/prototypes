import { HintData, OrderDish } from './hint-types';

/** Мок-данные для демонстрации подсказок */

export const MOCK_ORDER_DISHES: OrderDish[] = [
  { id: '1', name: 'Бургер Классик', price: 389, qty: 1, category: 'Блюда' },
  { id: '2', name: 'Паста Карбонара', price: 420, qty: 1, category: 'Блюда' },
  { id: '3', name: 'Латте', price: 220, qty: 2, category: 'Напитки' },
  { id: '4', name: 'Шоколадный батончик', price: 50, qty: 1, category: 'Десерты' },
];

/** Меню для правой панели (кнопки-блюда) */
export const MOCK_MENU_ITEMS: OrderDish[] = [
  { id: '10', name: 'Блюда', price: 0, qty: 0, category: 'Блюда', isCategory: true },
  { id: '11', name: 'Погашение кредита', price: 0, qty: 0, category: 'Услуги', isCategory: true },
  { id: '12', name: 'Услуги', price: 0, qty: 0, category: 'Услуги', isCategory: true },
  { id: '13', name: 'Чай Nesty', price: 150, qty: 0, category: 'Напитки' },
  { id: '14', name: 'Изъятие', price: 0, qty: 0, category: 'Услуги', isCategory: true },
  { id: '15', name: 'Шоколадный батончик', price: 50, qty: 0, category: 'Десерты' },
  { id: '16', name: 'Кока Кола', price: 120, qty: 0, category: 'Напитки' },
];

/** Быстрые кнопки меню (правая полоса) */
export const MOCK_QUICK_MENU = ['Чай Nesty', 'Шоколадный батончик', 'Кока Кола'];

/** 1. Со скидкой (Полный) — картинка, скидка, описание */
export const HINT_FULL_DISCOUNT: HintData = {
  id: 'hint-full-discount',
  title: 'Специальное предложение',
  slogan: 'Купи яблоко на 7 рублей дешевле!',
  description: 'Вы добавили Бургер Классик. Рекомендуем: Яблоко Голден — отличная пара!',
  imageUrl: 'https://placehold.co/200x200/2d2d2d/c9a84c?text=🍎',
  recommendation: {
    id: 'rec-full-discount',
    name: 'Яблоко Голден',
    price: 56,
    oldPrice: 56,
    discountedPrice: 49,
    discountName: 'Скидка на яблоко',
    discountAmount: 7,
    attributes: ['150 г', '52 ккал'],
  },
};

/** 2. Без скидки (Полный) — картинка, без скидки */
export const HINT_FULL_NO_DISCOUNT: HintData = {
  id: 'hint-full-no-discount',
  title: 'Рекомендация кассиру',
  slogan: 'Предложите клиенту свежую выпечку к напитку!',
  description: 'Вы добавили Латте. Рекомендуем: Круассан с миндалём — идеальное сочетание!',
  imageUrl: 'https://placehold.co/200x200/2d2d2d/c9a84c?text=🥐',
  recommendation: {
    id: 'rec-full-no-discount',
    name: 'Круассан с миндалём',
    price: 189,
    oldPrice: null,
    discountedPrice: null,
    discountName: null,
    discountAmount: null,
    attributes: ['85 г', '320 ккал'],
  },
};

/** 3. Со скидкой (Без картинки) — без изображения, со скидкой */
export const HINT_NOIMG_DISCOUNT: HintData = {
  id: 'hint-noimg-discount',
  title: 'Акция дня',
  slogan: 'Картошка Фри со скидкой 15% к любому бургеру!',
  description: 'Вы добавили Чизбургер. При добавлении Картошки Фри действует скидка.',
  imageUrl: null,
  recommendation: {
    id: 'rec-noimg-discount',
    name: 'Картошка Фри',
    price: 189,
    oldPrice: 189,
    discountedPrice: 161,
    discountName: 'Скидка к бургеру',
    discountAmount: 28,
    attributes: [],
  },
};

/** 4. Без скидки (Без картинки) — минимальная подсказка */
export const HINT_NOIMG_NO_DISCOUNT: HintData = {
  id: 'hint-noimg-no-discount',
  title: 'Подсказка для кассира',
  slogan: 'Предложите клиенту дополнить заказ напитком!',
  description: '',
  imageUrl: null,
  recommendation: {
    id: 'rec-noimg-no-discount',
    name: 'Морс клюквенный',
    price: 150,
    oldPrice: null,
    discountedPrice: null,
    discountName: null,
    discountAmount: null,
    attributes: [],
  },
};

/** 5. Длинные тексты — проверка overflow и переносов */
export const HINT_LONG_TEXT: HintData = {
  id: 'hint-long-text',
  title: 'Специальное предложение от шеф-повара ресторана',
  slogan: 'Закажите фирменный стейк Рибай с гарниром из запечённых овощей и фирменным соусом Демиглас — сегодня со скидкой 20%!',
  description: 'Вы добавили Салат Цезарь с креветками. Рекомендуем дополнить заказ фирменным стейком от шеф-повара.',
  imageUrl: 'https://placehold.co/200x200/2d2d2d/c9a84c?text=🥩',
  recommendation: {
    id: 'rec-long',
    name: 'Стейк Рибай с гарниром из запечённых овощей',
    price: 1890,
    oldPrice: 1890,
    discountedPrice: 1512,
    discountName: 'Фирменная скидка -20%',
    discountAmount: 378,
    attributes: ['350 г', '680 ккал', 'Содержит глютен'],
  },
};

/** 6. Большая скидка — агрессивная акция –50% */
export const HINT_BIG_DISCOUNT: HintData = {
  id: 'hint-big-discount',
  title: 'Горячая акция',
  slogan: 'Только сегодня: Тирамису за полцены!',
  description: 'Вы добавили Пасту Карбонара. Десерт Тирамису — идеальное завершение обеда!',
  imageUrl: 'https://placehold.co/200x200/2d2d2d/c9a84c?text=🍰',
  recommendation: {
    id: 'rec-big',
    name: 'Тирамису',
    price: 490,
    oldPrice: 490,
    discountedPrice: 245,
    discountName: 'Скидка -50%',
    discountAmount: 245,
    attributes: ['150 г', '380 ккал', 'Содержит молоко'],
  },
};

/** Все варианты подсказок для сравнения */
export const ALL_HINTS: HintData[] = [
  HINT_FULL_DISCOUNT, HINT_FULL_NO_DISCOUNT, HINT_NOIMG_DISCOUNT,
  HINT_NOIMG_NO_DISCOUNT, HINT_LONG_TEXT, HINT_BIG_DISCOUNT,
];

/**
 * Подсказки, привязанные к конкретным блюдам меню.
 * Ключ — название блюда из MOCK_MENU_ITEMS.
 * У каждого блюда своя уникальная рекомендация.
 */
export const HINTS_BY_DISH: Record<string, HintData> = {
  'Чай Nesty': {
    id: 'hint-tea',
    title: 'Идеальная пара к чаю',
    slogan: 'К чаю отлично подойдёт свежий круассан со скидкой!',
    description: 'Вы добавили Чай Nesty. Рекомендуем: Круассан с шоколадом — тёплый, хрустящий.',
    imageUrl: 'https://placehold.co/200x200/2d2d2d/b8c959?text=🥐',
    recommendation: {
      id: 'rec-tea',
      name: 'Круассан с шоколадом',
      price: 179,
      oldPrice: 179,
      discountedPrice: 139,
      discountName: 'Скидка к чаю',
      discountAmount: 40,
      attributes: ['85 г', '320 ккал', 'Глютен'],
    },
  },
  'Шоколадный батончик': {
    id: 'hint-choco',
    title: 'Подсказка для кассира',
    slogan: 'Предложите клиенту горячий напиток к десерту!',
    description: 'Вы добавили Шоколадный батончик. Рекомендуем: Капучино — классика!',
    imageUrl: 'https://placehold.co/200x200/2d2d2d/b8c959?text=☕',
    recommendation: {
      id: 'rec-choco',
      name: 'Капучино',
      price: 250,
      oldPrice: null,
      discountedPrice: null,
      discountName: null,
      discountAmount: null,
      attributes: ['200 мл', 'Содержит молоко'],
    },
  },
  'Кока Кола': {
    id: 'hint-cola',
    title: 'Акция дня',
    slogan: 'Комбо: Кола + Наггетсы = выгода 15%!',
    description: 'Вы добавили Кока Колу. При добавлении Наггетсов действует скидка 15%.',
    imageUrl: 'https://placehold.co/200x200/2d2d2d/b8c959?text=🍗',
    recommendation: {
      id: 'rec-cola',
      name: 'Наггетсы 9 шт.',
      price: 289,
      oldPrice: 289,
      discountedPrice: 245,
      discountName: 'Комбо -15%',
      discountAmount: 44,
      attributes: ['180 г', '410 ккал'],
    },
  },
};

/** Подсказка по умолчанию для блюд, не имеющих индивидуальной привязки */
export const HINT_DEFAULT = HINT_FULL_DISCOUNT;
