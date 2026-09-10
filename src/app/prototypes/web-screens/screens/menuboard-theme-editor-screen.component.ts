import { Component, inject, OnInit, OnDestroy, AfterViewInit, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { UiConfirmDialogComponent } from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { StorageService } from '@/shared/storage.service';
import { CsDataService } from '../cs-data.service';
import { CampaignsDataService } from '../campaigns-data.service';
import { WebCampaign, CampaignFolder, CampaignMedia } from '../data/campaigns.data';
import { MOCK_ARRIVALS_THEMES, MOCK_ARRIVALS_CONTROLS, MOCK_ARRIVALS_ORDERS, MOCK_EXTERNAL_MENU, ExternalMenuItem } from '../data/mock-data';
import { MENUBOARD_THEME_CATEGORIES } from '../data/menuboard-categories.data';
import { ArrivalsTheme, ArrivalsThemeElement, ArrivalsElementType, ArrivalsControl, ArrivalsOrderMock, ElementCategory } from '../types';
import { AreaElementRendererComponent } from '../components/theme-editor/area-element-renderer.component';
import { ThemeElementInspectorComponent } from '../components/theme-editor/theme-element-inspector.component';
import { AreaElementInspectorComponent } from '../components/theme-editor/area-element-inspector.component';
import { OrderSimulatorComponent } from '../components/simulator/order-simulator.component';
import { AreaEmulationHelper } from '../components/theme-editor/area-emulation.service';
import { SimulatorHelper } from '../components/theme-editor/simulator.helper';
import { DishSelectorModalComponent } from '../components/dish-selector-modal/dish-selector-modal.component';
import { CollapsibleSectionComponent } from '../components/inspector/collapsible-section.component';
import { ElementPaletteComponent } from '../components/element-palette/element-palette.component';

type PanelView = 'theme' | 'add-element' | 'element';

/** Строка списка кампаний в инспекторе области: папка-заголовок или кампания-чекбокс */
interface CampaignRow {
  kind: 'header' | 'campaign';
  folderKey: string;
  title: string;
  count: number;
  collapsed: boolean;
  campaignId: number;
  campaignName: string;
  campaignDateFrom: string;
  campaignDateTo: string;
}

/** Слайд «живой» рекламы на канвасе */
interface AdvertiseSlide {
  campaignId: number;
  campaignName: string;
  mediaName: string;
  mediaType: string;
  color: string;
}

@Component({
  selector: 'app-menuboard-theme-editor-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, UiConfirmDialogComponent, AreaElementRendererComponent, ThemeElementInspectorComponent, AreaElementInspectorComponent, OrderSimulatorComponent, DishSelectorModalComponent, CollapsibleSectionComponent, ElementPaletteComponent],
  template: `
    <div class="editor-layout">
      <div class="canvas-column">
        <div class="canvas-area" #canvasAreaRef>
        <div class="canvas-scroll">
          <div class="canvas-viewport" [style.width.px]="resWidth" [style.height.px]="resHeight" [style.transform]="'scale(' + canvasScale + ')'" (click)="onCanvasClick()">
            <ng-container *ngFor="let el of theme.elements; let i = index">
              <div *ngIf="el.type === 'area'" class="canvas-element area-element" [class.selected]="selectedElementId === el.id" [class.dragging]="dragState?.elementId === el.id" [style.z-index]="getElementZIndex(el, i)" [style.left.px]="el.x" [style.top.px]="el.y" [style.width.px]="el.width" [style.height.px]="el.height" [style.border-width.px]="el.borderWidth" [style.border-color]="el.borderColor" [style.border-radius.px]="el.borderRadius" (click)="selectElement(el.id, $event)" (mousedown)="onElementMouseDown($event, el)">
                <app-area-element-renderer [element]="el" [orderPositions]="areaHelper.getOrderPositions(el, sim.orders, sim.active, mockOrders, availableControls)" [emulationRunning]="areaHelper.isRunning(el.id)" [hasControl]="!!el.areaControlId" (toggleEmu)="areaHelper.toggle($event, getFilterSource(), availableControls)" (resetEmu)="areaHelper.reset($event.id)" (fillEmu)="areaHelper.fill($event, getFilterSource(), availableControls)"></app-area-element-renderer>
                <ng-container *ngIf="selectedElementId === el.id"><div class="handle tl" (mousedown)="onHandleMouseDown($event, el, 'tl')"></div><div class="handle tr" (mousedown)="onHandleMouseDown($event, el, 'tr')"></div><div class="handle bl" (mousedown)="onHandleMouseDown($event, el, 'bl')"></div><div class="handle br" (mousedown)="onHandleMouseDown($event, el, 'br')"></div><div class="handle tm" (mousedown)="onHandleMouseDown($event, el, 'tm')"></div><div class="handle bm" (mousedown)="onHandleMouseDown($event, el, 'bm')"></div><div class="handle ml" (mousedown)="onHandleMouseDown($event, el, 'ml')"></div><div class="handle mr" (mousedown)="onHandleMouseDown($event, el, 'mr')"></div></ng-container>
              </div>
              <div *ngIf="el.type !== 'area'" class="canvas-element" [class.selected]="selectedElementId === el.id" [class.dragging]="dragState?.elementId === el.id" [style.z-index]="getElementZIndex(el, i)" [style.left.px]="el.x" [style.top.px]="el.y" [style.width.px]="el.width" [style.height.px]="el.height" [style.border-width.px]="el.borderWidth" [style.border-color]="el.borderColor" [style.border-radius.px]="el.borderRadius" [style.background-color]="el.type === 'advertise' ? getAdvertiseBg(el) : null" (mouseenter)="onAdvertiseAreaHover(el, true)" (mouseleave)="onAdvertiseAreaHover(el, false)" (click)="selectElement(el.id, $event)" (mousedown)="onElementMouseDown($event, el)">
                <span *ngIf="el.type === 'text'" class="el-text" [style.font-family]="el.fontFamily" [style.font-size.px]="el.fontSize" [style.font-weight]="el.fontBold ? 'bold' : 'normal'" [style.font-style]="el.fontItalic ? 'italic' : 'normal'" [style.text-align]="el.textAlign">{{ el.text }}</span>
                <img *ngIf="el.type === 'image' && el.imageUrl" [src]="el.imageUrl" class="el-image-img" (error)="el.imageUrl = ''" />
                <span *ngIf="el.type === 'image' && !el.imageUrl" class="el-placeholder"><lucide-icon name="image" [size]="24"></lucide-icon></span>
                <span *ngIf="el.type === 'price'" class="el-text" [style.font-family]="el.fontFamily" [style.font-size.px]="el.fontSize" [style.font-weight]="el.fontBold ? 'bold' : 'normal'" [style.font-style]="el.fontItalic ? 'italic' : 'normal'" [style.text-align]="el.textAlign" [title]="getPriceTooltip(el)">{{ getPricePreview(el) }}</span>
                <ng-container *ngIf="el.type === 'advertise'">
                  <div *ngIf="isAdvertisePlaying(el.id)" class="el-ad-live" [style.background-color]="currentAdvertiseSlide(el)?.color || '#e0e0e0'">
                    <lucide-icon [name]="currentAdvertiseSlide(el)?.mediaType === 'video/mp4' ? 'film' : 'image'" [size]="20" class="el-ad-live-icon"></lucide-icon>
                    <span class="el-ad-live-campaign">{{ currentAdvertiseSlide(el)?.campaignName }}</span>
                    <span class="el-ad-live-media">{{ currentAdvertiseSlide(el)?.mediaName }}</span>
                  </div>
                  <span *ngIf="!isAdvertisePlaying(el.id)" class="el-placeholder-label el-ad-label" [title]="getAdvertiseFullLabel(el)">{{ getAdvertiseLabel(el) }}</span>
                  <button *ngIf="getAdvertiseCampaignCount(el) > 0" type="button" class="el-ad-play" [class.el-ad-play-active]="isAdvertisePlaying(el.id)" [class.el-ad-play-hidden]="isAdvertisePlaying(el.id) && !isPauseVisible(el.id)" (click)="toggleAdvertisePlay(el.id, $event)" [title]="isAdvertisePlaying(el.id) ? 'Остановить показ' : 'Проиграть кампании'" [attr.aria-label]="isAdvertisePlaying(el.id) ? 'Остановить показ' : 'Проиграть кампании'">
                    <lucide-icon [name]="isAdvertisePlaying(el.id) ? 'pause' : 'play'" [size]="14"></lucide-icon>
                  </button>
                </ng-container>
                <span *ngIf="el.type === 'qr'" class="el-qr"><lucide-icon name="qr-code" [size]="28"></lucide-icon><span>QR-код</span></span>
                <span *ngIf="el.type === 'counter'" class="el-text" [style.font-family]="el.fontFamily" [style.font-size.px]="el.fontSize" [style.font-weight]="el.fontBold ? 'bold' : 'normal'" [style.font-style]="el.fontItalic ? 'italic' : 'normal'" [style.text-align]="el.textAlign">{{ el.text || '--:--' }}</span>
                <div *ngIf="el.type === 'menulist'" class="el-menulist">
                  <div class="ml-empty" *ngIf="!el.productIds?.length">Выберите блюда</div>
                  <div class="ml-rows" *ngIf="el.productIds?.length">
                    <div class="ml-row" *ngFor="let pid of el.productIds || []; let odd = odd"
                      [style.min-height.px]="el.rowHeight || 48"
                      [style.background-color]="getRowBg(el, odd)"
                      [style.padding.px]="el.rowPadding || 4">
                      <!-- Icon -->
                      <div class="ml-icon" *ngIf="el.showIcons !== false">
                        <lucide-icon *ngIf="!getDishData(pid)?.imageUrl" name="image-off" [size]="20"></lucide-icon>
                        <img *ngIf="getDishData(pid)?.imageUrl" [src]="getDishData(pid)?.imageUrl" class="ml-icon-img" />
                      </div>
                      <!-- Main column -->
                      <div class="ml-main">
                        <div class="ml-name" [style.font-size.px]="el.fontName?.size || 16"
                          [style.font-family]="el.fontName?.family || 'Segoe UI'"
                          [style.font-weight]="el.fontName?.bold ? 'bold' : 'normal'"
                          [style.font-style]="el.fontName?.italic ? 'italic' : 'normal'"
                          [style.color]="el.fontName?.color || '#333'">
                          {{ getDishData(pid)?.name || '#' + pid.slice(0, 6) }}
                        </div>
                        <div class="ml-modifiers" *ngIf="getDishData(pid)?.modifiers?.length"
                          [style.font-size.px]="el.fontModifiers?.size || 12"
                          [style.font-family]="el.fontModifiers?.family || 'Segoe UI'"
                          [style.font-weight]="el.fontModifiers?.bold ? 'bold' : 'normal'"
                          [style.font-style]="el.fontModifiers?.italic ? 'italic' : 'normal'"
                          [style.color]="el.fontModifiers?.color || '#666'">
                          Модификаторы: {{ getDishData(pid)?.modifiers?.join(', ') }}
                        </div>
                        <div class="ml-sizes" *ngIf="getDishData(pid)?.sizes?.length"
                          [style.font-size.px]="el.fontModifiers?.size || 12"
                          [style.font-family]="el.fontModifiers?.family || 'Segoe UI'"
                          [style.font-weight]="el.fontModifiers?.bold ? 'bold' : 'normal'"
                          [style.font-style]="el.fontModifiers?.italic ? 'italic' : 'normal'"
                          [style.color]="el.fontModifiers?.color || '#666'">
                          Размеры: {{ formatSizes(getDishData(pid)?.sizes) }}
                        </div>
                        <div class="ml-desc" *ngIf="el.showDescription && getDishData(pid)?.description"
                          [style.font-size.px]="el.fontDescription?.size || 11"
                          [style.font-family]="el.fontDescription?.family || 'Segoe UI'"
                          [style.font-weight]="el.fontDescription?.bold ? 'bold' : 'normal'"
                          [style.font-style]="el.fontDescription?.italic ? 'italic' : 'normal'"
                          [style.color]="el.fontDescription?.color || '#999'">
                          {{ getDishData(pid)?.description }}
                        </div>
                        <div class="ml-extra" *ngIf="(el.showAllergens && getDishData(pid)?.allergens?.length) || (el.showNutrition && getDishData(pid)?.energy != null)"
                          [style.font-size.px]="(el.fontDescription?.size || 11)">
                          <span class="ml-allergens" *ngIf="el.showAllergens && getDishData(pid)?.allergens?.length"
                            [style.color]="el.allergensColor || '#e65100'">
                            ⚠ {{ getDishData(pid)?.allergens?.join(', ') }}
                          </span>
                          <span class="ml-sep" *ngIf="el.showAllergens && getDishData(pid)?.allergens?.length && el.showNutrition && getDishData(pid)?.energy != null"
                            [style.color]="el.fontDescription?.color || '#999'"> | </span>
                          <span class="ml-nutrition" *ngIf="el.showNutrition && getDishData(pid)?.energy != null"
                            [style.color]="el.nutritionColor || '#999'">
                            {{ getDishData(pid)?.energy }} ккал Б:{{ getDishData(pid)?.proteins || 0 }} Ж:{{ getDishData(pid)?.fats || 0 }} У:{{ getDishData(pid)?.carbs || 0 }}
                          </span>
                        </div>
                      </div>
                      <!-- Price column -->
                      <div class="ml-price-col">
                        <div class="ml-price" [style.font-size.px]="el.fontPrice?.size || 16"
                          [style.font-family]="el.fontPrice?.family || 'Segoe UI'"
                          [style.font-weight]="el.fontPrice?.bold ? 'bold' : 'normal'"
                          [style.font-style]="el.fontPrice?.italic ? 'italic' : 'normal'"
                          [style.color]="el.fontPrice?.color || '#C00'">
                          {{ getDishData(pid)?.price || 0 }} \u20BD
                        </div>
                        <div class="ml-weight" *ngIf="getDishData(pid)?.weight"
                          [style.font-size.px]="(el.fontDescription?.size || 11)"
                          [style.color]="el.fontDescription?.color || '#999'">
                          {{ getDishData(pid)?.weight }} {{ getDishData(pid)?.measure || '' }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <span *ngIf="el.type !== 'text' && el.type !== 'image' && el.type !== 'price' && el.type !== 'advertise' && el.type !== 'menulist' && el.type !== 'counter' && el.type !== 'qr'" class="el-placeholder-label">{{ el.name }}</span>
                <ng-container *ngIf="selectedElementId === el.id"><div class="handle tl" (mousedown)="onHandleMouseDown($event, el, 'tl')"></div><div class="handle tr" (mousedown)="onHandleMouseDown($event, el, 'tr')"></div><div class="handle bl" (mousedown)="onHandleMouseDown($event, el, 'bl')"></div><div class="handle br" (mousedown)="onHandleMouseDown($event, el, 'br')"></div><div class="handle tm" (mousedown)="onHandleMouseDown($event, el, 'tm')"></div><div class="handle bm" (mousedown)="onHandleMouseDown($event, el, 'bm')"></div><div class="handle ml" (mousedown)="onHandleMouseDown($event, el, 'ml')"></div><div class="handle mr" (mousedown)="onHandleMouseDown($event, el, 'mr')"></div></ng-container>
              </div>
            </ng-container>
          </div>
        </div>
        </div>
        <app-order-simulator [orders]="sim.orders" [autoRunning]="sim.autoRunning" (addOrder)="sim.addOrder(); areaHelper.clearAll()" (loadMocks)="sim.loadMocks(); areaHelper.clearAll()" (removeOrder)="sim.removeByIdx($event); areaHelper.clearAll()" (cycleStatus)="sim.cycleStatus($event); areaHelper.clearAll()" (changeOrderType)="sim.changeOrderType($event.order, $event.newType); areaHelper.clearAll()" (toggleAuto)="sim.toggleAuto()" (clearAll)="sim.clearAll(); areaHelper.clearAll()"></app-order-simulator>
        <!-- Баннер: нет платной лицензии (вариант D) -->
        <div *ngIf="!dataService.hasPremiumLicense && themeHasPremium" class="premium-banner">
          <lucide-icon name="alert-triangle" [size]="16"></lucide-icon>
          <span>Отсутствует лицензия.</span>
        </div>
      </div>
      <div class="control-panel">
        <div class="panel-header" (click)="panelCollapsed = !panelCollapsed"><span>Панель управления</span><lucide-icon [name]="panelCollapsed ? 'chevron-right' : 'chevron-down'" [size]="18"></lucide-icon></div>
        <div *ngIf="!panelCollapsed" class="panel-body">
          <ng-container *ngIf="panelView === 'theme'">
            <div class="panel-breadcrumb"><lucide-icon name="home" [size]="16" class="bc-home"></lucide-icon><span class="bc-link">Тема</span></div>
            <div class="field-group"><label class="field-label">Имя темы</label><input class="field-input" [(ngModel)]="theme.name" /></div>
            <div class="field-group"><label class="field-label">Разрешение</label><select class="field-select" [(ngModel)]="theme.resolution" (ngModelChange)="onResolutionChange()"><option *ngFor="let r of resolutionOptions" [value]="r.value">{{ r.label }}</option></select></div>
            <div class="section-divider">Настройка режима</div>
            <div class="field-group"><select class="field-select" [(ngModel)]="theme.screenMode"><option *ngFor="let m of screenModeOptions" [value]="m.value">{{ m.label }}</option></select></div>
            <div class="section-divider">Элементы</div>
            <div *ngFor="let el of theme.elements; let i = index" class="element-list-item" [class.active]="selectedElementId === el.id" [class.list-dragging]="listDragIndex === i" [class.list-drag-above]="listDragOverIndex === i && listDragIndex !== null && listDragIndex! > i" [class.list-drag-below]="listDragOverIndex === i && listDragIndex !== null && listDragIndex! < i" (click)="selectElementFromList(el.id)" (mousedown)="onListMouseDown(i, $event)"><span class="el-list-name">{{ el.name }}</span><span *ngIf="el.type === 'area'" class="premium-badge" title="Платный элемент — доступен при платной лицензии"><lucide-icon name="alert-circle" [size]="14"></lucide-icon></span><button class="el-list-delete" (click)="requestDeleteElement(el, $event)" title="Удалить"><lucide-icon name="x" [size]="14"></lucide-icon></button></div>
            <button class="btn-add-element" (click)="panelView = 'add-element'">Добавить элемент</button>
          </ng-container>
          <app-element-palette
            *ngIf="panelView === 'add-element'"
            [categories]="themeCategories"
            [hasPremiumLicense]="dataService.hasPremiumLicense"
            (elementSelected)="addElement($any($event))"
            (closed)="panelView = 'theme'">
          </app-element-palette>
          <ng-container *ngIf="panelView === 'element' && selectedElement">
            <div class="panel-breadcrumb"><lucide-icon name="home" [size]="16" class="bc-home" (click)="deselectElement()"></lucide-icon><span class="bc-link" (click)="deselectElement()">Тема</span><span class="bc-separator">/</span><span class="bc-current">{{ selectedElement.name }}</span></div>
            <!-- Advertise: рекламные кампании (DS-1121, раздел 5.3) -->
            <div *ngIf="selectedElement.type === 'advertise'" class="field-group">
              <p class="advertise-desc">Место на экране менюборда, где по расписанию показываются рекламные кампании.</p>
              <label class="field-label">Рекламные кампании<span class="campaign-count" *ngIf="selectedCampaignCount">Выбрано: {{ selectedCampaignCount }}</span></label>
              <div class="campaign-search">
                <lucide-icon name="search" [size]="14"></lucide-icon>
                <input class="campaign-search-input" type="text" placeholder="Поиск по названию" [(ngModel)]="campaignSearchText" />
                <button *ngIf="campaignSearchText" class="campaign-search-clear" (click)="campaignSearchText = ''" title="Очистить"><lucide-icon name="x" [size]="14"></lucide-icon></button>
              </div>

              <!-- Пустой справочник кампаний -->
              <div *ngIf="!campaignsService.campaigns.length" class="campaign-empty">
                <lucide-icon name="megaphone" [size]="22"></lucide-icon>
                <p>Нет доступных кампаний.</p>
                <button class="campaign-create-link" (click)="goToCampaigns()">Создать кампанию</button>
              </div>

              <!-- Список кампаний с группировкой по папкам -->
              <div class="campaign-multiselect" [class.campaign-multiselect-error]="advertiseValidationError" *ngIf="campaignsService.campaigns.length">
                <div class="campaign-select-all" *ngIf="campaignRows.length">
                  <input type="checkbox" id="campaign-select-all" [checked]="allCampaignsSelected" [indeterminate]="someCampaignsSelected" (change)="toggleSelectAll()" />
                  <label for="campaign-select-all">Все</label>
                </div>
                <ng-container *ngFor="let row of campaignRows">
                  <button *ngIf="row.kind === 'header'" type="button" class="campaign-folder" (click)="toggleFolder(row.folderKey)">
                    <lucide-icon [name]="row.collapsed ? 'chevron-right' : 'chevron-down'" [size]="14"></lucide-icon>
                    <lucide-icon name="folder" [size]="14"></lucide-icon>
                    <span class="campaign-folder-name">{{ row.title }}</span>
                    <span class="campaign-folder-count">{{ row.count }}</span>
                  </button>
                  <label *ngIf="row.kind === 'campaign'" class="campaign-checkbox" [title]="row.campaignName + ' (' + formatCampaignDate(row.campaignDateFrom) + ' - ' + formatCampaignDate(row.campaignDateTo) + ')'">
                    <input type="checkbox" [checked]="isCampaignSelected(row.campaignId)" (change)="toggleCampaign(row.campaignId)" />
                    <span class="campaign-checkbox-label">{{ row.campaignName }}</span>
                  </label>
                </ng-container>
                <div *ngIf="!campaignRows.length" class="campaign-empty-hint">
                  <lucide-icon name="search" [size]="16"></lucide-icon>
                  <span>Ничего не найдено</span>
                </div>
              </div>

              <p class="campaign-error" *ngIf="advertiseValidationError">{{ advertiseValidationError }}</p>
              <p class="layer-hint">Ролики с расписанием из раздела «Кампании». Выберите хотя бы одну.</p>
            </div>
            <!-- Advertise: макет и граница (DS-1121, раздел 6.1) -->
            <ng-container *ngIf="selectedElement.type === 'advertise'">
              <app-collapsible-section title="Макет">
                <div class="field-group">
                  <label class="field-label">Позиция X</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.x" />
                </div>
                <div class="field-group">
                  <label class="field-label">Позиция Y</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.y" />
                </div>
                <div class="field-group">
                  <label class="field-label">Ширина (px)</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.width" min="20" />
                </div>
                <div class="field-group">
                  <label class="field-label">Высота (px)</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.height" min="20" />
                </div>
                <div class="field-group">
                  <label class="field-label">Порядок отображения</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.layer" min="1" />
                  <p class="layer-error" *ngIf="getAdvertiseLayerError(selectedElement)">{{ getAdvertiseLayerError(selectedElement) }}</p>
                  <p class="layer-hint" *ngIf="!getAdvertiseLayerError(selectedElement) && getQrLayer() != null">QR-код отображается выше. Реклама должна быть ниже QR-кода.</p>
                  <p class="layer-hint" *ngIf="!getAdvertiseLayerError(selectedElement) && getQrLayer() == null">Меньше — ниже, больше — выше.</p>
                </div>
                <div class="field-group">
                  <label class="field-label">Цвет фона</label>
                  <input type="color" class="field-color" [(ngModel)]="selectedElement.bgColor" />
                </div>
                <div class="field-group">
                  <label class="field-label">Прозрачность (%)</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.bgOpacity" min="0" max="100" />
                </div>
              </app-collapsible-section>

              <app-collapsible-section title="Граница">
                <div class="field-group">
                  <label class="field-label">Толщина (px)</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.borderWidth" min="0" />
                </div>
                <div class="field-group">
                  <label class="field-label">Цвет</label>
                  <input type="color" class="field-color" [(ngModel)]="selectedElement.borderColor" />
                </div>
                <div class="field-group">
                  <label class="field-label">Скругление (px)</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.borderRadius" min="0" />
                </div>
              </app-collapsible-section>
            </ng-container>
            <!-- MenuList inspector -->
            <ng-container *ngIf="selectedElement.type === 'menulist'">
              <app-collapsible-section title="Данные" [expanded]="true">
                <div class="field-group">
                  <button class="btn-select-dishes" (click)="openDishSelector()">
                    <lucide-icon name="list" [size]="16"></lucide-icon>
                    Выбрать блюда
                  </button>
                </div>
                <div class="field-group" *ngIf="selectedElement.productIds?.length">
                  <label class="field-label">Выбранные блюда</label>
                  <div class="selected-dishes">
                    <div class="sd-item" *ngFor="let pid of selectedElement.productIds">
                      <span class="sd-name">{{ getDishDisplayName(pid) }}</span>
                      <span class="sd-price">{{ getDishDisplayPrice(pid) }}</span>
                      <button class="sd-remove" (click)="removeDishFromList(pid)" title="Убрать">
                        <lucide-icon name="x" [size]="14"></lucide-icon>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="field-group" *ngIf="!selectedElement.productIds?.length">
                  <p class="field-hint">Блюда не выбраны</p>
                </div>
              </app-collapsible-section>

              <app-collapsible-section title="Макет">
                <div class="field-group">
                  <label class="field-label">Позиция X</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.x" />
                </div>
                <div class="field-group">
                  <label class="field-label">Позиция Y</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.y" />
                </div>
                <div class="field-group">
                  <label class="field-label">Ширина (px)</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.width" min="100" />
                </div>
                <div class="field-group">
                  <label class="field-label">Высота (px)</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.height" min="100" />
                </div>
              </app-collapsible-section>

              <app-collapsible-section title="Граница">
                <div class="field-group">
                  <label class="field-label">Толщина (px)</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.borderWidth" min="0" />
                </div>
                <div class="field-group">
                  <label class="field-label">Цвет</label>
                  <input type="color" class="field-color" [(ngModel)]="selectedElement.borderColor" />
                </div>
                <div class="field-group">
                  <label class="field-label">Скругление (px)</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.borderRadius" min="0" />
                </div>
              </app-collapsible-section>

              <app-collapsible-section title="Настройки таблицы">
                <div class="field-group">
                  <label class="field-label">Чередование строк</label>
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.alternateRows" /> Включено</label>
                </div>
                <div class="field-group">
                  <label class="field-label">Высота строки (px)</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.rowHeight" min="24" max="200" />
                </div>
                <div class="field-group">
                  <label class="field-label">Отступ строк (px)</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.rowPadding" min="0" max="20" />
                </div>
              </app-collapsible-section>

              <app-collapsible-section title="Подсветка строк">
                <div class="field-group">
                  <label class="field-label">Цвет основной строки</label>
                  <input type="color" class="field-color" [(ngModel)]="selectedElement.rowBgColor" [disabled]="!!selectedElement.rowBgTransparent" />
                  <label class="field-check" style="margin-top:6px"><input type="checkbox" [(ngModel)]="selectedElement.rowBgTransparent" /> Прозрачный</label>
                </div>
                <div class="field-group">
                  <label class="field-label">Цвет подсветки</label>
                  <input type="color" class="field-color" [(ngModel)]="selectedElement.highlightColor" [disabled]="!!selectedElement.highlightTransparent" />
                  <label class="field-check" style="margin-top:6px"><input type="checkbox" [(ngModel)]="selectedElement.highlightTransparent" /> Прозрачный</label>
                </div>
              </app-collapsible-section>

              <app-collapsible-section title="Шрифт названия">
                <div class="field-group">
                  <label class="field-label">Размер (px)</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.fontName!.size" min="8" max="72" />
                </div>
                <div class="field-group">
                  <label class="field-label">Семейство</label>
                  <select class="field-select" [(ngModel)]="selectedElement.fontName!.family">
                    <option value="Segoe UI">Segoe UI</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                </div>
                <div class="field-group">
                  <label class="field-label">Цвет</label>
                  <input type="color" class="field-color" [(ngModel)]="selectedElement.fontName!.color" />
                </div>
                <div class="field-group">
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.fontName!.bold" /> Жирный</label>
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.fontName!.italic" /> Курсив</label>
                </div>
              </app-collapsible-section>

              <app-collapsible-section title="Шрифт цены">
                <div class="field-group">
                  <label class="field-label">Размер (px)</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.fontPrice!.size" min="8" max="72" />
                </div>
                <div class="field-group">
                  <label class="field-label">Семейство</label>
                  <select class="field-select" [(ngModel)]="selectedElement.fontPrice!.family">
                    <option value="Segoe UI">Segoe UI</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                </div>
                <div class="field-group">
                  <label class="field-label">Цвет</label>
                  <input type="color" class="field-color" [(ngModel)]="selectedElement.fontPrice!.color" />
                </div>
                <div class="field-group">
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.fontPrice!.bold" /> Жирный</label>
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.fontPrice!.italic" /> Курсив</label>
                </div>
              </app-collapsible-section>

              <app-collapsible-section title="Шрифт модификаторов">
                <div class="field-group">
                  <label class="field-label">Размер (px)</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.fontModifiers!.size" min="8" max="48" />
                </div>
                <div class="field-group">
                  <label class="field-label">Семейство</label>
                  <select class="field-select" [(ngModel)]="selectedElement.fontModifiers!.family">
                    <option value="Segoe UI">Segoe UI</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                </div>
                <div class="field-group">
                  <label class="field-label">Цвет</label>
                  <input type="color" class="field-color" [(ngModel)]="selectedElement.fontModifiers!.color" />
                </div>
                <div class="field-group">
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.fontModifiers!.bold" /> Жирный</label>
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.fontModifiers!.italic" /> Курсив</label>
                </div>
              </app-collapsible-section>

              <app-collapsible-section title="Шрифт описания">
                <div class="field-group">
                  <label class="field-label">Размер (px)</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.fontDescription!.size" min="8" max="48" />
                </div>
                <div class="field-group">
                  <label class="field-label">Семейство</label>
                  <select class="field-select" [(ngModel)]="selectedElement.fontDescription!.family">
                    <option value="Segoe UI">Segoe UI</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                </div>
                <div class="field-group">
                  <label class="field-label">Цвет</label>
                  <input type="color" class="field-color" [(ngModel)]="selectedElement.fontDescription!.color" />
                </div>
                <div class="field-group">
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.fontDescription!.bold" /> Жирный</label>
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.fontDescription!.italic" /> Курсив</label>
                </div>
              </app-collapsible-section>

              <app-collapsible-section title="Отображение">
                <div class="field-group">
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.showIcons" /> Показывать иконки</label>
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.showDescription" /> Показывать описание</label>
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.showAllergens" /> Показывать аллергены</label>
                  <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.showNutrition" /> Показывать КБЖУ</label>
                </div>
                <div class="field-group" *ngIf="selectedElement.showAllergens">
                  <label class="field-label">Цвет аллергенов</label>
                  <input type="color" class="field-color" [(ngModel)]="selectedElement.allergensColor" />
                </div>
                <div class="field-group" *ngIf="selectedElement.showNutrition">
                  <label class="field-label">Цвет КБЖУ</label>
                  <input type="color" class="field-color" [(ngModel)]="selectedElement.nutritionColor" />
                </div>
              </app-collapsible-section>
            </ng-container>
            <!-- QR: порядок отображения (DS-1121, раздел 5.4) -->
            <div class="field-group" *ngIf="selectedElement.type === 'qr'">
              <label class="field-label">Порядок отображения</label>
              <input type="number" class="field-input" [(ngModel)]="selectedElement.layer" min="1" />
              <p class="layer-hint">QR-код должен быть выше всех рекламных областей.</p>
            </div>
            <!-- Standard element inspector for non-menulist, non-area, non-advertise -->
            <app-theme-element-inspector *ngIf="selectedElement.type !== 'area' && selectedElement.type !== 'menulist' && selectedElement.type !== 'advertise'" [element]="selectedElement"></app-theme-element-inspector>
            <app-area-element-inspector *ngIf="selectedElement.type === 'area'" [element]="selectedElement" [availableControls]="availableControls" (areaControlChange)="onAreaControlChange()" (editControl)="onEditControl($event)"></app-area-element-inspector>
          </ng-container>
        </div>
        <div class="panel-footer"><button class="btn-save" (click)="save()">СОХРАНИТЬ</button><button class="btn-back" (click)="goBack()">НАЗАД</button></div>
      </div>
      <div *ngIf="toastMessage" class="toast">{{ toastMessage }}</div>
      <ui-confirm-dialog *ngIf="deleteElementTarget" [open]="true" title="Удалить элемент" [message]="'Удалить элемент «' + deleteElementTarget.name + '»?'" confirmText="Удалить" variant="danger" (confirmed)="confirmDeleteElement()" (cancelled)="deleteElementTarget = null"></ui-confirm-dialog>

      <!-- Dish selector modal -->
      <app-dish-selector-modal
        [open]="dishSelectorOpen"
        [categories]="externalMenuCategories"
        [selectedIds]="dishSelectorIds"
        (confirm)="onDishSelectorConfirm($event)"
        (cancel)="dishSelectorOpen = false"
      ></app-dish-selector-modal>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .editor-layout { display: flex; height: calc(100vh - 110px); margin: -20px -24px; font-family: Roboto, sans-serif; }
    .canvas-column { flex: 1; min-width: 0; display: flex; flex-direction: column; position: relative; }
    .premium-banner { position: absolute; bottom: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: rgba(0, 0, 0, 0.25); color: #fff; font-size: 12px; font-weight: 500; }
    .premium-badge { display: inline-flex; align-items: center; margin-right: 6px; color: #ff6d00; cursor: help; flex-shrink: 0; }
    .canvas-area { flex: 1; min-width: 0; overflow: auto; background: #e0e0e0; }
    .canvas-scroll { display: flex; align-items: flex-start; justify-content: center; min-height: 100%; padding: 8px; }
    .canvas-viewport { position: relative; transform-origin: top left; background-color: #fff; background-image: linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%); background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
    .canvas-element { position: absolute; border-style: dashed; cursor: move; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.5); transition: box-shadow 0.15s; font-size: 13px; color: #333; overflow: hidden; user-select: none; }
    .canvas-element:hover { box-shadow: 0 0 0 1px #448aff; }
    .canvas-element.selected { border-style: solid; border-color: #448aff !important; box-shadow: 0 0 0 1px #448aff; }
    .canvas-element.dragging { opacity: 0.85; transition: none; }
    .canvas-element.area-element { border-style: dashed !important; }
    .el-text { display: block; width: 100%; padding: 4px; word-break: break-word; }
    .el-placeholder { color: #9e9e9e; }
    .el-placeholder-label { color: #9e9e9e; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    .el-menulist { width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden; }
    .ml-empty { display: flex; align-items: center; justify-content: center; height: 100%; color: #bdbdbd; font-size: 11px; }
    .ml-rows { flex: 1; overflow: hidden; }
    .ml-row { display: flex; align-items: flex-start; gap: 6px; overflow-x: hidden; border-bottom: 1px solid #eee; box-sizing: border-box; }
    .ml-row:last-child { border-bottom: none; }
    .ml-icon { width: 32px; height: 32px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: #fafafa; border-radius: 3px; overflow: hidden; color: #ccc; }
    .ml-icon-img { width: 100%; height: 100%; object-fit: cover; }
    .ml-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; overflow: hidden; }
    .ml-name { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.25; }
    .ml-modifiers, .ml-sizes, .ml-desc { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3; }
    .ml-extra { display: flex; flex-wrap: wrap; gap: 2px; color: #999; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3; }
    .ml-allergens { flex-shrink: 0; }
    .ml-nutrition { flex-shrink: 0; }
    .ml-sep { color: #ddd; flex-shrink: 0; }
    .ml-price-col { flex-shrink: 0; text-align: right; display: flex; flex-direction: column; gap: 1px; min-width: 50px; }
    .ml-price { font-weight: 600; white-space: nowrap; line-height: 1.25; }
    .ml-weight { white-space: nowrap; line-height: 1.3; }
    .handle { position: absolute; width: 8px; height: 8px; background: #fff; border: 2px solid #448aff; z-index: 2; }
    .handle.tl { top: -4px; left: -4px; cursor: nw-resize; } .handle.tr { top: -4px; right: -4px; cursor: ne-resize; }
    .handle.bl { bottom: -4px; left: -4px; cursor: sw-resize; } .handle.br { bottom: -4px; right: -4px; cursor: se-resize; }
    .handle.tm { top: -4px; left: calc(50% - 4px); cursor: n-resize; } .handle.bm { bottom: -4px; left: calc(50% - 4px); cursor: s-resize; }
    .handle.ml { top: calc(50% - 4px); left: -4px; cursor: w-resize; } .handle.mr { top: calc(50% - 4px); right: -4px; cursor: e-resize; }
    .control-panel { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; background: #fff; border-left: 1px solid #e0e0e0; }
    .panel-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; font-size: 15px; font-weight: 500; color: #333; border-bottom: 1px solid #e0e0e0; cursor: pointer; user-select: none; }
    .panel-header:hover { background: #fafafa; }
    .panel-body { flex: 1; overflow-y: auto; padding: 16px; }
    .panel-footer { display: flex; gap: 12px; padding: 12px 16px; border-top: 1px solid #e0e0e0; }
    .btn-save { flex: 1; height: 36px; border: 2px solid #616161; border-radius: 4px; background: transparent; color: #333; font-size: 13px; font-weight: 600; font-family: Roboto, sans-serif; cursor: pointer; }
    .btn-save:hover { background: #f5f5f5; }
    .btn-back { flex: 1; height: 36px; border: none; border-radius: 4px; background: #ff9800; color: #fff; font-size: 13px; font-weight: 600; font-family: Roboto, sans-serif; cursor: pointer; }
    .btn-back:hover { background: #f57c00; }
    .panel-breadcrumb { display: flex; align-items: center; gap: 6px; margin-bottom: 16px; font-size: 14px; }
    .bc-home { color: #ff6d00; cursor: pointer; } .bc-link { color: #ff6d00; cursor: pointer; font-weight: 500; } .bc-link:hover { text-decoration: underline; }
    .bc-separator { color: #9e9e9e; } .bc-current { color: #333; font-weight: 500; }
    .field-group { margin-bottom: 12px; } .field-label { display: block; font-size: 12px; color: #757575; margin-bottom: 4px; }
    .field-input { width: 100%; height: 36px; padding: 0 10px; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 14px; font-family: Roboto, sans-serif; color: #333; box-sizing: border-box; }
    .field-input:focus { outline: none; border-color: #448aff; }
    .field-select { width: 100%; height: 36px; padding: 0 8px; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 14px; font-family: Roboto, sans-serif; color: #333; background: #fff; cursor: pointer; box-sizing: border-box; }
    /* Campaign multi-select (DS: primary #448AFF, stroke #D6D6D6) */
    .advertise-desc { font-size: 12px; color: #616161; line-height: 1.4; margin: 0 0 10px; }
    .campaign-count { margin-left: 6px; font-size: 12px; font-weight: 500; color: #448aff; }
    .campaign-multiselect { max-height: 220px; overflow-y: auto; border: 1px solid #d6d6d6; border-radius: 4px; }
    .campaign-multiselect-error { border-color: #ff5252; }
    .campaign-select-all { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f9fc; font-size: 13px; color: #333; }
    .campaign-select-all input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; accent-color: #448aff; }
    .campaign-folder { display: flex; align-items: center; gap: 6px; width: 100%; padding: 7px 10px; border: none; border-bottom: 1px solid #f0f0f0; background: #f0f5ff; color: #333; font-size: 12px; font-weight: 500; cursor: pointer; font-family: Roboto, sans-serif; text-align: left; }
    .campaign-folder:hover { background: #e8f0ff; }
    .campaign-folder-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .campaign-folder-count { font-size: 11px; color: #616161; background: #fff; border-radius: 10px; padding: 1px 7px; }
    .campaign-checkbox { display: flex; align-items: center; gap: 8px; padding: 8px 10px 8px 26px; cursor: pointer; transition: background 0.1s; border-bottom: 1px solid #f5f5f5; }
    .campaign-checkbox:last-child { border-bottom: none; }
    .campaign-checkbox:hover { background: #ebebeb; }
    .campaign-checkbox input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; accent-color: #448aff; flex-shrink: 0; }
    .campaign-checkbox-label { flex: 1; font-size: 13px; color: #333; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .campaign-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 10px; border: 1px dashed #d6d6d6; border-radius: 4px; color: #9e9e9e; }
    .campaign-empty p { margin: 0; font-size: 13px; }
    .campaign-create-link { border: none; background: transparent; color: #448aff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: Roboto, sans-serif; padding: 0; }
    .campaign-create-link:hover { text-decoration: underline; }
    .campaign-empty-hint { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 14px 10px; font-size: 12px; color: #9e9e9e; }
    .campaign-error { font-size: 12px; color: #ff5252; margin: 6px 0 0; }
    /* Advertise panels */
    .panels-list { max-height: 180px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 4px; }
    .panel-item { display: flex; align-items: center; gap: 6px; padding: 7px 10px; cursor: pointer; border-bottom: 1px solid #f5f5f5; font-size: 13px; color: #333; }
    .panel-item:last-child { border-bottom: none; }
    .panel-item:hover { background: #f5f5f5; }
    .panel-item.active { background: #e3f2fd; }
    .panel-item-name { flex-shrink: 0; font-weight: 500; }
    .panel-item-company { flex: 1; color: #757575; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .panel-item-delete { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border: none; border-radius: 3px; background: transparent; color: #bdbdbd; cursor: pointer; flex-shrink: 0; }
    .panel-item-delete:hover { background: #ffebee; color: #e53935; }
    .btn-add-panel { width: 100%; height: 34px; margin-top: 6px; border: 2px solid #1976d2; border-radius: 4px; background: #e3f2fd; color: #1565c0; font-size: 13px; font-weight: 600; font-family: Roboto, sans-serif; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .btn-add-panel:hover { background: #bbdefb; }
    .section-divider { position: relative; text-align: center; margin: 20px 0 12px; font-size: 13px; font-weight: 500; color: #9e9e9e; }
    .section-divider::before, .section-divider::after { content: ''; position: absolute; top: 50%; width: calc(50% - 50px); height: 1px; background: #e0e0e0; }
    .section-divider::before { left: 0; } .section-divider::after { right: 0; }
    .element-list-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; margin-bottom: 4px; border-radius: 4px; cursor: grab; transition: background 0.15s, opacity 0.15s, transform 0.1s; font-size: 13px; position: relative; }
    .element-list-item:hover { background: #f5f5f5; } .element-list-item.active { background: #e3f2fd; }
    .element-list-item.list-dragging { opacity: 0.4; cursor: grabbing; }
    .element-list-item.list-drag-above::before { content: ''; position: absolute; top: -2px; left: 0; right: 0; height: 2px; background: #1976d2; border-radius: 1px; z-index: 1; }
    .element-list-item.list-drag-below::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 2px; background: #1976d2; border-radius: 1px; z-index: 1; }
    .el-list-name { flex: 1; }
    .el-list-delete { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border: none; border-radius: 3px; background: transparent; color: #bdbdbd; cursor: pointer; }
    .el-list-delete:hover { background: #ffebee; color: #e53935; }
    .btn-add-element { width: 100%; height: 40px; border: none; border-radius: 4px; background: #448aff; color: #fff; font-size: 14px; font-weight: 500; font-family: Roboto, sans-serif; cursor: pointer; margin-top: 8px; }
    .btn-add-element:hover { background: #2979ff; }

    .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); padding: 10px 24px; background: #333; color: #fff; border-radius: 6px; font-size: 14px; z-index: 9000; animation: toastIn 0.3s ease; }
    @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } }

    .btn-select-dishes {
      width: 100%; height: 38px; border: 2px solid #1976d2; border-radius: 4px;
      background: #e3f2fd; color: #1565c0; font-size: 13px; font-weight: 600;
      font-family: Roboto, sans-serif; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
    }
    .btn-select-dishes:hover { background: #bbdefb; }

    .selected-dishes { display: flex; flex-direction: column; gap: 4px; max-height: 180px; overflow-y: auto; }
    .sd-item { display: flex; align-items: center; gap: 6px; padding: 4px 8px; background: #f5f5f5; border-radius: 4px; font-size: 12px; }
    .sd-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #333; }
    .sd-price { flex-shrink: 0; font-weight: 600; color: #c62828; }
    .sd-remove { display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; border: none; border-radius: 3px; background: transparent; color: #bdbdbd; cursor: pointer; flex-shrink: 0; }
    .sd-remove:hover { background: #ffebee; color: #e53935; }

    .field-check { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #424242; cursor: pointer; margin-bottom: 6px; }
    .field-check input[type="checkbox"] { cursor: pointer; }
    .field-hint { font-size: 12px; color: #bdbdbd; font-style: italic; margin: 0; text-align: center; padding: 8px 0; }
    .field-color { width: 100%; height: 36px; border: 1px solid #e0e0e0; border-radius: 4px; padding: 2px; cursor: pointer; box-sizing: border-box; }
    .campaign-search { display: flex; align-items: center; gap: 6px; border: 1px solid #d6d6d6; border-radius: 4px; padding: 6px 8px; margin-bottom: 6px; color: #9e9e9e; }
    .campaign-search:focus-within { border-color: #448aff; }
    .campaign-search-input { flex: 1; border: none; outline: none; font-size: 13px; font-family: Roboto, sans-serif; color: #333; background: transparent; }
    .campaign-search-clear { display: flex; align-items: center; justify-content: center; border: none; background: transparent; color: #9e9e9e; cursor: pointer; padding: 0; }
    .layer-error { font-size: 12px; color: #ff5252; margin: 4px 0 0; }
    .layer-hint { font-size: 12px; color: #9e9e9e; margin: 4px 0 0; }
    .el-qr { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; width: 100%; height: 100%; color: #616161; font-size: 11px; }

    /* ── Живой показ рекламы на канвасе (Play/Pause) ── */
    .el-ad-live { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 4px; text-align: center; overflow: hidden; background-image: linear-gradient(to top, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0) 50%); }
    .el-ad-live-icon { color: rgba(255, 255, 255, 0.95); filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4)); }
    .el-ad-live-campaign { color: #fff; font-size: 11px; font-weight: 600; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5); }
    .el-ad-live-media { color: rgba(255, 255, 255, 0.85); font-size: 9px; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5); }
    .el-ad-label { position: absolute; left: 0; right: 0; bottom: 4px; padding: 0 4px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .el-ad-play { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 3; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: none; border-radius: 50%; background: rgba(0, 0, 0, 0.45); color: #fff; cursor: pointer; transition: background 0.15s; }
    .el-ad-play:hover { background: rgba(0, 0, 0, 0.65); }
    .el-ad-play-active { opacity: 0.8; }
    .el-ad-play-hidden { opacity: 0; pointer-events: none; }
  `],
})
export class MenuboardThemeEditorScreenComponent implements OnInit, OnDestroy, AfterViewInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private storage = inject(StorageService);
  private cdr = inject(ChangeDetectorRef);
  dataService = inject(CsDataService);
  campaignsService = inject(CampaignsDataService);

  theme: ArrivalsTheme = { id: 0, name: 'Новая тема', resolution: '1024x768', screenMode: 'order-screen', elements: [] };
  panelCollapsed = false;
  panelView: PanelView = 'theme';
  selectedElementId: string | null = null;
  deleteElementTarget: ArrivalsThemeElement | null = null;
  toastMessage = '';
  canvasScale = 1;

  /** Тема содержит платный элемент (для баннера) */
  get themeHasPremium(): boolean {
    return this.theme.elements.some(e => e.type === 'area');
  }
  availableControls: ArrivalsControl[] = [];
  mockOrders: ArrivalsOrderMock[] = [...MOCK_ARRIVALS_ORDERS];
  externalMenuCategories = MOCK_EXTERNAL_MENU;
  dishSelectorOpen = false;
  dishSelectorIds: string[] = [];

  campaignSearchText = '';
  /** Свёрнутые папки в списке кампаний (по folderKey) */
  collapsedFolderIds: string[] = [];
  /** Инлайн-ошибка валидации выбора кампаний */
  advertiseValidationError = '';
  /** Области, которые сейчас проигрываются на канвасе (по id элемента) */
  playingAdvertiseIds = new Set<string>();
  /** Кнопка паузы видна у играющих областей (скрывается через секунду, появляется при наведении) */
  visiblePauseIds = new Set<string>();
  /** Таймеры скрытия кнопки паузы */
  private pauseHideTimers: Record<string, ReturnType<typeof setTimeout>> = {};
  /** Текущий индекс слайда для каждой проигрываемой области */
  private advertSlideIdx: Record<string, number> = {};
  /** Таймер смены слайдов на канвасе */
  private advertTimer: ReturnType<typeof setInterval> | null = null;
  /** Палитра-фолбэк для кампаний без медиа */
  private readonly AD_FALLBACK_COLORS = ['#5C6BC0', '#26A69A', '#EF5350', '#FFA726', '#AB47BC', '#42A5F5', '#66BB6A', '#EC407A'];

  /** Все id кампаний, попадающих под текущий поиск */
  get filteredCampaignIds(): number[] {
    const q = (this.campaignSearchText || '').trim().toLowerCase();
    return this.campaignsService.campaigns
      .filter(c => !q || c.name.toLowerCase().includes(q))
      .map(c => c.id);
  }

  /** Список кампаний с группировкой по папкам (DS-1121 5.3 + папки со стенда) */
  get campaignRows(): CampaignRow[] {
    const q = (this.campaignSearchText || '').trim().toLowerCase();
    const all = this.campaignsService.campaigns;
    const matches = (c: WebCampaign) => !q || c.name.toLowerCase().includes(q);
    const searching = !!q;
    const rows: CampaignRow[] = [];

    const pushFolder = (key: string, title: string, list: WebCampaign[], showWhenEmpty: boolean) => {
      // Пустые реальные папки показываем (структура повторяет раздел «Кампании»);
      // «Без папки» и пустые папки при поиске — скрываем
      if (!list.length && (!showWhenEmpty || searching)) return;
      const collapsed = !searching && this.collapsedFolderIds.includes(key);
      rows.push({ kind: 'header', folderKey: key, title, count: list.length, collapsed, campaignId: 0, campaignName: '', campaignDateFrom: '', campaignDateTo: '' });
      if (!collapsed) {
        for (const c of list) {
          rows.push({ kind: 'campaign', folderKey: '', title: '', count: 0, collapsed: false, campaignId: c.id, campaignName: c.name, campaignDateFrom: c.dateFrom, campaignDateTo: c.dateTo });
        }
      }
    };

    pushFolder('__root__', 'Без папки', all.filter(c => c.folderId == null && matches(c)), false);

    for (const f of this.campaignsService.folders) {
      pushFolder('f' + f.id, this.folderPathName(f.id), all.filter(c => c.folderId === f.id && matches(c)), true);
    }
    return rows;
  }

  /** Полный путь папки: «Родитель / Папка» */
  folderPathName(id: number): string {
    const parts: string[] = [];
    let cur: CampaignFolder | undefined = this.campaignsService.folders.find(f => f.id === id);
    let guard = 0;
    while (cur && guard++ < 20) {
      parts.unshift(cur.name);
      cur = cur.parentId != null ? this.campaignsService.folders.find(f => f.id === cur!.parentId) : undefined;
    }
    return parts.join(' / ');
  }

  toggleFolder(key: string): void {
    const i = this.collapsedFolderIds.indexOf(key);
    if (i >= 0) this.collapsedFolderIds.splice(i, 1);
    else this.collapsedFolderIds.push(key);
  }

  get allCampaignsSelected(): boolean {
    const ids = this.filteredCampaignIds;
    const sel = this.selectedElement?.campaignIds || [];
    return ids.length > 0 && ids.every(id => sel.includes(id));
  }

  get someCampaignsSelected(): boolean {
    const ids = this.filteredCampaignIds;
    const sel = this.selectedElement?.campaignIds || [];
    return ids.some(id => sel.includes(id)) && !this.allCampaignsSelected;
  }

  toggleSelectAll(): void {
    if (!this.selectedElement || this.selectedElement.type !== 'advertise') return;
    const ids = this.filteredCampaignIds;
    const sel = new Set(this.selectedElement.campaignIds || []);
    if (this.allCampaignsSelected) {
      ids.forEach(id => sel.delete(id));
    } else {
      ids.forEach(id => sel.add(id));
    }
    this.selectedElement.campaignIds = [...sel];
    if (this.selectedElement.campaignIds.length > 0) this.advertiseValidationError = '';
    // Смена кампаний останавливает проигрывание этой области
    this.stopAdvertisePlayback(this.selectedElement);
  }

  areaHelper = new AreaEmulationHelper();
  sim = new SimulatorHelper();

  @ViewChild('canvasAreaRef') canvasAreaRef!: ElementRef<HTMLDivElement>;

  dragState: { elementId: string; startMouseX: number; startMouseY: number; startElX: number; startElY: number } | null = null;
  resizeState: { elementId: string; handle: string; startMouseX: number; startMouseY: number; startElX: number; startElY: number; startElW: number; startElH: number } | null = null;

  /* ── List drag reorder ── */
  listDragIndex: number | null = null;
  listDragOverIndex: number | null = null;
  private listDragStartY = 0;
  private boundListMouseMove = this.onListMouseMove.bind(this);
  private boundListMouseUp = this.onListMouseUp.bind(this);

  private boundMouseMove = this.onDocMouseMove.bind(this);
  private boundMouseUp = this.onDocMouseUp.bind(this);

  resolutionOptions: SelectOption[] = [
    { value: '1024x768', label: '1024px / 768px' }, { value: '1366x768', label: '1366px / 768px' },
    { value: '1366x1000', label: '1366px / 1000px' }, { value: '1920x1080', label: '1920px / 1080px' },
  ];
  screenModeOptions: SelectOption[] = [
    { value: 'order-screen', label: 'Экран заказа' }, { value: 'welcome-screen', label: 'Экран приветствия' },
  ];
  elementTypes: { type: ArrivalsElementType; label: string }[] = [
    { type: 'menulist' as ArrivalsElementType, label: 'Меню-лист' },
    { type: 'advertise' as ArrivalsElementType, label: 'Рекламная область' },
    { type: 'text', label: 'Текст' }, { type: 'image', label: 'Изображение' },
    { type: 'counter' as ArrivalsElementType, label: 'Текущее время' },
    { type: 'qr' as ArrivalsElementType, label: 'QR-код' },
  ];

  themeCategories = MENUBOARD_THEME_CATEGORIES.map(cat => ({ ...cat, collapsed: cat.collapsed, elements: [...cat.elements] }));

  /* ── List drag reorder ── */
  onListMouseDown(index: number, event: MouseEvent): void {
    if (event.button !== 0) return;
    // Don't start drag if clicking the delete button
    const target = event.target as HTMLElement;
    if (target.closest('.el-list-delete')) return;
    event.preventDefault();
    this.listDragIndex = index;
    this.listDragOverIndex = index;
    this.listDragStartY = event.clientY;
    document.addEventListener('mousemove', this.boundListMouseMove);
    document.addEventListener('mouseup', this.boundListMouseUp);
  }

  private onListMouseMove(event: MouseEvent): void {
    if (this.listDragIndex === null) return;
    const items = document.querySelectorAll('.element-list-item');
    let closest = this.listDragIndex;
    let closestDist = Infinity;
    items.forEach((item, i) => {
      const rect = item.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const dist = Math.abs(event.clientY - midY);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    this.listDragOverIndex = closest;
  }

  private onListMouseUp(): void {
    if (this.listDragIndex !== null && this.listDragOverIndex !== null && this.listDragIndex !== this.listDragOverIndex) {
      const el = this.theme.elements.splice(this.listDragIndex, 1)[0];
      this.theme.elements.splice(this.listDragOverIndex, 0, el);
      // Переиндексация слоёв по новому порядку (z-порядок = позиция в списке)
      this.theme.elements.forEach((e, idx) => { e.layer = idx + 1; });
    }
    this.listDragIndex = null;
    this.listDragOverIndex = null;
    document.removeEventListener('mousemove', this.boundListMouseMove);
    document.removeEventListener('mouseup', this.boundListMouseUp);
  }

  get resWidth(): number { return parseInt(this.theme.resolution.split('x')[0]) || 1024; }
  get resHeight(): number { return parseInt(this.theme.resolution.split('x')[1]) || 768; }

  get selectedElement(): ArrivalsThemeElement | null {
    return this.selectedElementId ? (this.theme.elements.find(e => e.id === this.selectedElementId) ?? null) : null;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      const allThemes: ArrivalsTheme[] = this.storage.load('web-screens', 'menuboard-themes', [...MOCK_ARRIVALS_THEMES]);
      const found = allThemes.find(t => t.id === Number(id));
      if (found) this.theme = JSON.parse(JSON.stringify(found));
    } else {
      this.theme.id = Date.now();
    }
    // Миграция старой модели: панели → отдельные элементы «Рекламная область»
    this.expandLegacyAdvertisePanels();
    // Очистка «осиротевших» id кампаний + переименование легаси-элементов
    const knownIds = new Set(this.campaignsService.campaigns.map(c => c.id));
    for (const el of this.theme.elements) {
      if (el.type !== 'advertise') continue;
      if (el.name === 'Динамическая область') el.name = 'Рекламная область';
      if (el.campaignIds?.length) {
        el.campaignIds = el.campaignIds.filter(id => knownIds.has(id));
      }
    }
    // Нормализация слоёв: элементам без явного layer — позиция в списке
    this.theme.elements.forEach((el, i) => { if (el.layer == null) el.layer = i + 1; });
    this.availableControls = this.storage.load('web-screens', 'arrivals-controls', [...MOCK_ARRIVALS_CONTROLS]);

    // Handle return from control editor with newControlId (Save as Copy)
    const newControlId = this.route.snapshot.queryParamMap.get('newControlId');
    if (newControlId) {
      const ncId = Number(newControlId);
      const elementId = this.route.snapshot.queryParamMap.get('elementId');
      const targetEl = elementId
        ? this.theme.elements.find(e => e.id === elementId && e.type === 'area')
        : null;
      if (targetEl) {
        targetEl.areaControlId = ncId;
        this.selectedElementId = targetEl.id;
      }
      this.availableControls = this.storage.load('web-screens', 'arrivals-controls', [...MOCK_ARRIVALS_CONTROLS]);
      this.save();
    }

    setTimeout(() => this.updateCanvasScale(), 0);
  }

  ngAfterViewInit(): void { this.updateCanvasScale(); }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    document.removeEventListener('mousemove', this.boundListMouseMove);
    document.removeEventListener('mouseup', this.boundListMouseUp);
    if (this.advertTimer) { clearInterval(this.advertTimer); this.advertTimer = null; }
    Object.values(this.pauseHideTimers).forEach(t => clearTimeout(t));
    this.pauseHideTimers = {};
    this.areaHelper.clearAll();
    this.sim.stopAuto();
  }

  onResolutionChange(): void { setTimeout(() => this.updateCanvasScale(), 0); }
  @HostListener('window:resize') onWindowResize(): void { this.updateCanvasScale(); }

  updateCanvasScale(): void {
    if (!this.canvasAreaRef?.nativeElement) return;
    const c = this.canvasAreaRef.nativeElement;
    const newScale = Math.min((c.clientWidth - 16) / this.resWidth, (c.clientHeight - 16) / this.resHeight, 1);
    if (this.canvasScale !== newScale) {
      this.canvasScale = newScale;
      this.cdr.detectChanges();
    }
  }

  onCanvasClick(): void { if (!this.dragState && !this.resizeState) this.deselectElement(); }

  getFilterSource(): ArrivalsOrderMock[] {
    return this.sim.active ? this.sim.orders : this.mockOrders;
  }

  /* Drag & Resize */
  onElementMouseDown(event: MouseEvent, el: ArrivalsThemeElement): void {
    if (event.button !== 0 || (event.target as HTMLElement).closest('.handle, .el-ad-play')) return;
    event.preventDefault(); event.stopPropagation();
    this.selectedElementId = el.id; this.panelView = 'element';
    this.dragState = { elementId: el.id, startMouseX: event.clientX, startMouseY: event.clientY, startElX: el.x, startElY: el.y };
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
  }

  onHandleMouseDown(event: MouseEvent, el: ArrivalsThemeElement, handle: string): void {
    event.preventDefault(); event.stopPropagation();
    this.resizeState = { elementId: el.id, handle, startMouseX: event.clientX, startMouseY: event.clientY, startElX: el.x, startElY: el.y, startElW: el.width, startElH: el.height };
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
  }

  private onDocMouseMove(event: MouseEvent): void {
    const s = this.canvasScale;
    if (this.dragState) {
      const el = this.theme.elements.find(e => e.id === this.dragState!.elementId);
      if (el) { el.x = Math.max(0, Math.round(this.dragState.startElX + (event.clientX - this.dragState.startMouseX) / s)); el.y = Math.max(0, Math.round(this.dragState.startElY + (event.clientY - this.dragState.startMouseY) / s)); }
    }
    if (this.resizeState) {
      const el = this.theme.elements.find(e => e.id === this.resizeState!.elementId);
      if (el) {
        const dx = (event.clientX - this.resizeState.startMouseX) / s, dy = (event.clientY - this.resizeState.startMouseY) / s, h = this.resizeState.handle, min = 20;
        if (h.includes('r')) el.width = Math.max(min, Math.round(this.resizeState.startElW + dx));
        if (h.includes('l')) { const nw = Math.max(min, Math.round(this.resizeState.startElW - dx)); el.x = Math.max(0, Math.round(this.resizeState.startElX + this.resizeState.startElW - nw)); el.width = nw; }
        if (h.includes('b')) el.height = Math.max(min, Math.round(this.resizeState.startElH + dy));
        if (h.includes('t')) { const nh = Math.max(min, Math.round(this.resizeState.startElH - dy)); el.y = Math.max(0, Math.round(this.resizeState.startElY + this.resizeState.startElH - nh)); el.height = nh; }
      }
    }
  }

  private onDocMouseUp(): void {
    this.dragState = null; this.resizeState = null;
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
  }

  /* Selection */
  selectElement(id: string, event: Event): void { event.stopPropagation(); this.selectedElementId = id; this.campaignSearchText = ''; this.advertiseValidationError = ''; this.panelView = 'element'; }
  selectElementFromList(id: string): void { this.selectedElementId = id; this.campaignSearchText = ''; this.advertiseValidationError = ''; this.panelView = 'element'; }
  deselectElement(): void { this.selectedElementId = null; this.campaignSearchText = ''; this.advertiseValidationError = ''; this.panelView = 'theme'; }

  /* Price helpers */
  getPricePreview(el: ArrivalsThemeElement): string {
    const value = String(el.previewPrice ?? 350);
    if (!el.showCurrency) return value;
    const sym = el.currencySymbol || '₽';
    return el.currencyPosition === 'before' ? sym + ' ' + value : value + ' ' + sym;
  }

  getPriceTooltip(el: ArrivalsThemeElement): string {
    if (el.bindingType === 'modifier' && el.modifierName) return 'Модификатор: ' + el.modifierName;
    if (el.bindingType === 'size' && el.productName && el.sizeName) return el.productName + ' ' + el.sizeName;
    if (el.bindingType === 'product' && el.productName) return el.productName;
    return 'Товар не привязан';
  }

  /* Advertise helpers */
  getAdvertiseLabel(el: ArrivalsThemeElement): string {
    if (el.type !== 'advertise') return el.name;
    const camps = (el.campaignIds || []).map(id => this.getCampaignName(id)).filter(Boolean);
    if (!camps.length) return 'Рекламная область';
    if (camps.length === 1) return camps[0];
    return `${camps.length} ${this.pluralCampaigns(camps.length)}`;
  }

  /** Полный список кампаний (для tooltip на канвасе) */
  getAdvertiseFullLabel(el: ArrivalsThemeElement): string {
    if (el.type !== 'advertise') return el.name;
    const camps = (el.campaignIds || []).map(id => this.getCampaignName(id)).filter(Boolean);
    return camps.length ? camps.join(', ') : 'Рекламная область';
  }

  /** Склонение слова «кампания» */
  pluralCampaigns(n: number): string {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return 'кампания';
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'кампании';
    return 'кампаний';
  }

  /** Название кампании по id */
  getCampaignName(campId: number): string {
    return this.campaignsService.getCampaign(campId)?.name ?? '';
  }

  /** Перейти в раздел «Кампании» для создания новой */
  goToCampaigns(): void {
    this.router.navigate(['/prototype/web-screens/campaigns']);
  }

  /* ── Живой показ на канвасе (Play/Stop) ── */
  isAdvertisePlaying(id: string): boolean { return this.playingAdvertiseIds.has(id); }

  /** Play/Stop по клику на кнопку области (как у плеера) */
  toggleAdvertisePlay(id: string, event: Event): void {
    event.stopPropagation();
    const el = this.theme.elements.find(e => e.id === id);
    if (!el || el.type !== 'advertise' || this.getAdvertiseSlides(el).length === 0) return;
    if (this.playingAdvertiseIds.has(id)) {
      this.playingAdvertiseIds.delete(id);
      delete this.advertSlideIdx[id];
      this.clearPauseHide(id);
      this.visiblePauseIds.delete(id);
    } else {
      this.playingAdvertiseIds.add(id);
      this.advertSlideIdx[id] = 0;
      this.visiblePauseIds.add(id);
      this.schedulePauseHide(id);
    }
    this.syncAdvertiseTimer();
  }

  /** Остановить проигрывание конкретной области (при изменении её кампаний) */
  stopAdvertisePlayback(el: ArrivalsThemeElement): void {
    if (this.playingAdvertiseIds.delete(el.id)) {
      delete this.advertSlideIdx[el.id];
      this.clearPauseHide(el.id);
      this.visiblePauseIds.delete(el.id);
      this.syncAdvertiseTimer();
    }
  }

  /** Видна ли кнопка паузы у области */
  isPauseVisible(id: string): boolean { return this.visiblePauseIds.has(id); }

  /** При наведении на играющую область показать паузу; при уходе — снова спрятать через секунду */
  onAdvertiseAreaHover(el: ArrivalsThemeElement, over: boolean): void {
    if (el.type !== 'advertise' || !this.playingAdvertiseIds.has(el.id)) return;
    if (over) {
      this.clearPauseHide(el.id);
      this.visiblePauseIds.add(el.id);
    } else {
      this.schedulePauseHide(el.id);
    }
    this.cdr.detectChanges();
  }

  private schedulePauseHide(id: string): void {
    this.clearPauseHide(id);
    this.pauseHideTimers[id] = setTimeout(() => {
      this.visiblePauseIds.delete(id);
      this.cdr.detectChanges();
    }, 1200);
  }

  private clearPauseHide(id: string): void {
    if (this.pauseHideTimers[id]) { clearTimeout(this.pauseHideTimers[id]); delete this.pauseHideTimers[id]; }
  }

  /** Слайды рекламы области: по одному на выбранную кампанию (первое медиа кампании) */
  getAdvertiseSlides(el: ArrivalsThemeElement): AdvertiseSlide[] {
    const slides: AdvertiseSlide[] = [];
    (el.campaignIds || []).forEach((campaignId, idx) => {
      const c = this.campaignsService.getCampaign(campaignId);
      if (!c) return;
      let media: CampaignMedia | undefined;
      const res = c.resolutions?.[0];
      if (res) {
        const modes = res.modes || {};
        const order = modes['order']?.length ? modes['order'] : Object.values(modes).find(m => m?.length);
        media = order?.[0];
      }
      slides.push({
        campaignId,
        campaignName: c.name,
        mediaName: media?.name ?? 'Рекламный ролик',
        mediaType: media?.type ?? 'video/mp4',
        color: media?.color ?? this.AD_FALLBACK_COLORS[idx % this.AD_FALLBACK_COLORS.length],
      });
    });
    return slides;
  }

  /** Текущий слайд проигрываемой области */
  currentAdvertiseSlide(el: ArrivalsThemeElement): AdvertiseSlide | null {
    const slides = this.getAdvertiseSlides(el);
    if (!slides.length) return null;
    const idx = this.advertSlideIdx[el.id] ?? 0;
    return slides[((idx % slides.length) + slides.length) % slides.length];
  }

  /** Запустить/остановить общий таймер смены слайдов (по факту играющих областей) */
  private syncAdvertiseTimer(): void {
    if (this.playingAdvertiseIds.size === 0) {
      if (this.advertTimer) { clearInterval(this.advertTimer); this.advertTimer = null; }
      return;
    }
    if (this.advertTimer) return;
    this.advertTimer = setInterval(() => {
      let changed = false;
      for (const el of this.theme.elements) {
        if (el.type !== 'advertise' || !this.playingAdvertiseIds.has(el.id)) continue;
        const slides = this.getAdvertiseSlides(el);
        if (slides.length < 2) continue;
        this.advertSlideIdx[el.id] = ((this.advertSlideIdx[el.id] ?? 0) + 1) % slides.length;
        changed = true;
      }
      if (changed) this.cdr.detectChanges();
    }, 2600);
  }

  /** Суммарное количество уникальных кампаний области (только реально существующие) */
  getAdvertiseCampaignCount(el: ArrivalsThemeElement): number {
    if (el.type !== 'advertise') return 0;
    const known = new Set(this.campaignsService.campaigns.map(c => c.id));
    return (el.campaignIds || []).filter(id => known.has(id)).length;
  }

  /** Миграция старой модели: каждая Advertise-панель становится отдельной «Рекламной областью» */
  expandLegacyAdvertisePanels(): void {
    const extra: ArrivalsThemeElement[] = [];
    for (const el of this.theme.elements) {
      if (el.type !== 'advertise') continue;
      if (el.panels && el.panels.length > 0) {
        el.panels.forEach((p, i) => {
          if (i === 0) {
            el.campaignIds = [...(p.campaignIds || [])];
          } else {
            const clone: ArrivalsThemeElement = JSON.parse(JSON.stringify(el));
            clone.id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
            delete clone.panels;
            delete (clone as any).companyId;
            clone.campaignIds = [...(p.campaignIds || [])];
            clone.x = el.x + i * 20;
            clone.y = el.y + i * 20;
            extra.push(clone);
          }
        });
        delete el.panels;
        delete (el as any).companyId;
      } else {
        delete el.panels;
        delete (el as any).companyId;
      }
    }
    this.theme.elements.push(...extra);
  }

  /* Campaign multi-select helpers */
  toggleCampaign(campId: number): void {
    if (!this.selectedElement || this.selectedElement.type !== 'advertise') return;
    const ids = this.selectedElement.campaignIds ?? (this.selectedElement.campaignIds = []);
    const idx = ids.indexOf(campId);
    if (idx >= 0) {
      ids.splice(idx, 1);
    } else {
      ids.push(campId);
    }
    if (ids.length > 0) this.advertiseValidationError = '';
    // Смена кампаний останавливает проигрывание этой области (правило плеера)
    this.stopAdvertisePlayback(this.selectedElement);
  }

  isCampaignSelected(campId: number): boolean {
    return this.selectedElement?.campaignIds?.includes(campId) ?? false;
  }

  get selectedCampaignCount(): number {
    const el = this.selectedElement;
    if (!el) return 0;
    const ids = el.campaignIds || [];
    if (el.type !== 'advertise') return ids.length;
    const known = new Set(this.campaignsService.campaigns.map(c => c.id));
    return ids.filter(id => known.has(id)).length;
  }

  getDishData(productId: string): ExternalMenuItem | undefined {
    // Parse composite ID: externalId::sizeIndex
    const parts = productId.split('::');
    const externalId = parts[0];
    const sizeIndex = parts.length > 1 ? parseInt(parts[1], 10) : -1;

    for (const cat of this.externalMenuCategories) {
      const dish = cat.items.find(d => d.externalId === externalId);
      if (!dish) continue;
      // If a specific size is selected, return dish with size-specific overrides
      if (sizeIndex >= 0 && dish.sizes && dish.sizes[sizeIndex]) {
        const size = dish.sizes[sizeIndex];
        return {
          ...dish,
          name: dish.name + ' ' + size.name,
          price: size.price,
          sizes: undefined, // Hide sizes list — only one size selected
        };
      }
      return dish;
    }
    return undefined;
  }

  /** Get display name for a productId (for inspector selected-dishes list) */
  getDishDisplayName(productId: string): string {
    const dish = this.getDishData(productId);
    return dish?.name || '#' + productId.slice(0, 10);
  }

  /** Get display price for a productId */
  getDishDisplayPrice(productId: string): string {
    const dish = this.getDishData(productId);
    return dish ? dish.price + ' \u20BD' : '';
  }

  getRowBg(el: ArrivalsThemeElement, odd: boolean): string {
    const primary = el.rowBgTransparent ? 'transparent' : (el.rowBgColor || '#ffffff');
    const alt = el.highlightTransparent ? 'transparent' : (el.highlightColor || '#f5f5f5');
    if (!el.alternateRows) return primary;
    return odd ? alt : primary;
  }

  formatSizes(sizes?: { name: string; price: number }[]): string {
    if (!sizes?.length) return '';
    return sizes.map(s => s.name + ' (' + s.price + '\u20BD)').join(' \u00B7 ');
  }

  openDishSelector(): void {
    this.dishSelectorIds = [...(this.selectedElement?.productIds || [])];
    this.dishSelectorOpen = true;
  }

  onDishSelectorConfirm(ids: string[]): void {
    if (this.selectedElement) {
      this.selectedElement.productIds = ids;
    }
    this.dishSelectorOpen = false;
  }

  removeDishFromList(externalId: string): void {
    if (this.selectedElement?.productIds) {
      this.selectedElement.productIds = this.selectedElement.productIds.filter(id => id !== externalId);
    }
  }

  formatCampaignDate(dateStr: string): string {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }

  /* ── DS-1121: слой, QR, фон Advertise ── */
  getElementZIndex(el: ArrivalsThemeElement, i: number): number {
    return el.layer ?? (this.theme.elements.length - i);
  }

  getQrLayer(): number | null {
    const qr = this.theme.elements.find(e => e.type === 'qr');
    return qr ? (qr.layer ?? 1) : null;
  }

  getAdvertiseLayerError(el: ArrivalsThemeElement): string {
    const qrLayer = this.getQrLayer();
    if (qrLayer != null && (el.layer ?? 1) >= qrLayer) {
      return 'Реклама должна отображаться ниже QR-кода';
    }
    return '';
  }

  hexToRgba(hex: string, opacityPct: number): string {
    if (!hex) return 'transparent';
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return 'transparent';
    const alpha = Math.min(100, Math.max(0, opacityPct ?? 100)) / 100;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  getAdvertiseBg(el: ArrivalsThemeElement): string {
    return this.hexToRgba(el.bgColor || '#ffffff', el.bgOpacity ?? 100);
  }

  /* Add / Delete */
  addElement(type: ArrivalsElementType): void {
    // Сообщение при добавлении платного элемента без лицензии (вариант E)
    if (type === 'area' && !this.dataService.hasPremiumLicense) {
      this.showToast('Вы добавляете платный элемент. Он будет недоступен на экране без платной лицензии.');
    }
    const label = this.elementTypes.find(et => et.type === type)?.label ?? type;
    const el: ArrivalsThemeElement = { id: Date.now().toString() + Math.random().toString(36).slice(2, 6), type, name: label, x: 20 + this.theme.elements.length * 20, y: 20 + this.theme.elements.length * 20, width: 120, height: 60, borderWidth: 1, borderColor: '#000000', borderRadius: 0, layer: this.theme.elements.length + 1 };
    if (type === 'text') { el.text = 'Type something'; el.fontFamily = 'Arial'; el.fontSize = 14; el.fontBold = false; el.fontItalic = false; el.textAlign = 'left'; }
    if (type === 'price') { el.name = 'Цена блюда'; el.fontFamily = 'Arial'; el.fontSize = 14; el.fontBold = false; el.fontItalic = false; el.textAlign = 'left'; el.productId = undefined; el.productName = undefined; el.sizeId = null; el.sizeName = undefined; el.showCurrency = true; el.currencySymbol = '₽'; el.currencyPosition = 'after'; }
    if (type === 'area') { el.name = 'Область контрола'; el.width = 300; el.height = 500; el.borderWidth = 2; el.borderColor = '#90CAF9'; el.borderRadius = 4; el.areaBgColor = '#ffffff'; el.areaControlId = this.availableControls.length > 0 ? this.availableControls[0].id : undefined; el.areaMode = 'list'; el.areaListDirection = 'top'; el.areaMaxColumns = 1; el.areaStatusType = 'kitchen'; el.areaStatuses = []; el.areaOrderTypes = ['ordinary', 'courier', 'pickup']; el.areaOrderSources = []; el.areaSortOrder = 'oldest-first'; el.areaInterlineSpacing = 0; }
    if (type === 'advertise') { el.name = 'Рекламная область'; el.width = 200; el.height = 150; el.campaignIds = []; el.layer = 1; el.bgColor = '#ffffff'; el.bgOpacity = 100; }
    if (type === 'qr') { el.name = 'QR-код'; el.width = 200; el.height = 200; el.layer = 100; }
    if (type === 'menulist') { el.name = 'Меню-лист'; el.width = 400; el.height = 300; el.productIds = []; el.rowHeight = 48; el.alternateRows = true; el.rowPadding = 4; el.rowBgColor = '#ffffff'; el.rowBgTransparent = false; el.highlightColor = '#f5f5f5'; el.highlightTransparent = false; el.showIcons = true; el.showDescription = false; el.showAllergens = false; el.showNutrition = false; el.nutritionColor = '#999999'; el.allergensColor = '#e65100'; el.fontName = { size: 16, family: 'Segoe UI', color: '#333333', bold: false, italic: false }; el.fontModifiers = { size: 12, family: 'Segoe UI', color: '#666666', bold: false, italic: false }; el.fontPrice = { size: 16, family: 'Segoe UI', color: '#CC0000', bold: false, italic: false }; el.fontDescription = { size: 11, family: 'Segoe UI', color: '#999999', bold: false, italic: false }; }
    if (type === 'counter') { el.name = 'Текущее время'; el.width = 100; el.height = 40; el.fontFamily = 'Arial'; el.fontSize = 16; el.fontBold = false; el.fontItalic = false; el.textAlign = 'center'; el.text = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }); }
    this.theme.elements.push(el);
    this.selectedElementId = el.id; this.panelView = 'element';
  }

  requestDeleteElement(el: ArrivalsThemeElement, event: Event): void { event.stopPropagation(); this.deleteElementTarget = el; }
  confirmDeleteElement(): void {
    if (this.deleteElementTarget) {
      this.stopAdvertisePlayback(this.deleteElementTarget);
      this.theme.elements = this.theme.elements.filter(e => e.id !== this.deleteElementTarget!.id);
      if (this.selectedElementId === this.deleteElementTarget.id) this.deselectElement();
      this.deleteElementTarget = null;
    }
  }

  onAreaControlChange(): void { if (this.selectedElement) { this.areaHelper.reset(this.selectedElement.id); this.availableControls = this.storage.load('web-screens', 'arrivals-controls', [...MOCK_ARRIVALS_CONTROLS]); } }

  /* Save */
  save(): void {
    // Валидация по DS-1121 (разделы 5.3, 5.4; ошибки 1–3):
    // минимум одна кампания у каждой рекламной области; слой Advertise строго ниже слоя QR-кода
    const qrEl = this.theme.elements.find(e => e.type === 'qr');
    for (const el of this.theme.elements) {
      if (el.type !== 'advertise') continue;
      if (this.getAdvertiseCampaignCount(el) === 0) {
        this.selectedElementId = el.id; this.panelView = 'element';
        this.advertiseValidationError = this.campaignsService.campaigns.length === 0
          ? 'Нет доступных кампаний. Создайте кампанию в разделе «Кампании».'
          : 'Выберите хотя бы одну рекламную кампанию';
        this.showToast(this.advertiseValidationError);
        return;
      }
      if (qrEl && (el.layer ?? 1) >= (qrEl.layer ?? 1)) {
        this.selectedElementId = el.id; this.panelView = 'element';
        this.showToast(`«${el.name}»: реклама должна отображаться ниже QR-кода`);
        return;
      }
    }
    const allThemes: ArrivalsTheme[] = this.storage.load('web-screens', 'menuboard-themes', [...MOCK_ARRIVALS_THEMES]);
    const idx = allThemes.findIndex(t => t.id === this.theme.id);
    if (idx >= 0) allThemes[idx] = JSON.parse(JSON.stringify(this.theme)); else allThemes.push(JSON.parse(JSON.stringify(this.theme)));
    this.storage.save('web-screens', 'menuboard-themes', allThemes);
    const list: any[] = this.storage.load('web-screens', 'menuboard-list', []);
    if (!list.find((i: any) => i.id === this.theme.id)) { list.push({ id: this.theme.id, name: this.theme.name, itemType: 'theme', resolution: this.theme.resolution, createdBy: 'Моя' }); this.storage.save('web-screens', 'menuboard-list', list); }
    this.showToast('Тема сохранена');
  }

  goBack(): void { this.router.navigate(['/prototype/web-screens/menuboard-themes']); }

  onEditControl(controlId: number): void {
    this.save();
    this.router.navigate(['/prototype/web-screens/menuboard-control-editor', controlId], {
      queryParams: { return: 'menuboard-theme-editor', themeId: this.theme.id, elementId: this.selectedElementId }
    });
  }
  private showToast(msg: string): void { this.toastMessage = msg; setTimeout(() => (this.toastMessage = ''), 3000); }
}
