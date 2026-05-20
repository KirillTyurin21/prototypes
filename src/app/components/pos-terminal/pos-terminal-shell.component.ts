import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { PosTerminalStateService } from './pos-terminal-state.service';
import { PosScreenVariant, PosBottomButton, POS_COLORS } from './types';

/**
 * POS Terminal Shell — контейнер-рамка терминала Front.
 *
 * Рендерит:
 * - верхнюю панель (версия, дата/время, пользователь)
 * - область контента (через ng-content[posScreen])
 * - нижнюю навигационную панель
 * - слот для оверлея плагинов (ng-content без селектора)
 *
 * Терминал встроен в страницу (не fullscreen), сохраняет пропорции 3:2.
 *
 * @example
 * <pos-terminal-shell>
 *   <div posScreen>
 *     <!-- экран терминала -->
 *   </div>
 *   <pos-dialog [open]="showDialog">
 *     <!-- диалог плагина -->
 *   </pos-dialog>
 * </pos-terminal-shell>
 */
@Component({
  selector: 'pos-terminal-shell',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <!-- Внешний контейнер: центрирует терминал в области страницы -->
    <div class="w-full h-full flex items-center justify-center bg-neutral-100 overflow-hidden p-2">

      <!-- Рамка терминала -->
      <div class="pos-frame relative flex flex-col rounded-lg overflow-hidden"
           [style.background-color]="colors.terminalBg"
           style="height: 82%; max-width: 100%; aspect-ratio: 3/2;
                  box-shadow: 0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2);">

        <!-- ─── Header bar ─── -->
        <div class="h-8 flex items-center px-3 text-xs shrink-0 select-none"
             [style.background-color]="colors.headerBg">
          <span class="text-gray-500 font-mono">{{ state.terminalVersion }}</span>
          <span class="text-gray-600 ml-3 font-mono">{{ state.currentDate }}&nbsp;&nbsp;{{ state.currentTime }}</span>
          <div class="ml-auto flex items-center gap-3">
            <lucide-icon name="mail" [size]="13" class="text-gray-500"></lucide-icon>
            <span class="text-gray-400">{{ state.user.name }}</span>
            <div class="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          </div>
        </div>

        <!-- ─── Notification area ─── -->
        <div *ngIf="showNotificationArea"
             class="flex items-stretch shrink-0" style="min-height: 88px; background: #e8e8e0;">
          <!-- Notification content (beige, limited to ~50% width) -->
          <div class="flex items-center" style="max-width: 50%;">
            <div class="flex items-center px-3 py-1.5 text-xs leading-tight h-full"
                 style="background-color: #f0ddb8; color: #4a3c28;">
              <span class="line-clamp-2">
                У кассы №2 для налоговой категории 'Основная 20' (ставка 20,00%) не задан регистр фискального регистратора
              </span>
            </div>
            <!-- Notification buttons -->
            <div class="flex items-center h-full" style="background-color: #f0ddb8;">
              <button class="pos-notification-btn relative flex items-center justify-center"
                      style="width: 44px; height: 44px;">
                <lucide-icon name="mail" [size]="20" class="text-gray-700"></lucide-icon>
                <span class="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[9px]
                             font-bold rounded-full w-4 h-4 flex items-center justify-center">5</span>
              </button>
              <button class="pos-notification-btn flex items-center justify-center"
                      style="width: 44px; height: 44px;">
                <lucide-icon name="x" [size]="20" class="text-gray-700"></lucide-icon>
              </button>
            </div>
          </div>
          <!-- Spacer + Lock icon (right side) -->
          <div class="flex-1"></div>
          <div class="flex items-center justify-center px-4 shrink-0">
            <lucide-icon name="lock" [size]="18" class="text-gray-400"></lucide-icon>
          </div>
        </div>

        <!-- ─── Content area (экраны) ─── -->
        <div class="flex-1 relative overflow-hidden">
          <!-- Экранный контент передаётся через ng-content -->
          <ng-content select="[posScreen]"></ng-content>

          <!-- Заглушка, когда экран не подключён -->
          <div *ngIf="showPlaceholder"
               class="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <lucide-icon name="monitor" [size]="48" class="mb-4 text-gray-600"></lucide-icon>
            <p class="text-base mb-1">Терминал Front</p>
            <p class="text-sm text-gray-600">Подключите компонент экрана через &lt;div posScreen&gt;</p>
          </div>
        </div>

        <!-- ─── Bottom navigation bar ─── -->
        <div *ngIf="showBottomBar"
             class="flex items-stretch shrink-0 border-t border-gray-700 select-none"
             [style.background-color]="colors.bottomBarBg"
             [style.height.px]="64">

          <!-- Левая группа: НАЗАД, ЗАКАЗЫ -->
          <button *ngFor="let btn of bottomButtonsLeft"
                  (click)="onBottomClick(btn.action)"
                  class="pos-bottom-btn flex flex-col items-center justify-center gap-0.5
                         text-white transition-colors px-5 min-w-[80px]">
            <lucide-icon [name]="btn.icon" [size]="20"></lucide-icon>
            <span class="text-[10px] font-medium tracking-wide uppercase">{{ btn.label }}</span>
          </button>

          <!-- Разделитель -->
          <div class="flex-1"></div>

          <!-- Правая группа: ДОПОЛНЕНИЯ, ИНСТРУМЕНТЫ, ВЫЙТИ, ВЫКЛЮЧИТЬ -->
          <button *ngFor="let btn of bottomButtonsRight"
                  (click)="onBottomClick(btn.action)"
                  class="pos-bottom-btn flex flex-col items-center justify-center gap-0.5
                         text-white transition-colors px-4 min-w-[80px]">
            <lucide-icon [name]="btn.icon" [size]="20"></lucide-icon>
            <span class="text-[10px] font-medium tracking-wide uppercase">{{ btn.label }}</span>
          </button>
        </div>

        <!-- ─── Overlay-слот для диалогов плагинов ─── -->
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
    .pos-bottom-btn:hover { background-color: #383838; }
    .pos-bottom-btn:active { background-color: #b8c959 !important; color: #1a1a1a !important; }
    .pos-notification-btn { cursor: pointer; transition: background-color 0.05s; }
    .pos-notification-btn:hover { background-color: #e0cfa5; }
    .pos-notification-btn:active { background-color: #b8c959 !important; }
  `],
})
export class PosTerminalShellComponent {
  /** Показывать заглушку, если экранный контент не передан */
  @Input() showPlaceholder = true;
  /** Текущий экран (для логики state-сервиса) */
  @Input() screen: PosScreenVariant = 'main';
  /** Показывать нижнюю панель навигации */
  @Input() showBottomBar = true;
  /** Показывать область уведомлений */
  @Input() showNotificationArea = true;

  /** Клик по кнопке нижней панели */
  @Output() bottomAction = new EventEmitter<string>();

  state = inject(PosTerminalStateService);
  colors = POS_COLORS;

  /** Левая группа кнопок нижней панели */
  bottomButtonsLeft: PosBottomButton[] = [
    { label: 'Назад', icon: 'chevron-left', action: 'back' },
    { label: 'Заказы', icon: 'layout-list', action: 'orders' },
  ];

  /** Правая группа кнопок нижней панели */
  bottomButtonsRight: PosBottomButton[] = [
    { label: 'Дополнения', icon: 'puzzle', action: 'extensions' },
    { label: 'Инструменты', icon: 'wrench', action: 'tools' },
    { label: 'Выйти', icon: 'monitor', action: 'exit' },
    { label: 'Выключить', icon: 'power', action: 'shutdown' },
  ];

  onBottomClick(action: string): void {
    this.bottomAction.emit(action);
  }
}
