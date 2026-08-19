import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { SoundTerminalV2, SoundOutputDevice, SoundEventHandler, DvArrivalsDisplay } from '../../types';
import { SoundOutputDeviceCardComponent } from './sound-output-device-card.component';
import { HandlerPickerModalComponent } from './handler-picker-modal.component';

/**
 * Постоянная правая панель настроек терминала (split-view, как в Яндекс.Пэй).
 * Управляет черновиком устройств вывода и обработчиков.
 */
@Component({
  selector: 'app-terminal-settings-panel',
  standalone: true,
  imports: [CommonModule, IconsModule, SoundOutputDeviceCardComponent, HandlerPickerModalComponent],
  template: `
    <!-- Ничего не выбрано -->
    <div class="tsp-placeholder" *ngIf="!draft">
      <lucide-icon name="monitor" [size]="40"></lucide-icon>
      <h3>Выберите терминал в дереве слева</h3>
      <p>Панель покажет устройства вывода звука и назначенные обработчики выбранного терминала.</p>
    </div>

    <!-- Панель настроек -->
    <div class="tsp-panel" *ngIf="draft">
      <div class="tsp-head">
        <span class="tsp-head-icon"><lucide-icon name="monitor" [size]="18"></lucide-icon></span>
        <div class="tsp-head-main">
          <h3 class="tsp-name">{{ draft.name }}</h3>
          <span class="tsp-activity">Последняя активность: {{ draft.lastActivity }}</span>
        </div>
      </div>

      <div class="tsp-section">
        <div class="tsp-section-title">
          <span class="tsp-section-icon"><lucide-icon name="volume-2" [size]="16"></lucide-icon></span>
          <span>Устройства вывода звука</span>
          <button type="button" class="tsp-refresh" (click)="refreshDisplays.emit()" [class.tsp-refresh--busy]="displaysLoading">
            <lucide-icon [name]="displaysLoading ? 'loader-2' : 'refresh-cw'" [size]="14" [class.tsp-spin]="displaysLoading"></lucide-icon>
            Обновить дисплеи
          </button>
        </div>

        <div class="tsp-error" *ngIf="displaysError && !displaysLoading">
          <lucide-icon name="alert-triangle" [size]="15"></lucide-icon>
          <span>Не удалось загрузить список дисплеев. Модуль Arrivals офлайн — нажмите «Обновить дисплеи» для повторной попытки.</span>
        </div>

        <div class="tsp-devices">
          <div class="tsp-empty" *ngIf="draft.devices.length === 0">
            <lucide-icon name="volume-2" [size]="26"></lucide-icon>
            <span>Устройства не добавлены. Нажмите «Добавить устройство», чтобы выбрать устройство и привязать к нему обработчики.</span>
          </div>

          <app-sound-output-device-card
            *ngFor="let d of draft.devices; let i = index"
            [device]="d"
            [index]="i"
            [physicalOptions]="physicalOptions"
            [displayOptions]="displayOptions"
            [usedPhysical]="usedPhysical"
            [usedDisplays]="usedDisplays"
            [handlers]="handlers"
            (deviceChange)="onDeviceChange(d, $event)"
            (remove)="onRemoveDevice(d)"
            (addHandler)="openPicker(d)"
            (removeHandler)="onRemoveHandler(d, $event)"
          ></app-sound-output-device-card>
        </div>

        <button type="button" class="tsp-add-device" (click)="onAddDevice()" [disabled]="!canAddDevice">
          <lucide-icon name="plus" [size]="15"></lucide-icon>
          Добавить устройство
        </button>
      </div>

      <div class="tsp-summary">
        <span class="tsp-summary-item">
          <lucide-icon name="volume-2" [size]="13"></lucide-icon>
          Устройств: <b>{{ draft.devices.length }}</b>
        </span>
        <span class="tsp-summary-sep">·</span>
        <span class="tsp-summary-item">Обработчиков задействовано: <b>{{ usedHandlerCount }} из {{ handlers.length }}</b></span>
        <span class="tsp-summary-sep">·</span>
        <span class="tsp-summary-item">Назначений: <b>{{ totalAssignments }}</b></span>
      </div>

      <div class="tsp-foot">
        <button type="button" class="tsp-btn tsp-btn--ghost" (click)="reset.emit()">Сбросить</button>
        <button type="button" class="tsp-btn tsp-btn--primary" (click)="onSave()">Сохранить</button>
      </div>
    </div>

    <!-- Пикер обработчиков -->
    <app-handler-picker-modal
      [open]="pickerOpen"
      title="Выбор обработчиков"
      [subtitle]="pickerSubtitle"
      [handlers]="handlers"
      [selectedIds]="pickerDevice ? pickerDevice.handlerIds : []"
      confirmLabel="Готово"
      (close)="closePicker()"
      (confirm)="onPickerConfirm($event)"
    ></app-handler-picker-modal>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .tsp-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      height: 100%;
      padding: 24px;
      text-align: center;
      color: var(--dt-text-disable);
      font-family: Roboto, sans-serif;
    }
    .tsp-placeholder h3 { margin: 0; font-size: 16px; font-weight: 500; color: var(--dt-text-secondary); }
    .tsp-placeholder p { margin: 0; max-width: 340px; font-size: 13px; line-height: 1.5; }

    .tsp-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 18px 20px 0;
      font-family: Roboto, sans-serif;
      overflow-y: auto;
      background: var(--dt-surface-primary);
    }

    .tsp-head {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 14px;
      border-bottom: 1px solid #d6d6d6;
    }
    .tsp-head-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      border-radius: 8px;
      background: var(--dt-brand-accent-lighter);
      color: var(--dt-brand-accent);
    }
    .tsp-head-main { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .tsp-name {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: var(--dt-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .tsp-activity { font-size: 12px; color: var(--dt-text-secondary); }

    .tsp-section { padding-top: 14px; flex: 1; min-height: 0; display: flex; flex-direction: column; }
    .tsp-section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 500;
      color: var(--dt-text-primary);
    }
    .tsp-section-icon { display: inline-flex; color: var(--dt-brand-accent); }
    .tsp-refresh {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin-left: auto;
      padding: 5px 10px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-primary);
      color: var(--dt-text-secondary);
      font-family: Roboto, sans-serif;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .tsp-refresh:hover { color: var(--dt-text-primary); background: #ebebeb; }
    .tsp-spin { animation: tsp-spin 0.8s linear infinite; }
    @keyframes tsp-spin { to { transform: rotate(360deg); } }

    .tsp-error {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 12px;
      padding: 9px 12px;
      border-radius: 4px;
      background: var(--dt-brand-warning-lighter);
      color: var(--dt-brand-warning-darker);
      font-size: 12.5px;
      line-height: 1.45;
    }
    .tsp-error lucide-icon { flex-shrink: 0; margin-top: 1px; }

    .tsp-devices { display: flex; flex-direction: column; gap: 12px; }
    .tsp-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 26px 16px;
      border: 1px dashed #d6d6d6;
      border-radius: 4px;
      color: var(--dt-text-disable);
      font-size: 12.5px;
      text-align: center;
      line-height: 1.5;
    }

    .tsp-add-device {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: 12px;
      padding: 10px;
      border: 1px dashed #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-primary);
      color: var(--dt-brand-accent);
      font-family: Roboto, sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .tsp-add-device:hover:not(:disabled) { border-color: var(--dt-brand-accent); background: var(--dt-brand-accent-lightest); }
    .tsp-add-device:disabled { opacity: 0.45; cursor: not-allowed; }

    .tsp-summary {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 14px;
      padding: 9px 12px;
      border-radius: 4px;
      background: var(--dt-surface-variant);
      font-size: 12px;
      color: var(--dt-text-secondary);
    }
    .tsp-summary-item { display: inline-flex; align-items: center; gap: 5px; }
    .tsp-summary-item b { color: var(--dt-text-primary); font-weight: 500; }
    .tsp-summary-sep { color: var(--dt-text-disable); }

    .tsp-foot {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      position: sticky;
      bottom: 0;
      margin-top: 14px;
      padding: 12px 0 16px;
      background: linear-gradient(transparent, var(--dt-surface-primary) 30%);
    }
    .tsp-btn {
      padding: 0 18px;
      height: 36px;
      border-radius: 4px;
      font-family: Roboto, sans-serif;
      font-size: 13.5px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .tsp-btn--ghost {
      border: 1px solid #d6d6d6;
      background: var(--dt-surface-primary);
      color: var(--dt-text-primary);
    }
    .tsp-btn--ghost:hover { background: #ebebeb; }
    .tsp-btn--primary {
      border: 1px solid transparent;
      background: var(--dt-brand-accent);
      color: #fff;
    }
    .tsp-btn--primary:hover { background: #3969d5; }
  `],
})
export class TerminalSettingsPanelComponent implements OnChanges {
  @Input() terminal: SoundTerminalV2 | null = null;
  @Input() handlers: SoundEventHandler[] = [];
  @Input() physicalOptions: string[] = [];
  @Input() displayOptions: DvArrivalsDisplay[] = [];
  @Input() displaysLoading = false;
  @Input() displaysError = false;

