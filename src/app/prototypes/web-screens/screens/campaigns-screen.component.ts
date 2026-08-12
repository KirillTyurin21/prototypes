import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { CampaignsDataService } from '../campaigns-data.service';
import { CampaignFolder, formatDate } from '../data/campaigns.data';

type RowKind = 'up' | 'folder' | 'campaign';

interface CampaignRow {
  kind: RowKind;
  id: number;
  name: string;
  period: string;
  time: string;
  resolutions: string;
}

@Component({
  selector: 'app-campaigns-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="web-page">
      <!-- Toast -->
      <div *ngIf="toast" class="web-toast">{{ toast }}</div>

      <!-- Шапка страницы -->
      <header class="page-header">
        <div class="page-title">Кампании</div>
        <div class="header-actions">
          <button class="web-btn web-btn-primary" (click)="openCreateFolder()">
            <lucide-icon name="folder-plus" [size]="18"></lucide-icon>
            <span>Создать папку</span>
          </button>
          <button class="web-btn web-btn-primary" (click)="onAdd()">
            <lucide-icon name="file-plus-2" [size]="18"></lucide-icon>
            <span>Добавить</span>
          </button>
          <button class="web-btn web-btn-info" (click)="infoOpen = true" aria-label="Информация">
            <lucide-icon name="info" [size]="16"></lucide-icon>
          </button>
        </div>
      </header>

      <!-- Таблица -->
      <main class="table-wrap">
        <table class="web-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Период действия</th>
              <th>Время действия</th>
              <th>Разрешение</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let row of rows; trackBy: trackRow"
              class="web-row-hover"
            >
              <!-- Название -->
              <td>
                <ng-container *ngIf="row.kind === 'up'">
                  <button class="name-link" (click)="goUp()">
                    <lucide-icon name="folder" [size]="20" class="folder-icon"></lucide-icon>
                    <span>..</span>
                  </button>
                </ng-container>
                <ng-container *ngIf="row.kind === 'folder'">
                  <button class="name-link" (click)="openFolder(row.id)">
                    <lucide-icon name="folder" [size]="20" class="folder-icon"></lucide-icon>
                    <span>{{ row.name }}</span>
                  </button>
                </ng-container>
                <ng-container *ngIf="row.kind === 'campaign'">
                  <span class="name-link" (click)="openCampaign(row.id)">{{ row.name }}</span>
                </ng-container>
              </td>
              <td>{{ row.period }}</td>
              <td>{{ row.time }}</td>
              <td>{{ row.resolutions }}</td>
              <td>
                <div class="row-actions" *ngIf="row.kind !== 'up'">
                  <button class="icon-btn" (click)="onEdit(row)" aria-label="Редактировать">
                    <lucide-icon name="pencil" [size]="24"></lucide-icon>
                  </button>
                  <button class="icon-btn" (click)="onDelete(row)" aria-label="Удалить">
                    <lucide-icon name="trash-2" [size]="24"></lucide-icon>
                  </button>
                  <button class="icon-btn" (click)="onMove(row)" aria-label="Переместить">
                    <lucide-icon name="signpost" [size]="24"></lucide-icon>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </main>

      <!-- ─── Диалог подтверждения ─── -->
      <div class="web-overlay" *ngIf="confirmOpen" (click)="confirmOpen = false">
        <div class="web-dialog web-dialog-sm" (click)="$event.stopPropagation()">
          <div class="web-dialog-title">{{ confirmTitle }}</div>
          <div class="web-dialog-text">{{ confirmText }}</div>
          <div class="web-dialog-actions">
            <button class="web-btn web-btn-outline" (click)="confirmOpen = false">Отмена</button>
            <button class="web-btn web-btn-primary" (click)="confirmYes()">Да</button>
          </div>
        </div>
      </div>

      <!-- ─── Диалог перемещения ─── -->
      <div class="web-overlay" *ngIf="moveOpen" (click)="moveOpen = false">
        <div class="web-dialog web-dialog-move" (click)="$event.stopPropagation()">
          <div class="move-header">
            <div class="move-title">Переместить элемент: {{ moveItemName }}</div>
            <button class="move-close" (click)="moveOpen = false" aria-label="Закрыть">
              <lucide-icon name="x" [size]="16"></lucide-icon>
            </button>
          </div>
          <div class="move-body">
            <button
              *ngIf="moveBrowseFolderId !== null"
              class="move-row"
              (click)="moveBrowseUp()"
            >
              <lucide-icon name="folder" [size]="20" class="move-folder-icon"></lucide-icon>
              <span class="move-row-name">..</span>
            </button>
            <button
              class="move-row"
              *ngIf="moveBrowseFolderId === null"
              [class.move-row-selected]="moveSelectedId === null"
              (click)="selectMoveTarget(null)"
            >
              <lucide-icon name="folder" [size]="20" class="move-folder-icon"></lucide-icon>
              <span class="move-row-name">Корневая папка</span>
            </button>
            <button
              *ngFor="let f of moveFolders"
              class="move-row"
              [class.move-row-selected]="moveSelectedId === f.id"
              (click)="selectMoveTarget(f.id)"
            >
              <lucide-icon name="folder" [size]="20" class="move-folder-icon"></lucide-icon>
              <span class="move-row-name">{{ f.name }}</span>
              <span class="move-row-spacer"></span>
              <lucide-icon
                *ngIf="hasChildFolders(f.id)"
                name="chevron-right"
                [size]="18"
                class="move-chevron move-chevron-btn"
                (click)="moveBrowseInto(f.id, $event)"
              ></lucide-icon>
            </button>
          </div>
          <div class="move-footer">
            <button
              class="web-btn"
              [ngClass]="moveSelectedId === moveCurrentFolderOfItem ? 'web-btn-disabled' : 'web-btn-primary'"
              [disabled]="moveSelectedId === moveCurrentFolderOfItem"
              (click)="confirmMove()"
            >Переместить сюда</button>
          </div>
        </div>
      </div>

      <!-- ─── Панель создания/переименования папки ─── -->
      <div class="web-overlay" *ngIf="folderPanelOpen" (click)="folderPanelOpen = false">
        <div class="web-end-panel web-end-panel-sm" (click)="$event.stopPropagation()">
          <div class="end-panel-header">
            <div class="end-panel-title">Новая папка</div>
            <button class="end-panel-close" (click)="folderPanelOpen = false" aria-label="Закрыть">
              <lucide-icon name="x" [size]="24"></lucide-icon>
            </button>
          </div>
          <div class="end-panel-body">
            <div class="mdc-field" [class.mdc-field-error]="folderError">
              <label class="mdc-label" [class.mdc-label-float]="folderName">Название папки</label>
              <input
                type="text"
                class="mdc-input"
                placeholder="Введите название"
                [(ngModel)]="folderName"
                (input)="folderError = ''"
              />
              <div class="mdc-error" *ngIf="folderError">{{ folderError }}</div>
            </div>
          </div>
          <footer class="end-panel-footer">
            <button class="web-btn web-btn-white" (click)="saveFolder()">
              {{ folderPanelMode === 'create' ? 'Создать' : 'Сохранить' }}
            </button>
          </footer>
        </div>
      </div>

      <!-- ─── Панель справки ─── -->
      <div class="web-overlay" *ngIf="infoOpen" (click)="infoOpen = false">
        <div class="web-end-panel web-end-panel-lg" (click)="$event.stopPropagation()">
          <div class="end-panel-header">
            <div class="end-panel-title">Рекламные кампании</div>
            <button class="end-panel-close" (click)="infoOpen = false" aria-label="Закрыть">
              <lucide-icon name="x" [size]="24"></lucide-icon>
            </button>
          </div>
          <div class="end-panel-body">
            <p class="help-p">
              Вы можете создать рекламные материалы для отображения на экранах покупателя и Arrivals.
            </p>
            <p class="help-where">Где настроить: <b>Экраны и звуки → Кампании</b></p>
            <ol class="help-ol">
              <li>Чтобы создать новую рекламную кампанию нажмите <b>Добавить</b>.</li>
              <li>
                Заполните название, выберите период и время действия, а также дни недели, в которые будет
                показываться кампания и разрешение изображений.
                <div class="help-important">
                  <lucide-icon name="alert-circle" [size]="18"></lucide-icon>
                  <span>
                    Размеры готового ролика или изображения не должны быть меньше или больше экрана.
                    Если у вас несколько экранов с разным разрешением, то подготовьте материалы специально
                    для каждого экрана.
                  </span>
                </div>
              </li>
              <li>Нажмите <b>Создать</b>, чтобы появилось поле для добавления изображения или видеофайла.</li>
              <li>
                Выберите, в каком режиме экрана будет показываться кампания:
                <b>Экран заказа</b>, <b>Экран оплаты</b>, <b>Экран завершения</b>, <b>Режим ожидания</b>.
              </li>
              <li>
                Нажмите <b>+ Добавить изображение или видео</b>. Справа откроется меню <b>Галерея</b>.
                Выберите изображение или видео из тех, что предложены в списке или загрузите с устройства.
              </li>
              <li>
                Появится блок предпросмотра, в котором нужно установить длительность показа изображения
                или видео. Можно добавить несколько картинок или видеороликов, которые будут сменять
                друг друга через заданное время.
              </li>
              <li>Сохраните настройки.</li>
            </ol>
            <p class="help-p">
              Информация о кампании появится в разделе. Созданную кампанию можно отредактировать,
              удалить или переместить в папку.
            </p>
            <p class="help-faq-title">Частые вопросы</p>
            <p class="help-p">
              <b>В:</b> Если периоды действия двух рекламных кампаний пересекаются, какой именно контент
              отображается на экранах?
            </p>
            <p class="help-p">
              <b>О:</b> Допустим, есть основная рекламная кампания, которая действует 2 года, а также
              проводится временная кампания к новому году. В этом случае в период действия новогодней
              рекламы на экранах будет отображаться контент обеих кампаний по очереди. Точно так же
              реклама, которая действует только во время бизнес-ланча с 11-00 до 14-00, дополняет
              основной контент.
            </p>
          </div>
          <footer class="end-panel-footer">
            <button class="web-btn web-btn-primary" (click)="infoOpen = false">Закрыть</button>
          </footer>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* ─── Общие кнопки Web ─── */
    .web-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      height: 36px;
      padding: 0 16px;
      border: none;
      border-radius: 4px;
      font-family: Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      text-transform: uppercase;
      cursor: pointer;
      white-space: nowrap;
      transition: box-shadow 0.2s;
    }
    .web-btn-primary {
      background-color: #448aff;
      color: #ffffff;
      box-shadow: rgba(158, 158, 158, 0.14) 0 2px 2px 0, rgba(158, 158, 158, 0.12) 0 3px 1px -2px, rgba(158, 158, 158, 0.2) 0 1px 5px 0;
    }
    .web-btn-primary:hover { background-color: #3b7cf0; }
    .web-btn-outline {
      background-color: #ffffff;
      color: #212121;
      border: 1px solid #e0e0e0;
      text-transform: none;
      padding: 0 12px;
    }
    .web-btn-outline:hover { background-color: #f5f5f5; }
    .web-btn-white {
      background-color: #ffffff;
      color: rgba(0, 0, 0, 0.87);
      box-shadow: rgba(158, 158, 158, 0.14) 0 2px 2px 0, rgba(158, 158, 158, 0.12) 0 3px 1px -2px;
    }
    .web-btn-white:hover { background-color: #fafafa; }
    .web-btn-disabled {
      background-color: #eeeeee;
      color: rgba(0, 0, 0, 0.33);
      box-shadow: none;
      cursor: default;
    }
    .web-btn-info {
      width: 36px;
      height: 36px;
      padding: 10px;
      background-color: #448aff;
      color: #ffffff;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: rgb(235, 235, 235) 0 0.5px 2px 0, rgb(224, 224, 224) 0 1px 1px 0;
    }
    .web-btn-info:hover { background-color: #3b7cf0; }

    /* ─── Toast ─── */
    .web-toast {
      position: fixed;
      left: 50%;
      bottom: 24px;
      transform: translateX(-50%);
      background-color: #323232;
      color: #ffffff;
      font-size: 14px;
      padding: 14px 16px;
      border-radius: 4px;
      z-index: 3000;
      box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14);
      animation: fadeIn 0.2s ease-out;
    }

    /* ─── Шапка страницы ─── */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 36px;
      margin-bottom: 20px;
    }
    .page-title {
      font-size: 24px;
      font-weight: 500;
      color: #212121;
      line-height: 1.2;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ─── Таблица ─── */
    .table-wrap {
      background: #ffffff;
      border-radius: 4px;
      overflow: auto;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    }
    .web-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
      font-family: Roboto, sans-serif;
    }
    .web-table th {
      background-color: #f0f6ff;
      color: #212121;
      font-weight: 400;
      text-align: left;
      height: 48px;
      padding: 14px 16px;
      white-space: nowrap;
    }
    .web-table td {
      color: rgba(0, 0, 0, 0.87);
      height: 63px;
      padding: 13px 16px;
      white-space: nowrap;
      border: none;
    }
    .web-table tbody tr.web-row-hover:hover {
      background-color: #f5f5f5;
    }
    .move-chevron-btn { cursor: pointer; border-radius: 4px; }
    .move-chevron-btn:hover { color: #212121; background-color: rgba(0, 0, 0, 0.08); }
    .name-link {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: none;
      border: none;
      padding: 0;
      font-family: Roboto, sans-serif;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.87);
      cursor: pointer;
      text-align: left;
    }
    .name-link:hover { text-decoration: underline; }
    .folder-icon { color: #757575; flex-shrink: 0; }
    .row-actions { display: flex; align-items: center; }
    .icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      padding: 6px;
      border: none;
      background: none;
      border-radius: 50%;
      color: rgba(0, 0, 0, 0.87);
      cursor: pointer;
    }
    .icon-btn:hover { background-color: rgba(0, 0, 0, 0.04); }

    /* ─── Overlay и диалоги ─── */
    .web-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.32);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .web-dialog {
      background: #ffffff;
      border-radius: 4px;
      box-shadow: 0 11px 15px -7px rgba(0, 0, 0, 0.2), 0 24px 38px 3px rgba(0, 0, 0, 0.14), 0 9px 46px 8px rgba(0, 0, 0, 0.12);
      display: flex;
      flex-direction: column;
      animation: fadeIn 0.15s ease-out;
    }
    .web-dialog-sm { width: 280px; }
    .web-dialog-title {
      font-size: 20px;
      font-weight: 500;
      color: #212121;
      padding: 24px 24px 8px;
    }
    .web-dialog-text {
      font-size: 16px;
      color: #616161;
      padding: 0 24px;
    }
    .web-dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 24px;
    }

    /* ─── Диалог перемещения ─── */
    .web-dialog-move { width: 550px; }
    .move-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
      padding: 0 16px;
      background-color: #c5c6cb;
      flex-shrink: 0;
    }
    .move-title {
      color: #ffffff;
      font-size: 16px;
      font-weight: 400;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .move-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: none;
      color: #ffffff;
      cursor: pointer;
      flex-shrink: 0;
    }
    .move-body {
      padding: 16px;
      overflow-y: auto;
      max-height: 300px;
      display: flex;
      flex-direction: column;
    }
    .move-row {
      display: flex;
      align-items: center;
      gap: 12px;
      height: 24px;
      padding: 0 8px;
      margin: 2px 0;
      border: none;
      background: none;
      font-family: Roboto, sans-serif;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.87);
      cursor: pointer;
      text-align: left;
      border-radius: 4px;
    }
    .move-row:hover { background-color: rgba(0, 0, 0, 0.04); }
    .move-row-selected { background-color: rgba(68, 138, 255, 0.12); }
    .move-row-selected:hover { background-color: rgba(68, 138, 255, 0.12); }
    .move-folder-icon { color: #757575; flex-shrink: 0; }
    .move-row-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .move-row-spacer { flex: 1; }
    .move-chevron { color: #757575; }
    .move-footer {
      display: flex;
      justify-content: flex-end;
      padding: 16px;
      border-top: 1px solid #f0f0f0;
    }

    /* ─── Боковая панель (end panel) ─── */
    .web-end-panel {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      background: #ffffff;
      box-shadow: rgba(158, 158, 158, 0.14) 0 8px 10px 1px, rgba(158, 158, 158, 0.12) 0 3px 14px 2px;
      display: flex;
      flex-direction: column;
      animation: slideIn 0.18s ease-out;
    }
    .web-end-panel-sm { width: 400px; }
    .web-end-panel-lg { width: 560px; }
    .end-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 24px 0;
      flex-shrink: 0;
    }
    .end-panel-title {
      font-size: 24px;
      font-weight: 500;
      color: #212121;
      line-height: 1.2;
    }
    .end-panel-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: none;
      color: #757575;
      cursor: pointer;
    }
    .end-panel-body {
      flex: 1;
      padding: 16px 24px;
      overflow-y: auto;
    }
    .end-panel-footer {
      height: 84px;
      padding: 24px;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      flex-shrink: 0;
    }

    /* ─── Поле ввода (Material outlined) ─── */
    .mdc-field { position: relative; width: 100%; padding-top: 12px; }
    .mdc-label {
      position: absolute;
      top: 22px;
      left: 12px;
      background: #ffffff;
      padding: 0 4px;
      font-size: 16px;
      color: rgba(0, 0, 0, 0.6);
      pointer-events: none;
      transition: all 0.15s ease-out;
      z-index: 1;
    }
    .mdc-label-float {
      top: 8px;
      font-size: 12px;
    }
    .mdc-input {
      width: 100%;
      height: 56px;
      padding: 0 16px;
      border: 1px solid rgba(0, 0, 0, 0.38);
      border-radius: 4px;
      font-family: Roboto, sans-serif;
      font-size: 16px;
      color: rgba(0, 0, 0, 0.87);
      background: #ffffff;
      outline: none;
      transition: border-color 0.15s;
      box-sizing: border-box;
    }
    .mdc-input:hover { border-color: rgba(0, 0, 0, 0.87); }
    .mdc-input:focus { border: 2px solid #448aff; padding: 0 15px; }
    .mdc-field-error .mdc-input { border-color: #ff5252; }
    .mdc-field-error .mdc-label { color: #ff5252; }
    .mdc-error {
      font-size: 12px;
      color: #ff5252;
      padding: 4px 12px 0;
    }

    /* ─── Справка ─── */
    .help-p {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.87);
      line-height: 1.5;
      margin: 0 0 12px;
    }
    .help-where { font-size: 14px; margin: 0 0 12px; }
    .help-ol {
      margin: 0 0 12px;
      padding-left: 40px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.87);
      line-height: 1.5;
    }
    .help-ol li { margin-bottom: 8px; }
    .help-important {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-top: 8px;
      padding: 12px;
      background: #fff8e1;
      border-radius: 4px;
      color: #e65100;
      font-size: 13px;
      line-height: 1.4;
    }
    .help-important lucide-icon { flex-shrink: 0; margin-top: 2px; }
    .help-faq-title { font-weight: 500; font-size: 14px; margin: 16px 0 8px; }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideIn {
      from { transform: translateX(24px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `],
})
export class CampaignsScreenComponent {
  private router = inject(Router);
  data = inject(CampaignsDataService);

  currentFolderId: number | null = null;

  // Confirm
  confirmOpen = false;
  confirmTitle = 'Удалить';
  confirmText = 'Вы уверены?';
  private confirmTarget: RowKind = 'campaign';
  private confirmId: number | null = null;

  // Move
  moveOpen = false;
  moveItemName = '';
  private moveTarget: RowKind = 'campaign';
  private moveItemId: number | null = null;
  moveBrowseFolderId: number | null = null;
  moveSelectedId: number | null = null;
  moveCurrentFolderOfItem: number | null = null;

  // Folder panel
  folderPanelOpen = false;
  folderPanelMode: 'create' | 'edit' = 'create';
  folderName = '';
  folderError = '';
  private folderEditId: number | null = null;

  // Info
  infoOpen = false;

  // Toast
  toast = '';
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  get rows(): CampaignRow[] {
    const rows: CampaignRow[] = [];
    if (this.currentFolderId !== null) {
      const parent = this.data.folders.find(f => f.id === this.currentFolderId)?.parentId ?? null;
      rows.push({ kind: 'up', id: -1, name: '..', period: '', time: '', resolutions: '' });
    }
    for (const f of this.data.folders.filter(x => x.parentId === this.currentFolderId)) {
      rows.push({ kind: 'folder', id: f.id, name: f.name, period: '', time: '', resolutions: '' });
    }
    for (const c of this.data.campaigns.filter(x => x.folderId === this.currentFolderId)) {
      rows.push({
        kind: 'campaign',
        id: c.id,
        name: c.name,
        period: `${formatDate(c.dateFrom)} - ${formatDate(c.dateTo)}`,
        time: `${c.timeFrom} - ${c.timeTo}`,
        resolutions: c.resolutions.map(r => `${r.width}x${r.height}`).join(', '),
      });
    }
    return rows;
  }

  get moveFolders(): CampaignFolder[] {
    return this.data.folders.filter(f => f.parentId === this.moveBrowseFolderId);
  }

  trackRow(index: number, row: CampaignRow): string {
    return `${row.kind}-${row.id}`;
  }

  // ─── Навигация ───

  openFolder(id: number): void {
    this.currentFolderId = id;
  }

  goUp(): void {
    const cur = this.data.folders.find(f => f.id === this.currentFolderId);
    this.currentFolderId = cur ? cur.parentId : null;
  }

  openCampaign(id: number): void {
    this.router.navigate(['/prototype/web-screens/campaign-editor', id]);
  }

  onAdd(): void {
    this.router.navigate(['/prototype/web-screens/campaign-editor', 'new'], {
      queryParams: { folder: this.currentFolderId ?? 'root' },
    });
  }

  onEdit(row: CampaignRow): void {
    if (row.kind === 'campaign') {
      this.openCampaign(row.id);
    } else if (row.kind === 'folder') {
      this.folderPanelMode = 'edit';
      this.folderEditId = row.id;
      this.folderName = row.name;
      this.folderError = '';
      this.folderPanelOpen = true;
    }
  }

  // ─── Удаление ───

  onDelete(row: CampaignRow): void {
    this.confirmTarget = row.kind;
    this.confirmId = row.id;
    this.confirmTitle = 'Удалить';
    this.confirmText = 'Вы уверены?';
    this.confirmOpen = true;
  }

  confirmYes(): void {
    if (this.confirmId === null) {
      this.confirmOpen = false;
      return;
    }
    if (this.confirmTarget === 'campaign') {
      this.data.deleteCampaign(this.confirmId);
      this.showToast('Удалено');
    } else {
      this.data.deleteFolder(this.confirmId);
      this.showToast('Удалено');
    }
    this.confirmOpen = false;
    this.confirmId = null;
  }

  // ─── Перемещение ───

  onMove(row: CampaignRow): void {
    this.moveTarget = row.kind;
    this.moveItemId = row.id;
    this.moveItemName = row.name;
    this.moveBrowseFolderId = null;
    if (row.kind === 'campaign') {
      const c = this.data.getCampaign(row.id)!;
      this.moveSelectedId = c.folderId;
      this.moveCurrentFolderOfItem = c.folderId;
    } else {
      const f = this.data.folders.find(x => x.id === row.id)!;
      this.moveSelectedId = f.parentId;
      this.moveCurrentFolderOfItem = f.parentId;
    }
    this.moveOpen = true;
  }

  hasChildFolders(id: number): boolean {
    return this.data.childrenOf(id).length > 0;
  }

  selectMoveTarget(id: number | null): void {
    this.moveSelectedId = id;
  }

  moveBrowseInto(folderId: number, event: Event): void {
    event.stopPropagation();
    this.moveBrowseFolderId = folderId;
    this.moveSelectedId = null;
  }

  moveBrowseUp(): void {
    const cur = this.data.folders.find(f => f.id === this.moveBrowseFolderId);
    this.moveBrowseFolderId = cur ? cur.parentId : null;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.confirmOpen = false;
    this.moveOpen = false;
    this.folderPanelOpen = false;
    this.infoOpen = false;
  }

  confirmMove(): void {
    if (this.moveItemId === null || this.moveSelectedId === this.moveCurrentFolderOfItem) return;
    if (this.moveTarget === 'campaign') {
      this.data.moveCampaign(this.moveItemId, this.moveSelectedId);
      this.showToast('Перемещено');
    } else {
      const f = this.data.folders.find(x => x.id === this.moveItemId);
      if (f) {
        f.parentId = this.moveSelectedId;
        this.data.persist();
        this.showToast('Перемещено');
      }
    }
    this.moveOpen = false;
  }

  // ─── Папки ───

  openCreateFolder(): void {
    this.folderPanelMode = 'create';
    this.folderEditId = null;
    this.folderName = '';
    this.folderError = '';
    this.folderPanelOpen = true;
  }

  saveFolder(): void {
    if (!this.folderName.trim()) {
      this.folderError = 'Поле "Название папки" обязательно для заполнения';
      return;
    }
    if (this.folderPanelMode === 'create') {
      this.data.createFolder(this.folderName.trim(), this.currentFolderId);
      this.showToast('Сохранено');
    } else if (this.folderEditId !== null) {
      this.data.renameFolder(this.folderEditId, this.folderName.trim());
      this.showToast('Сохранено');
    }
    this.folderPanelOpen = false;
  }

  // ─── Toast ───

  showToast(text: string): void {
    this.toast = text;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toast = '';
    }, 2500);
  }
}
