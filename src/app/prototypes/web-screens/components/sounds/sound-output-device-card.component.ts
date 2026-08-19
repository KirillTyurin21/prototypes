import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { SoundOutputDevice, SoundEventHandler, DvArrivalsDisplay } from '../../types';
import { getHandlerDisplayName } from '../../data/mock-data';

/**
 * Карточка устройства вывода звука: выбор устройства/дисплея, чипы обработчиков, удаление.
 * Офлайн-дисплей: приглушён, предупреждение «звук не выводится», назначения сохраняются.
 */
@Component({
  selector: 'app-sound-output-device-card',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="sdc" [class.sdc--offline]="isOfflineDisplay">
      <div class="sdc-head">
        <span class="sdc-idx">{{ index + 1 }}</span>

        <div class="sdc-select">
          <select [ngModel]="selectValue" (ngModelChange)="onSelectChange($event)" [attr.aria-label]="'Устройство вывода ' + (index + 1)">
            <optgroup label="Физические устройства">
              <option *ngFor="let p of physicalOptions" [value]="p" [disabled]="usedPhysical.includes(p) && p !== device.audioDevice">
                {{ p }}
              </option>
            </optgroup>
            <optgroup label="Дисплеи Arrivals">
              <option
                *ngFor="let d of displayOptions"
                [value]="'display:' + d.id"
                [disabled]="usedDisplays.includes(d.id) && d.id !== device.displayId"
              >
                {{ d.name }} · {{ d.themeName }}{{ d.isOnline ? '' : ' (офлайн)' }}
              </option>
            </optgroup>
          </select>
          <span class="sdc-select-arrow">
            <lucide-icon name="chevron-down" [size]="14"></lucide-icon>
          </span>
        </div>

        <button type="button" class="sdc-del" (click)="remove.emit()" aria-label="Удалить устройство" title="Удалить устройство">
          <lucide-icon name="trash-2" [size]="15"></lucide-icon>
        </button>
      </div>

      <div class="sdc-meta" *ngIf="device.kind === 'arrivals-display'">
        <span class="sdc-status" [ngClass]="device.displayOnline ? 'sdc-status--online' : 'sdc-status--offline'">
          <span class="sdc-dot"></span>
          {{ device.displayOnline ? 'Онлайн' : 'Офлайн' }}
        </span>
        <span class="sdc-theme">Тема: {{ device.themeName }}</span>
      </div>

      <div class="sdc-warn" *ngIf="isOfflineDisplay">
        <lucide-icon name="alert-triangle" [size]="14"></lucide-icon>
        <span>Дисплей не запущен — звук выводиться не будет. Назначения сохранятся и заработают при запуске.</span>
      </div>

      <div class="sdc-body">
        <div class="sdc-label">Назначенные обработчики</div>
        <div class="sdc-chips">
          <span class="sdc-chip-empty" *ngIf="device.handlerIds.length === 0">Обработчики не назначены</span>
          <span class="sdc-chip" *ngFor="let hid of device.handlerIds">
            {{ handlerName(hid) }}
            <button type="button" class="sdc-chip-x" (click)="removeHandler.emit(hid)" [attr.aria-label]="'Убрать обработчик ' + handlerName(hid)">
              <lucide-icon name="x" [size]="11"></lucide-icon>
            </button>
          </span>
        </div>
        <button type="button" class="sdc-add" (click)="addHandler.emit()">
          <lucide-icon name="plus" [size]="14"></lucide-icon>
          Добавить обработчик
        </button>
      </div>
    </div>
  `,
  styles: [`
    .sdc {
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-primary);
      overflow: hidden;
      transition: box-shadow 0.15s ease, opacity 0.2s ease;
    }
    .sdc:focus-within { box-shadow: 0 0 0 2px var(--dt-brand-accent-lighter); }
    .sdc--offline { opacity: 0.78; }

    .sdc-head {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-bottom: 1px solid #d6d6d6;
      background: var(--dt-surface-variant);
    }
    .sdc-idx {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      border-radius: 4px;
      background: var(--dt-brand-accent-lighter);
      color: var(--dt-brand-accent-dark);
      font-size: 12px;
      font-weight: 700;
    }

    .sdc-select { position: relative; flex: 1; min-width: 0; }
    .sdc-select select {
      width: 100%;
      height: 32px;
      padding: 0 28px 0 10px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-primary);
      font-family: Roboto, sans-serif;
      font-size: 13px;
      color: var(--dt-text-primary);
      outline: none;
      appearance: none;
      cursor: pointer;
    }
    .sdc-select select:focus { border-color: var(--dt-brand-accent); }
    .sdc-select-arrow {
      position: absolute;
      right: 9px;
      top: 50%;
      transform: translateY(-50%);
      display: inline-flex;
      color: var(--dt-text-disable);
      pointer-events: none;
    }

    .sdc-del {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      flex-shrink: 0;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-primary);
      color: var(--dt-text-secondary);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .sdc-del:hover { border-color: var(--dt-brand-negative); background: var(--dt-brand-negative-lighter); color: var(--dt-brand-negative); }

    .sdc-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px 0;
      font-size: 12px;
    }
    .sdc-status { display: inline-flex; align-items: center; gap: 5px; font-weight: 500; }
    .sdc-dot { width: 7px; height: 7px; border-radius: 50%; }
    .sdc-status--online { color: var(--dt-brand-positive-dark); }
    .sdc-status--online .sdc-dot { background: var(--dt-brand-positive); }
    .sdc-status--offline { color: var(--dt-text-disable); }
    .sdc-status--offline .sdc-dot { background: var(--dt-text-disable); }
    .sdc-theme { color: var(--dt-text-secondary); }

    .sdc-warn {
      display: flex;
      align-items: flex-start;
      gap: 7px;
      margin: 8px 12px 0;
      padding: 8px 10px;
      border-radius: 4px;
      background: var(--dt-brand-warning-lighter);
      color: var(--dt-brand-warning-darker);
      font-size: 12px;
      line-height: 1.45;
    }
    .sdc-warn lucide-icon { flex-shrink: 0; margin-top: 1px; }

    .sdc-body { padding: 10px 12px 12px; }
    .sdc-label {
      margin-bottom: 7px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: var(--dt-text-secondary);
    }
    .sdc-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; min-height: 22px; }
    .sdc-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 7px 4px 10px;
      border-radius: 13px;
      background: var(--dt-brand-accent-lighter);
      color: var(--dt-brand-accent-dark);
      font-size: 12px;
      font-weight: 500;
      animation: sdc-pop 0.16s ease;
    }
    @keyframes sdc-pop {
      from { transform: scale(0.85); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .sdc-chip-empty { font-size: 12.5px; color: var(--dt-text-disable); padding: 3px 0; }
    .sdc-chip-x {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 15px;
      height: 15px;
      padding: 0;
      border: none;
      border-radius: 50%;
      background: var(--dt-brand-accent-light);
      color: var(--dt-brand-accent-dark);
      cursor: pointer;
      transition: all 0.12s ease;
    }
    .sdc-chip-x:hover { background: var(--dt-brand-accent); color: #fff; }

    .sdc-add {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 12px;
      border: 1px dashed #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-primary);
      color: var(--dt-brand-accent);
      font-family: Roboto, sans-serif;
      font-size: 12.5px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .sdc-add:hover { border-color: var(--dt-brand-accent); background: var(--dt-brand-accent-lightest); }
  `],
})
export class SoundOutputDeviceCardComponent {
  @Input() device!: SoundOutputDevice;
  @Input() index = 0;
  @Input() physicalOptions: string[] = [];
  @Input() displayOptions: DvArrivalsDisplay[] = [];
  @Input() usedPhysical: string[] = [];
  @Input() usedDisplays: string[] = [];
  @Input() handlers: SoundEventHandler[] = [];

  @Output() deviceChange = new EventEmitter<string>();
  @Output() remove = new EventEmitter<void>();
  @Output() addHandler = new EventEmitter<void>();
  @Output() removeHandler = new EventEmitter<number>();

  get selectValue(): string {
    if (this.device.kind === 'arrivals-display' && this.device.displayId) {
      return 'display:' + this.device.displayId;
    }
    return this.device.audioDevice || '';
  }

  get isOfflineDisplay(): boolean {
    return this.device.kind === 'arrivals-display' && this.device.displayOnline === false;
  }

  onSelectChange(value: string): void {
    this.deviceChange.emit(value);
  }

  handlerName(handlerId: number): string {
    const h = this.handlers.find(x => x.id === handlerId);
    return h ? getHandlerDisplayName(h.name) : '#' + handlerId;
  }
}