  @Output() save = new EventEmitter<SoundTerminalV2>();
  @Output() reset = new EventEmitter<void>();
  @Output() refreshDisplays = new EventEmitter<void>();
  @Output() changed = new EventEmitter<void>();

  draft: SoundTerminalV2 | null = null;
  pickerOpen = false;
  pickerDevice: SoundOutputDevice | null = null;
  private nextDeviceId = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['terminal']) {
      this.draft = this.terminal ? this.deepClone(this.terminal) : null;
      this.closePicker();
    }
  }

  get usedPhysical(): string[] {
    if (!this.draft) return [];
    return this.draft.devices
      .filter(d => d.kind === 'physical' && d.audioDevice)
      .map(d => d.audioDevice as string);
  }

  get usedDisplays(): string[] {
    if (!this.draft) return [];
    return this.draft.devices
      .filter(d => d.kind === 'arrivals-display' && d.displayId)
      .map(d => d.displayId as string);
  }

  get usedHandlerCount(): number {
    if (!this.draft) return 0;
    return new Set(this.draft.devices.flatMap(d => d.handlerIds)).size;
  }

  get totalAssignments(): number {
    if (!this.draft) return 0;
    return this.draft.devices.reduce((s, d) => s + d.handlerIds.length, 0);
  }

  get canAddDevice(): boolean {
    const freePhysical = this.physicalOptions.some(p => !this.usedPhysical.includes(p));
    const freeDisplay = this.displayOptions.some(d => !this.usedDisplays.includes(d.id));
    return freePhysical || freeDisplay;
  }

  get pickerSubtitle(): string {
    if (!this.draft || !this.pickerDevice) return '';
    const label =
      this.pickerDevice.kind === 'arrivals-display' && this.pickerDevice.displayName
        ? this.pickerDevice.displayName
        : this.pickerDevice.audioDevice || 'Устройство';
    return `${this.draft.name} → ${label}`;
  }

  onDeviceChange(device: SoundOutputDevice, value: string): void {
    if (value.startsWith('display:')) {
      const display = this.displayOptions.find(d => d.id === value.slice('display:'.length));
      if (!display) return;
      device.kind = 'arrivals-display';
      device.displayId = display.id;
      device.displayName = display.name;
      device.displayOnline = display.isOnline;
      device.themeName = display.themeName;
      device.audioDevice = undefined;
    } else {
      device.kind = 'physical';
      device.audioDevice = value;
      device.displayId = undefined;
      device.displayName = undefined;
      device.displayOnline = undefined;
      device.themeName = undefined;
    }
    this.changed.emit();
  }

  onRemoveDevice(device: SoundOutputDevice): void {
    if (!this.draft) return;
    this.draft.devices = this.draft.devices.filter(d => d !== device);
    if (this.pickerDevice === device) this.closePicker();
    this.changed.emit();
  }

  onAddDevice(): void {
    if (!this.draft) return;
    const freePhysical = this.physicalOptions.find(p => !this.usedPhysical.includes(p));
    if (freePhysical) {
      this.draft.devices.push({
        id: 'new-' + ++this.nextDeviceId,
        kind: 'physical',
        audioDevice: freePhysical,
        handlerIds: [],
      });
    } else {
      const freeDisplay = this.displayOptions.find(d => !this.usedDisplays.includes(d.id));
      if (!freeDisplay) return;
      this.draft.devices.push({
        id: 'new-' + ++this.nextDeviceId,
        kind: 'arrivals-display',
        displayId: freeDisplay.id,
        displayName: freeDisplay.name,
        displayOnline: freeDisplay.isOnline,
        themeName: freeDisplay.themeName,
        handlerIds: [],
      });
    }
    this.changed.emit();
  }

  openPicker(device: SoundOutputDevice): void {
    this.pickerDevice = device;
    this.pickerOpen = true;
  }

  closePicker(): void {
    this.pickerOpen = false;
    this.pickerDevice = null;
  }

  onPickerConfirm(ids: number[]): void {
    if (this.pickerDevice) {
      this.pickerDevice.handlerIds = [...ids];
      this.changed.emit();
    }
    this.closePicker();
  }

  onRemoveHandler(device: SoundOutputDevice, handlerId: number): void {
    device.handlerIds = device.handlerIds.filter(id => id !== handlerId);
    this.changed.emit();
  }

  onSave(): void {
    if (this.draft) {
      this.save.emit(this.deepClone(this.draft));
    }
  }

  private deepClone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}
