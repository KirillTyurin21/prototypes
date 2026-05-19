import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PosTerminalStateService } from '../pos-terminal-state.service';
import { POS_COLORS } from '../types';

/**
 * Главный экран терминала Front.
 * 5-колоночная сетка с секциями: user, ГОСТИ, СЕРВИС, КАССА, ПЕРСОНАЛ, ДОКУМЕНТЫ.
 * Точная реплика по скриншоту main.png.
 *
 * Используется внутри pos-terminal-shell через <div posScreen>.
 */
@Component({
  selector: 'pos-main-screen',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pos-main-grid h-full w-full overflow-hidden"
         [style.background-color]="colors.terminalBg">

      <!-- 5-колоночная сетка -->
      <div class="grid h-full"
           style="grid-template-columns: 1fr 1.15fr 1.35fr 0.95fr 0.95fr;
                  grid-template-rows: auto repeat(7, 1fr);">

        <!-- ═══ ROW 1: Заголовки секций ═══ -->

        <!-- user header -->
        <div class="pos-section-header flex flex-col items-center justify-center px-2 py-3 text-center"
             [style.background-color]="colors.sectionTeal">
          <span class="font-bold text-white text-sm">user</span>
          <span class="text-white/80 text-[10px] mt-1">Смена открыта</span>
          <span class="text-white/80 text-[10px]">{{ state.shift.openedAt }}</span>
        </div>

        <!-- ГОСТИ header -->
        <div class="pos-section-header flex items-center justify-center px-2 py-3"
             [style.background-color]="colors.sectionTeal">
          <span class="font-bold text-white text-sm tracking-wider">ГОСТИ</span>
        </div>

        <!-- СЕРВИС header -->
        <div class="pos-section-header flex items-center justify-center px-2 py-3"
             [style.background-color]="colors.sectionTealLight">
          <span class="font-bold text-white text-sm tracking-wider">СЕРВИС</span>
        </div>

        <!-- КАССА header (spans 2 columns) -->
        <div class="pos-section-header flex flex-col items-center justify-center px-3 py-2 text-center"
             style="grid-column: span 2;"
             [style.background-color]="colors.sectionGreen">
          <span class="font-bold text-white text-sm tracking-wider mb-0.5">КАССА</span>
          <span class="text-white/90 text-[10px]">{{ state.shift.terminalName }}</span>
          <span class="text-white/90 text-[10px]">Смена №{{ state.shift.number }} открыта {{ state.shift.openedAt }}</span>
          <span class="text-white/90 text-[10px]">менеджер: {{ state.shift.manager }}</span>
          <span class="text-white/90 text-[10px]">кассир: {{ state.shift.cashier }}</span>
        </div>

        <!-- ═══ ROW 2 ═══ -->
        <button class="pos-cell" (click)="onCellClick('close-personal-shift')">Закрыть личную смену</button>
        <button class="pos-cell" (click)="onCellClick('banquets')">Банкеты и резервы</button>
        <button class="pos-cell" (click)="onCellClick('reports')">Отчеты</button>
        <button class="pos-cell" (click)="onCellClick('close-cash-shift')">Закрыть кассовую смену</button>
        <button class="pos-cell" (click)="onCellClick('deposit')">Внести деньги</button>

        <!-- ═══ ROW 3 ═══ -->
        <button class="pos-cell" (click)="onCellClick('personal-page')">Личная страница</button>
        <button class="pos-cell" (click)="onCellClick('delivery')">Доставка</button>
        <button class="pos-cell" (click)="onCellClick('stop-list')">Стоп-лист</button>
        <button class="pos-cell" (click)="onCellClick('withdraw')">Изъять деньги</button>
        <button class="pos-cell" (click)="onCellClick('closed-orders')">Закрытые заказы</button>

        <!-- ═══ ROW 4 ═══ -->
        <button class="pos-cell" (click)="onCellClick('messages')">Сообщения</button>
        <button class="pos-cell" (click)="onCellClick('guest-list')">Список гостей</button>
        <button class="pos-cell" (click)="onCellClick('barcodes')">Настройка и печать штрихкодов</button>
        <button class="pos-cell" (click)="onCellClick('open-orders')">Открытые заказы</button>
        <button class="pos-cell" (click)="onCellClick('x-report')">Печать Х-отчета</button>

        <!-- ═══ ROW 5 ═══ -->
        <div class="pos-cell-empty"></div>
        <!-- ПЕРСОНАЛ header -->
        <div class="pos-section-header flex items-center justify-center px-2 py-3"
             [style.background-color]="colors.sectionPurple">
          <span class="font-bold text-white text-sm tracking-wider">ПЕРСОНАЛ</span>
        </div>
        <button class="pos-cell" (click)="onCellClick('kitchen-screen')">Кухонный экран</button>
        <button class="pos-cell" (click)="onCellClick('open-cash-drawer')">Открыть денежный ящик</button>
        <button class="pos-cell" (click)="onCellClick('change-cashier')">Сменить кассира</button>

        <!-- ═══ ROW 6 ═══ -->
        <!-- ДОКУМЕНТЫ header -->
        <div class="pos-section-header flex items-center justify-center px-2 py-3"
             [style.background-color]="colors.sectionBlue">
          <span class="font-bold text-white text-sm tracking-wider">ДОКУМЕНТЫ</span>
        </div>
        <button class="pos-cell" (click)="onCellClick('edit-attendance')">Редактировать явки</button>
        <div class="pos-cell-empty"></div>
        <button class="pos-cell" (click)="onCellClick('correction-receipt')">Чек коррекции</button>
        <button class="pos-cell" (click)="onCellClick('refund')">Возврат товаров</button>

        <!-- ═══ ROW 7 ═══ -->
        <button class="pos-cell" (click)="onCellClick('new-document')">Новый документ</button>
        <button class="pos-cell" (click)="onCellClick('replacement-card')">Подменная карта</button>
        <div class="pos-cell-empty"></div>
        <div class="pos-cell-empty"></div>
        <div class="pos-cell-empty"></div>

        <!-- ═══ ROW 8 ═══ -->
        <button class="pos-cell" (click)="onCellClick('documents')">Документы</button>
        <div class="pos-cell-empty"></div>
        <div class="pos-cell-empty"></div>
        <div class="pos-cell-empty"></div>
        <div class="pos-cell-empty"></div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }

    .pos-main-grid .grid {
      border: 1px solid #5a5a4a;
    }

    .pos-section-header {
      border: 1px solid rgba(255,255,255,0.15);
      min-height: 0;
    }

    .pos-cell {
      background: #FFFFFF;
      color: #333;
      border: 1px solid #c8c8c0;
      font-size: 13px;
      font-weight: 500;
      text-align: center;
      padding: 4px 6px;
      cursor: pointer;
      transition: background-color 0.05s;
      min-height: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1.2;
    }

    .pos-cell:hover {
      background-color: #f5f5f0;
    }

    .pos-cell:active {
      background-color: #b8c959 !important;
      color: #1a1a1a;
    }

    .pos-cell-empty {
      background: transparent;
      border: 1px solid rgba(90, 90, 74, 0.3);
      min-height: 0;
    }
  `],
})
export class PosMainScreenComponent {
  state = inject(PosTerminalStateService);
  colors = POS_COLORS;

  onCellClick(action: string): void {
    // Кнопки главного экрана — заглушки для прототипа.
    // В будущих этапах: переход на соответствующие экраны.
    console.log('[POS Main Screen]', action);
  }
}
