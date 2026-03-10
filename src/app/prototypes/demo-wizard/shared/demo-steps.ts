/** Тип действия демо-шага */
export type DemoAction = 'type' | 'select' | 'click' | 'toggle' | 'check';

/** Одиночный шаг демонстрации */
export interface DemoStep {
  /** Уникальный ID шага */
  id: number;
  /** data-demo селектор целевого элемента */
  target: string;
  /** Тип действия */
  action: DemoAction;
  /** Значение для ввода (для type/select) */
  value?: string;
  /** Описание шага для пользователя */
  description: string;
  /** Задержка ПОСЛЕ выполнения шага (мс) */
  delayAfter: number;
}

/** Все 8 шагов демонстрации */
export const DEMO_STEPS: DemoStep[] = [
  {
    id: 1,
    target: 'input-name',
    action: 'type',
    value: 'Том-ям с креветками',
    description: 'Ввести наименование блюда',
    delayAfter: 800,
  },
  {
    id: 2,
    target: 'select-category',
    action: 'select',
    value: 'soups',
    description: 'Выбрать категорию «Супы»',
    delayAfter: 800,
  },
  {
    id: 3,
    target: 'textarea-desc',
    action: 'type',
    value: 'Острый тайский суп с креветками, грибами, лемонграссом и кокосовым молоком.',
    description: 'Ввести описание блюда',
    delayAfter: 800,
  },
  {
    id: 4,
    target: 'input-price',
    action: 'type',
    value: '99',
    description: 'Установить цену',
    delayAfter: 800,
  },
  {
    id: 5,
    target: 'toggle-active',
    action: 'toggle',
    description: 'Включить переключатель «Активен»',
    delayAfter: 800,
  },
  {
    id: 6,
    target: 'checkbox-publish',
    action: 'check',
    description: 'Отметить «Опубликовать на сайте»',
    delayAfter: 800,
  },
  {
    id: 7,
    target: 'btn-save',
    action: 'click',
    description: 'Нажать «Сохранить»',
    delayAfter: 1500,
  },
  {
    id: 8,
    target: 'btn-modal-home',
    action: 'click',
    description: 'Нажать «Вернуться на главный экран»',
    delayAfter: 500,
  },
];

// ── Утилиты ──

/** Промис-задержка */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Найти host-элемент по data-demo атрибуту */
export function findDemoElement(target: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-demo="${target}"]`);
}

/** Найти нативный input/textarea внутри UI-компонента */
export function findNativeInput(host: HTMLElement): HTMLInputElement | HTMLTextAreaElement | null {
  if (host instanceof HTMLInputElement || host instanceof HTMLTextAreaElement) {
    return host;
  }
  return host.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
}

/** Найти нативный select внутри UI-компонента */
export function findNativeSelect(host: HTMLElement): HTMLSelectElement | null {
  if (host instanceof HTMLSelectElement) {
    return host;
  }
  return host.querySelector<HTMLSelectElement>('select');
}

/** Найти нативный button внутри UI-компонента */
export function findNativeButton(host: HTMLElement): HTMLButtonElement | null {
  if (host instanceof HTMLButtonElement) {
    return host;
  }
  return host.querySelector<HTMLButtonElement>('button');
}

/** Найти нативный checkbox внутри UI-компонента */
export function findNativeCheckbox(host: HTMLElement): HTMLInputElement | null {
  if (host instanceof HTMLInputElement && host.type === 'checkbox') {
    return host;
  }
  return host.querySelector<HTMLInputElement>('input[type="checkbox"]');
}

/** Typewriter-эффект: посимвольный ввод текста */
export async function typeText(
  host: HTMLElement,
  text: string,
  charDelayMs = 50,
): Promise<void> {
  const input = findNativeInput(host);
  if (!input) return;

  input.focus();
  input.value = '';
  dispatchInputEvent(input);

  for (const char of text) {
    input.value += char;
    dispatchInputEvent(input);
    await delay(charDelayMs);
  }
}

/** Программный выбор значения в select */
export function selectValue(host: HTMLElement, value: string): void {
  const select = findNativeSelect(host);
  if (!select) return;

  select.value = value;
  select.dispatchEvent(new Event('change', { bubbles: true }));
}

/** Программный клик по кнопке внутри компонента */
export function clickButton(host: HTMLElement): void {
  const btn = findNativeButton(host);
  if (btn) {
    btn.click();
  }
}

/** Программный клик по toggle (button[role=switch]) */
export function clickToggle(host: HTMLElement): void {
  const btn = host.querySelector<HTMLButtonElement>('button[role="switch"]');
  if (btn) {
    btn.click();
  }
}

/** Программный клик по checkbox */
export function clickCheckbox(host: HTMLElement): void {
  const checkbox = findNativeCheckbox(host);
  if (checkbox) {
    checkbox.click();
  }
}

/** Dispatch input + change events для синхронизации с Angular */
function dispatchInputEvent(el: HTMLElement): void {
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Выполнить один шаг демо.
 * Возвращает Promise, который резолвится после завершения действия (без delayAfter).
 */
export async function executeStep(step: DemoStep, charDelayMs = 50): Promise<void> {
  const host = findDemoElement(step.target);
  if (!host) return;

  switch (step.action) {
    case 'type':
      await typeText(host, step.value ?? '', charDelayMs);
      break;
    case 'select':
      selectValue(host, step.value ?? '');
      break;
    case 'click':
      clickButton(host);
      break;
    case 'toggle':
      clickToggle(host);
      break;
    case 'check':
      clickCheckbox(host);
      break;
  }
}
