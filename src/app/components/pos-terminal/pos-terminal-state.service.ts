import { Injectable } from '@angular/core';
import { PosScreenVariant, PosOrder, PosShiftInfo, PosUserInfo } from './types';

/**
 * Сервис состояния POS-терминала.
 * Хранит текущий экран, информацию о пользователе, смене, заказе.
 * Используется pos-terminal-shell и экранными компонентами.
 */
@Injectable({ providedIn: 'root' })
export class PosTerminalStateService {
  /** Текущий экран */
  currentScreen: PosScreenVariant = 'main';

  /** Текущий пользователь */
  user: PosUserInfo = {
    name: 'Кассир',
    role: 'Официант',
  };

  /** Информация о смене */
  shift: PosShiftInfo = {
    number: 61,
    openedAt: '20.05.26 20:56',
    manager: 'Кассир',
    cashier: 'Кассир',
    terminalName: 'Терминал 1',
    isOpen: true,
  };

  /** Текущий заказ (когда терминал на экране заказа) */
  currentOrder: PosOrder | null = null;

  /** ID выбранного стола */
  selectedTableId: number | null = null;

  /** Версия терминала (отображается в header) */
  terminalVersion = 'Front v.9.1';

  /** Переключить экран */
  setScreen(screen: PosScreenVariant): void {
    this.currentScreen = screen;
  }

  /** Текущее время (ЧЧ:ММ) */
  get currentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /** Текущая дата (ДД.ММ.ГГ) */
  get currentDate(): string {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    return `${dd}.${mm}.${yy}`;
  }
}
