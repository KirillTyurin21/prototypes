import { PosGuestField, PosInfoField, PosActionItem } from '@/components/pos-terminal';

/**
 * Метаданные шаблона диалога для галереи.
 */
export interface GalleryTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  dialogSize: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Каталог шаблонов диалогов для галереи.
 */
export const GALLERY_TEMPLATES: GalleryTemplate[] = [
  {
    id: 'numpad',
    name: 'Цифровая клавиатура',
    description: 'Ввод PIN-кода, количества гостей, номера карты',
    icon: 'key-round',
    dialogSize: 'sm',
  },
  {
    id: 'keyboard',
    name: 'Экранная клавиатура',
    description: 'Полная QWERTY-клавиатура (ЙЦУКЕН / QWERTY)',
    icon: 'type',
    dialogSize: 'lg',
  },
  {
    id: 'guest-card',
    name: 'Карточка гостя',
    description: 'Данные программы лояльности: баланс, скидка, статус',
    icon: 'user',
    dialogSize: 'md',
  },
  {
    id: 'info-banner',
    name: 'Информационный баннер',
    description: 'Статусные данные: лицензия, сертификат, версия ПО',
    icon: 'info',
    dialogSize: 'md',
  },
  {
    id: 'status-success',
    name: 'Статус: Успех',
    description: 'Подтверждение успешной операции',
    icon: 'check-circle',
    dialogSize: 'md',
  },
  {
    id: 'status-error',
    name: 'Статус: Ошибка',
    description: 'Сообщение об ошибке операции',
    icon: 'x-circle',
    dialogSize: 'md',
  },
  {
    id: 'status-loading',
    name: 'Статус: Загрузка',
    description: 'Индикатор ожидания операции',
    icon: 'loader-2',
    dialogSize: 'md',
  },
  {
    id: 'confirm',
    name: 'Подтверждение',
    description: 'Диалог с вопросом и кнопками ОК / Отмена',
    icon: 'alert-circle',
    dialogSize: 'sm',
  },
  {
    id: 'action-list',
    name: 'Список действий',
    description: 'Вертикальное меню выбора варианта действия',
    icon: 'list',
    dialogSize: 'md',
  },
  {
    id: 'guest-list',
    name: 'Список гостей',
    description: 'Поиск и выбор гостя из базы',
    icon: 'users',
    dialogSize: 'md',
  },
];

// ─── Демо-данные для каждого шаблона ─────────────────

export const DEMO_GUEST_CARD_FIELDS: PosGuestField[] = [
  { label: 'Имя', value: 'Иванов Иван Иванович' },
  { label: 'Телефон', value: '+7 (916) 123-45-67' },
  { label: 'Карта', value: '•••• 4589' },
  { label: 'Баланс', value: '2 450 ₽' },
  { label: 'Скидка', value: '15%' },
  { label: 'Статус', value: 'Золотой' },
];

export const DEMO_INFO_BANNER_FIELDS: PosInfoField[] = [
  { label: 'Лицензия', value: 'Активна', valueColor: '#4caf50' },
  { label: 'Срок действия', value: '31.12.2026' },
  { label: 'Тип', value: 'Корпоративная' },
  { label: 'Версия ПО', value: '9.2.4815' },
  { label: 'Сервер', value: 'cloud-01.local', valueColor: '#2196f3' },
];

export const DEMO_ACTION_LIST_ITEMS: PosActionItem[] = [
  { id: 'qr', label: 'Сканировать QR-код', subtitle: 'Направить камеру на экран гостя' },
  { id: 'card', label: 'Карта лояльности', subtitle: 'Провести магнитную карту' },
  { id: 'phone', label: 'По номеру телефона', subtitle: 'Ввести номер на клавиатуре' },
  { id: 'manual', label: 'Ввести код вручную', subtitle: 'Код из SMS или приложения' },
];
