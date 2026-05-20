import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { SIMULATION_SCENARIOS, SimulationScenario } from './simulation-scenarios';

/**
 * Панель симуляций — горизонтальная полоса инструментов для аналитика.
 *
 * Расположена между top-bar и терминалом. Управляет состоянием терминала:
 * выбор экрана, контекст (стол, гости, сумма), триггер плагина, готовые сценарии.
 *
 * Можно свернуть одной кнопкой (при показе заказчику).
 *
 * @example
 * <simulation-toolbar
 *   [currentScreen]="currentScreen"
 *   (screenChange)="onScreenChange($event)"
 *   (triggerPlugin)="showPlugin = true"
 *   (resetTerminal)="onReset()">
 * </simulation-toolbar>
 */
@Component({
  selector: 'simulation-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <!-- Toggle button (always visible) -->
    <button (click)="collapsed = !collapsed"
            class="flex items-center gap-1.5 px-3 py-1 text-xs font-medium
                   bg-indigo-50 text-indigo-700 hover:bg-indigo-100
                   border-b border-indigo-200 w-full transition-colors select-none"
            [class.border-b-0]="collapsed">
      <lucide-icon [name]="collapsed ? 'chevron-down' : 'chevron-up'" [size]="14"></lucide-icon>
      <span>Панель симуляций</span>
      <span class="text-indigo-400 ml-1">{{ collapsed ? '(свёрнута)' : '' }}</span>
    </button>

    <!-- Toolbar content -->
    <div *ngIf="!collapsed"
         class="flex flex-wrap items-center gap-3 px-3 py-2 bg-indigo-50/80
                border-b border-indigo-200 select-none">

      <!-- Scenario selector -->
      <div class="flex items-center gap-1.5">
        <label class="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">Сценарий</label>
        <select [ngModel]="selectedScenarioId"
                (ngModelChange)="onScenarioChange($event)"
                class="sim-select text-xs px-2 py-1 rounded border border-indigo-200 bg-white
                       text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400">
          <option value="">(вручную)</option>
          <option *ngFor="let s of scenarios" [value]="s.id">{{ s.label }}</option>
        </select>
      </div>

      <!-- Divider -->
      <div class="w-px h-6 bg-indigo-200"></div>

      <!-- Screen selector -->
      <div class="flex items-center gap-1.5">
        <label class="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">Экран</label>
        <select [ngModel]="currentScreen"
                (ngModelChange)="onScreenSelect($event)"
                class="sim-select text-xs px-2 py-1 rounded border border-indigo-200 bg-white
                       text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400">
          <option value="main">Главный</option>
          <option value="tables">Столы</option>
          <option value="delivery-list">Заказы (список)</option>
          <option value="order">Заказ</option>
          <option value="payment">Касса (оплата)</option>
        </select>
      </div>

      <!-- Divider -->
      <div class="w-px h-6 bg-indigo-200"></div>

      <!-- Context: Table & Guests -->
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1">
          <label class="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">Стол</label>
          <input type="number"
                 [ngModel]="tableNumber"
                 (ngModelChange)="onTableChange($event)"
                 min="0" max="99"
                 class="w-12 text-xs px-1.5 py-1 rounded border border-indigo-200 bg-white
                        text-gray-700 text-center focus:outline-none focus:ring-1 focus:ring-indigo-400">
        </div>
        <div class="flex items-center gap-1">
          <label class="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">Гости</label>
          <input type="number"
                 [ngModel]="guests"
                 (ngModelChange)="onGuestsChange($event)"
                 min="0" max="20"
                 class="w-12 text-xs px-1.5 py-1 rounded border border-indigo-200 bg-white
                        text-gray-700 text-center focus:outline-none focus:ring-1 focus:ring-indigo-400">
        </div>
      </div>

      <!-- Divider -->
      <div class="w-px h-6 bg-indigo-200"></div>

      <!-- Action buttons -->
      <div class="flex items-center gap-1.5">
        <button (click)="triggerPlugin.emit()"
                class="sim-btn flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded
                       bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
          <lucide-icon name="puzzle" [size]="12"></lucide-icon>
          Открыть плагин
        </button>

        <button (click)="simulateEvent.emit('new-order')"
                class="sim-btn flex items-center gap-1 px-2 py-1 text-xs font-medium rounded
                       bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
          <lucide-icon name="plus" [size]="12"></lucide-icon>
          Новый заказ
        </button>

        <button (click)="simulateEvent.emit('error')"
                class="sim-btn flex items-center gap-1 px-2 py-1 text-xs font-medium rounded
                       bg-red-600 text-white hover:bg-red-700 transition-colors">
          <lucide-icon name="alert-circle" [size]="12"></lucide-icon>
          Ошибка
        </button>

        <button (click)="simulateEvent.emit('loading')"
                class="sim-btn flex items-center gap-1 px-2 py-1 text-xs font-medium rounded
                       bg-amber-600 text-white hover:bg-amber-700 transition-colors">
          <lucide-icon name="loader-2" [size]="12"></lucide-icon>
          Загрузка
        </button>
      </div>

      <!-- Spacer -->
      <div class="flex-1"></div>

      <!-- Reset button -->
      <button (click)="resetTerminal.emit()"
              class="sim-btn flex items-center gap-1 px-2 py-1 text-xs font-medium rounded
                     border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors">
        <lucide-icon name="rotate-ccw" [size]="12"></lucide-icon>
        Сброс
      </button>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .sim-select { cursor: pointer; }
    .sim-btn { cursor: pointer; white-space: nowrap; }
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    input[type="number"] { -moz-appearance: textfield; }
  `],
})
export class SimulationToolbarComponent {
  /** Текущий выбранный экран */
  @Input() currentScreen = 'main';
  /** Номер стола */
  @Input() tableNumber = 0;
  /** Количество гостей */
  @Input() guests = 0;

  /** Смена экрана */
  @Output() screenChange = new EventEmitter<string>();
  /** Смена стола */
  @Output() tableNumberChange = new EventEmitter<number>();
  /** Смена количества гостей */
  @Output() guestsChange = new EventEmitter<number>();
  /** Триггер плагина */
  @Output() triggerPlugin = new EventEmitter<void>();
  /** Симуляция события */
  @Output() simulateEvent = new EventEmitter<string>();
  /** Сброс терминала */
  @Output() resetTerminal = new EventEmitter<void>();
  /** Применение сценария */
  @Output() applyScenario = new EventEmitter<SimulationScenario>();

  collapsed = false;
  scenarios = SIMULATION_SCENARIOS;
  selectedScenarioId = '';

  onScenarioChange(id: string): void {
    this.selectedScenarioId = id;
    const scenario = this.scenarios.find(s => s.id === id);
    if (scenario) {
      this.applyScenario.emit(scenario);
    }
  }

  onScreenSelect(screen: string): void {
    this.selectedScenarioId = '';
    this.screenChange.emit(screen);
  }

  onTableChange(value: number): void {
    this.tableNumberChange.emit(value);
  }

  onGuestsChange(value: number): void {
    this.guestsChange.emit(value);
  }
}
