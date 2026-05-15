import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UiBreadcrumbsComponent, UiDividerComponent } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'app-dt-components-screen',
  standalone: true,
  imports: [CommonModule, UiBreadcrumbsComponent, UiDividerComponent, IconsModule],
  template: `
    <div class="max-w-6xl mx-auto animate-fade-in">
      <ui-breadcrumbs
        [items]="breadcrumbs"
      ></ui-breadcrumbs>

      <!-- ==================== BUTTONS ==================== -->
      <section class="mb-10">
        <h2 class="text-lg font-medium text-text-primary mb-1">Button</h2>
        <p class="text-sm text-text-secondary mb-4">5 цветов × 3 варианта (Filled, Outlined, Text) × состояния. Токен: <code>component.Button</code></p>

        <!-- Filled Buttons -->
        <h3 class="text-sm font-medium text-text-secondary mb-3 mt-4">Filled</h3>
        <div class="bg-white rounded-lg border border-border p-6 mb-4">
          <div class="flex flex-wrap gap-3 mb-4">
            <div *ngFor="let btn of filledButtons" class="flex flex-col items-center gap-2">
              <button
                class="px-4 py-2 rounded text-sm font-medium transition-colors"
                [style.background-color]="btn.bg"
                [style.color]="btn.text"
              >{{ btn.label }}</button>
              <span class="text-[10px] text-text-tertiary">Default</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-3 mb-4">
            <div *ngFor="let btn of filledHoverButtons" class="flex flex-col items-center gap-2">
              <button
                class="px-4 py-2 rounded text-sm font-medium"
                [style.background-color]="btn.bg"
                [style.color]="btn.text"
              >{{ btn.label }}</button>
              <span class="text-[10px] text-text-tertiary">Hover</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-3">
            <div *ngFor="let btn of filledPressButtons" class="flex flex-col items-center gap-2">
              <button
                class="px-4 py-2 rounded text-sm font-medium"
                [style.background-color]="btn.bg"
                [style.color]="btn.text"
              >{{ btn.label }}</button>
              <span class="text-[10px] text-text-tertiary">Press</span>
            </div>
          </div>
        </div>

        <!-- Outlined Buttons -->
        <h3 class="text-sm font-medium text-text-secondary mb-3">Outlined</h3>
        <div class="bg-white rounded-lg border border-border p-6 mb-4">
          <div class="flex flex-wrap gap-3">
            <div *ngFor="let btn of outlinedButtons" class="flex flex-col items-center gap-2">
              <button
                class="px-4 py-2 rounded text-sm font-medium bg-transparent"
                [style.border]="'1.5px solid ' + btn.border"
                [style.color]="btn.text"
              >{{ btn.label }}</button>
              <span class="text-[10px] text-text-tertiary">Default</span>
            </div>
          </div>
        </div>

        <!-- Text Buttons -->
        <h3 class="text-sm font-medium text-text-secondary mb-3">Text</h3>
        <div class="bg-white rounded-lg border border-border p-6 mb-4">
          <div class="flex flex-wrap gap-3">
            <div *ngFor="let btn of textButtons" class="flex flex-col items-center gap-2">
              <button
                class="px-4 py-2 rounded text-sm font-medium bg-transparent border-none"
                [style.color]="btn.text"
              >{{ btn.label }}</button>
              <span class="text-[10px] text-text-tertiary">Default</span>
            </div>
          </div>
        </div>

        <!-- Disabled Button -->
        <h3 class="text-sm font-medium text-text-secondary mb-3">Disabled</h3>
        <div class="bg-white rounded-lg border border-border p-6">
          <div class="flex gap-4">
            <button class="px-4 py-2 rounded text-sm font-medium" style="background: #F5F5F5; color: #BDBDBD;" disabled>
              Filled Disabled
            </button>
            <button class="px-4 py-2 rounded text-sm font-medium bg-transparent" style="border: 1.5px solid #E0E0E0; color: #BDBDBD;" disabled>
              Outlined Disabled
            </button>
            <button class="px-4 py-2 rounded text-sm font-medium bg-transparent border-none" style="color: #BDBDBD;" disabled>
              Text Disabled
            </button>
          </div>
        </div>
      </section>

      <ui-divider></ui-divider>

      <!-- ==================== BUTTON ICON ==================== -->
      <section class="mb-10 mt-8">
        <h2 class="text-lg font-medium text-text-primary mb-1">Button Icon</h2>
        <p class="text-sm text-text-secondary mb-4">Иконочные кнопки. Токен: <code>component.ButtonIcon</code></p>
        <div class="bg-white rounded-lg border border-border p-6">
          <div class="flex gap-4 items-center">
            <div *ngFor="let btn of iconButtons" class="flex flex-col items-center gap-2">
              <button
                class="w-10 h-10 rounded-lg flex items-center justify-center"
                [style.background-color]="btn.bg"
              >
                <lucide-icon name="plus" [size]="20" [style.color]="btn.icon"></lucide-icon>
              </button>
              <span class="text-[10px] text-text-tertiary">{{ btn.label }}</span>
            </div>
          </div>
        </div>
      </section>

      <ui-divider></ui-divider>

      <!-- ==================== CHIPS ==================== -->
      <section class="mb-10 mt-8">
        <h2 class="text-lg font-medium text-text-primary mb-1">Chips</h2>
        <p class="text-sm text-text-secondary mb-4">Токен: <code>component.Chips</code></p>
        <div class="bg-white rounded-lg border border-border p-6">
          <div class="flex flex-wrap gap-3">
            <div *ngFor="let chip of chips"
              class="px-3 py-1.5 rounded-full text-sm font-medium"
              [style.background-color]="chip.bg"
              [style.color]="chip.text"
              [style.border]="chip.border ? '1px solid ' + chip.border : 'none'"
            >{{ chip.label }}</div>
          </div>
        </div>
      </section>

      <ui-divider></ui-divider>

      <!-- ==================== INPUT ==================== -->
      <section class="mb-10 mt-8">
        <h2 class="text-lg font-medium text-text-primary mb-1">Input</h2>
        <p class="text-sm text-text-secondary mb-4">Filled и Outlined варианты × состояния. Токен: <code>component.Input</code></p>

        <h3 class="text-sm font-medium text-text-secondary mb-3">Filled</h3>
        <div class="bg-white rounded-lg border border-border p-6 mb-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div *ngFor="let inp of filledInputs" class="flex flex-col gap-1">
              <label class="text-xs text-text-tertiary">{{ inp.state }}</label>
              <div
                class="px-3 py-2.5 rounded-t text-sm"
                [style.background-color]="inp.bg"
                [style.color]="inp.text"
                [style.border-bottom]="'2px solid ' + inp.borderBottom"
              >{{ inp.placeholder }}</div>
            </div>
          </div>
        </div>

        <h3 class="text-sm font-medium text-text-secondary mb-3">Outlined</h3>
        <div class="bg-white rounded-lg border border-border p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div *ngFor="let inp of outlinedInputs" class="flex flex-col gap-1">
              <label class="text-xs text-text-tertiary">{{ inp.state }}</label>
              <div
                class="px-3 py-2.5 rounded text-sm bg-white"
                [style.color]="inp.text"
                [style.border]="'1.5px solid ' + inp.border"
              >{{ inp.placeholder }}</div>
            </div>
          </div>
        </div>
      </section>

      <ui-divider></ui-divider>

      <!-- ==================== CHECKBOX / RADIO / TOGGLE ==================== -->
      <section class="mb-10 mt-8">
        <h2 class="text-lg font-medium text-text-primary mb-1">Checkbox, Radio, Toggle</h2>
        <p class="text-sm text-text-secondary mb-4">Элементы выбора. Токены: <code>component.Checkbox</code>, <code>component.RadioButton</code>, <code>component.SlideToggle</code></p>

        <div class="bg-white rounded-lg border border-border p-6">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <!-- Checkbox -->
            <div>
              <h4 class="text-xs font-medium text-text-secondary mb-3">Checkbox</h4>
              <div class="space-y-3">
                <div *ngFor="let cb of checkboxes" class="flex items-center gap-2">
                  <div
                    class="w-5 h-5 rounded flex items-center justify-center text-white text-xs"
                    [style.background-color]="cb.bg"
                    [style.border]="cb.border ? '2px solid ' + cb.border : 'none'"
                  >
                    <span *ngIf="cb.checked">✓</span>
                    <span *ngIf="cb.indeterminate">—</span>
                  </div>
                  <span class="text-sm" [style.color]="cb.labelColor">{{ cb.label }}</span>
                </div>
              </div>
            </div>

            <!-- Radio -->
            <div>
              <h4 class="text-xs font-medium text-text-secondary mb-3">RadioButton</h4>
              <div class="space-y-3">
                <div *ngFor="let rb of radioButtons" class="flex items-center gap-2">
                  <div
                    class="w-5 h-5 rounded-full flex items-center justify-center"
                    [style.border]="'2px solid ' + rb.border"
                    [style.background-color]="rb.bg"
                  >
                    <div *ngIf="rb.selected" class="w-2.5 h-2.5 rounded-full" [style.background-color]="rb.dot"></div>
                  </div>
                  <span class="text-sm" [style.color]="rb.labelColor">{{ rb.label }}</span>
                </div>
              </div>
            </div>

            <!-- Toggle -->
            <div>
              <h4 class="text-xs font-medium text-text-secondary mb-3">SlideToggle</h4>
              <div class="space-y-3">
                <div *ngFor="let tg of toggles" class="flex items-center gap-2">
                  <div
                    class="w-10 h-6 rounded-full relative"
                    [style.background-color]="tg.trackBg"
                  >
                    <div
                      class="w-4 h-4 rounded-full absolute top-1"
                      [style.left]="tg.on ? '22px' : '4px'"
                      [style.background-color]="tg.thumbBg"
                    ></div>
                  </div>
                  <span class="text-sm" [style.color]="tg.labelColor">{{ tg.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ui-divider></ui-divider>

      <!-- ==================== STATUS ==================== -->
      <section class="mb-10 mt-8">
        <h2 class="text-lg font-medium text-text-primary mb-1">Status</h2>
        <p class="text-sm text-text-secondary mb-4">Статусные бейджи. Токен: <code>component.Status</code></p>
        <div class="bg-white rounded-lg border border-border p-6">
          <div class="flex flex-wrap gap-3">
            <div *ngFor="let st of statuses"
              class="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
              [style.background-color]="st.bg"
              [style.color]="st.text"
            >
              <div class="w-2 h-2 rounded-full" [style.background-color]="st.dot"></div>
              {{ st.label }}
            </div>
          </div>
        </div>
      </section>

      <ui-divider></ui-divider>

      <!-- ==================== TABS ==================== -->
      <section class="mb-10 mt-8">
        <h2 class="text-lg font-medium text-text-primary mb-1">Tabs</h2>
        <p class="text-sm text-text-secondary mb-4">Токен: <code>component.Tab</code></p>
        <div class="bg-white rounded-lg border border-border p-6">
          <div class="flex border-b border-border">
            <div *ngFor="let tab of tabs; let i = index"
              class="px-4 py-2.5 text-sm font-medium cursor-pointer"
              [style.color]="tab.active ? '#448AFF' : '#757575'"
              [style.border-bottom]="tab.active ? '2px solid #448AFF' : '2px solid transparent'"
            >{{ tab.label }}</div>
          </div>
        </div>
      </section>

      <ui-divider></ui-divider>

      <!-- ==================== BADGE ==================== -->
      <section class="mb-10 mt-8">
        <h2 class="text-lg font-medium text-text-primary mb-1">Badge</h2>
        <p class="text-sm text-text-secondary mb-4">Токен: <code>component.Badge</code></p>
        <div class="bg-white rounded-lg border border-border p-6">
          <div class="flex items-center gap-6">
            <div *ngFor="let b of badges" class="flex flex-col items-center gap-2">
              <div class="relative">
                <div class="w-10 h-10 rounded-lg bg-surface-secondary flex items-center justify-center">
                  <lucide-icon name="bell" [size]="20" class="text-text-secondary"></lucide-icon>
                </div>
                <span
                  class="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[10px] font-medium flex items-center justify-center px-1"
                  [style.background-color]="b.bg"
                  [style.color]="b.text"
                >{{ b.value }}</span>
              </div>
              <span class="text-[10px] text-text-tertiary">{{ b.label }}</span>
            </div>
          </div>
        </div>
      </section>

      <ui-divider></ui-divider>

      <!-- ==================== CARD ==================== -->
      <section class="mb-10 mt-8">
        <h2 class="text-lg font-medium text-text-primary mb-1">Card</h2>
        <p class="text-sm text-text-secondary mb-4">Токен: <code>component.Card</code></p>
        <div class="bg-gray-50 rounded-lg border border-border p-6">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div *ngFor="let card of cards"
              class="rounded-lg p-4"
              [style.background-color]="card.bg"
              [style.border]="'1px solid ' + card.border"
              [style.box-shadow]="card.shadow"
            >
              <h4 class="text-sm font-medium" [style.color]="card.titleColor">{{ card.title }}</h4>
              <p class="text-xs mt-1" [style.color]="card.descColor">{{ card.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <ui-divider></ui-divider>

      <!-- ==================== DIALOG ==================== -->
      <section class="mb-10 mt-8">
        <h2 class="text-lg font-medium text-text-primary mb-1">Dialog</h2>
        <p class="text-sm text-text-secondary mb-4">Токен: <code>component.Dialog</code></p>
        <div class="bg-gray-100 rounded-lg border border-border p-8 flex items-center justify-center">
          <div
            class="rounded-xl p-6 w-80"
            style="background: #FFFFFF; box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.24), 0px 16px 40px 0px rgba(0,0,0,0.16);"
          >
            <h3 class="text-base font-medium text-text-primary mb-2">Заголовок диалога</h3>
            <p class="text-sm text-text-secondary mb-4">Описание действия или подтверждение операции</p>
            <div class="flex justify-end gap-2">
              <button class="px-4 py-2 rounded text-sm font-medium text-[#448AFF]">Отмена</button>
              <button class="px-4 py-2 rounded text-sm font-medium text-white" style="background: #448AFF;">Подтвердить</button>
            </div>
          </div>
        </div>
      </section>

      <ui-divider></ui-divider>

      <!-- ==================== TABLE ==================== -->
      <section class="mb-10 mt-8">
        <h2 class="text-lg font-medium text-text-primary mb-1">Table</h2>
        <p class="text-sm text-text-secondary mb-4">Токен: <code>component.Table</code></p>
        <div class="bg-white rounded-lg border border-border overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr style="background: #F5F5F5;">
                <th class="text-left px-4 py-3 font-medium" style="color: #757575;">Имя</th>
                <th class="text-left px-4 py-3 font-medium" style="color: #757575;">Роль</th>
                <th class="text-left px-4 py-3 font-medium" style="color: #757575;">Статус</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of tableRows; let odd = odd"
                [style.background-color]="odd ? '#FAFAFA' : '#FFFFFF'"
                style="border-top: 1px solid #EEEEEE;"
              >
                <td class="px-4 py-3" style="color: #212121;">{{ row.name }}</td>
                <td class="px-4 py-3" style="color: #757575;">{{ row.role }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                    [style.background-color]="row.statusBg"
                    [style.color]="row.statusColor"
                  >{{ row.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <ui-divider></ui-divider>

      <!-- ==================== BANNERS / SNACKBAR ==================== -->
      <section class="mb-10 mt-8">
        <h2 class="text-lg font-medium text-text-primary mb-1">Banners &amp; Snackbar</h2>
        <p class="text-sm text-text-secondary mb-4">Токены: <code>component.Banners</code>, <code>component.Snackbar</code></p>
        <div class="space-y-3">
          <div *ngFor="let banner of banners"
            class="px-4 py-3 rounded-lg flex items-center gap-3 text-sm"
            [style.background-color]="banner.bg"
            [style.color]="banner.text"
          >
            <lucide-icon [name]="banner.icon" [size]="18"></lucide-icon>
            {{ banner.message }}
          </div>
        </div>
        <div class="mt-4">
          <div class="px-4 py-3 rounded-lg text-sm text-white flex items-center justify-between" style="background: #263136;">
            <span>Snackbar уведомление</span>
            <button class="text-xs font-medium" style="color: #448AFF;">ДЕЙСТВИЕ</button>
          </div>
        </div>
      </section>

      <ui-divider></ui-divider>

      <!-- ==================== SEARCH ==================== -->
      <section class="mb-10 mt-8">
        <h2 class="text-lg font-medium text-text-primary mb-1">Search</h2>
        <p class="text-sm text-text-secondary mb-4">Токен: <code>component.Search</code></p>
        <div class="bg-white rounded-lg border border-border p-6">
          <div class="flex items-center gap-3 px-3 py-2.5 rounded-lg" style="background: #F5F5F5;">
            <lucide-icon name="search" [size]="18" style="color: #9E9E9E;"></lucide-icon>
            <span class="text-sm" style="color: #9E9E9E;">Поиск...</span>
          </div>
        </div>
      </section>

      <ui-divider></ui-divider>

      <!-- ==================== DIVIDER ==================== -->
      <section class="mb-10 mt-8">
        <h2 class="text-lg font-medium text-text-primary mb-1">Divider</h2>
        <p class="text-sm text-text-secondary mb-4">Токен: <code>component.Divider</code></p>
        <div class="bg-white rounded-lg border border-border p-6 space-y-4">
          <div>
            <span class="text-xs text-text-tertiary font-mono mb-1 block">primary (1px, #E0E0E0)</span>
            <div style="border-top: 1px solid #E0E0E0;"></div>
          </div>
          <div>
            <span class="text-xs text-text-tertiary font-mono mb-1 block">secondary (1px, #EEEEEE)</span>
            <div style="border-top: 1px solid #EEEEEE;"></div>
          </div>
        </div>
      </section>

      <ui-divider></ui-divider>

      <!-- ==================== EXPANSION PANEL ==================== -->
      <section class="mb-10 mt-8">
        <h2 class="text-lg font-medium text-text-primary mb-1">Expansion Panel</h2>
        <p class="text-sm text-text-secondary mb-4">Токен: <code>component.ExpansionPanel</code></p>
        <div class="bg-white rounded-lg border border-border overflow-hidden">
          <div class="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-surface-secondary"
            style="border-bottom: 1px solid #E0E0E0;">
            <span class="text-sm font-medium text-text-primary">Раскрывающаяся секция (закрыта)</span>
            <lucide-icon name="chevron-down" [size]="18" class="text-text-secondary"></lucide-icon>
          </div>
          <div class="px-4 py-3 flex items-center justify-between cursor-pointer"
            style="border-bottom: 1px solid #E0E0E0; background: #FAFAFA;">
            <span class="text-sm font-medium text-text-primary">Раскрывающаяся секция (открыта)</span>
            <lucide-icon name="chevron-up" [size]="18" class="text-text-secondary"></lucide-icon>
          </div>
          <div class="px-4 py-3 text-sm text-text-secondary" style="background: #FAFAFA;">
            Содержимое раскрытой секции. Здесь может быть любой контент.
          </div>
        </div>
      </section>

      <ui-divider></ui-divider>

      <!-- ==================== HINT ==================== -->
      <section class="mb-10 mt-8">
        <h2 class="text-lg font-medium text-text-primary mb-1">Hint (Tooltip)</h2>
        <p class="text-sm text-text-secondary mb-4">Токен: <code>component.Hint</code></p>
        <div class="bg-white rounded-lg border border-border p-6">
          <div class="inline-block px-3 py-2 rounded text-xs text-white" style="background: #424242;">
            Подсказка — Hint
          </div>
        </div>
      </section>

      <ui-divider></ui-divider>

      <!-- ==================== SIDENAV ==================== -->
      <section class="mb-10 mt-8">
        <h2 class="text-lg font-medium text-text-primary mb-1">Sidenav</h2>
        <p class="text-sm text-text-secondary mb-4">Токен: <code>component.Sidenav</code></p>
        <div class="bg-gray-50 rounded-lg border border-border p-4 flex gap-4">
          <div class="w-56 rounded-lg overflow-hidden" style="background: #263136;">
            <div class="px-4 py-3 text-sm font-medium text-white border-b border-white/10">Меню</div>
            <div class="px-4 py-2.5 text-sm flex items-center gap-2" style="background: rgba(255,255,255,0.08); color: #FFFFFF;">
              <lucide-icon name="home" [size]="16"></lucide-icon> Главная
            </div>
            <div class="px-4 py-2.5 text-sm flex items-center gap-2" style="color: rgba(255,255,255,0.7);">
              <lucide-icon name="settings" [size]="16"></lucide-icon> Настройки
            </div>
            <div class="px-4 py-2.5 text-sm flex items-center gap-2" style="color: rgba(255,255,255,0.7);">
              <lucide-icon name="users" [size]="16"></lucide-icon> Пользователи
            </div>
          </div>
          <div class="flex-1 bg-white rounded-lg p-4 text-sm text-text-secondary">
            Контент страницы
          </div>
        </div>
      </section>

      <ui-divider></ui-divider>

      <!-- ==================== STEPPER ==================== -->
      <section class="mb-10 mt-8">
        <h2 class="text-lg font-medium text-text-primary mb-1">Stepper</h2>
        <p class="text-sm text-text-secondary mb-4">Токен: <code>component.Stepper</code></p>
        <div class="bg-white rounded-lg border border-border p-6">
          <div class="flex items-center gap-2">
            <div *ngFor="let step of steps; let last = last" class="flex items-center gap-2">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                [style.background-color]="step.bg"
                [style.color]="step.text"
              >{{ step.num }}</div>
              <span class="text-sm" [style.color]="step.labelColor">{{ step.label }}</span>
              <div *ngIf="!last" class="w-8 h-0.5 mx-1" [style.background-color]="step.lineColor"></div>
            </div>
          </div>
        </div>
      </section>

      <ui-divider></ui-divider>

      <!-- ==================== LIST ==================== -->
      <section class="mb-10 mt-8">
        <h2 class="text-lg font-medium text-text-primary mb-1">List</h2>
        <p class="text-sm text-text-secondary mb-4">Токен: <code>component.List</code></p>
        <div class="bg-white rounded-lg border border-border overflow-hidden">
          <div *ngFor="let item of listItems"
            class="px-4 py-3 text-sm flex items-center justify-between"
            [style.background-color]="item.bg"
            [style.border-bottom]="'1px solid #EEEEEE'"
          >
            <span [style.color]="item.textColor">{{ item.text }}</span>
            <lucide-icon *ngIf="item.action" name="chevron-right" [size]="16" class="text-text-tertiary"></lucide-icon>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class DtComponentsScreenComponent {
  private router = inject(Router);

  breadcrumbs = [
    { label: 'Дизайн-токены', onClick: () => this.router.navigate(['/prototype/design-tokens']) },
    { label: 'Компоненты' },
  ];

  // Buttons — Filled
  filledButtons = [
    { label: 'Accent', bg: '#448AFF', text: '#FFFFFF' },
    { label: 'Positive', bg: '#14B456', text: '#FFFFFF' },
    { label: 'Warning', bg: '#FFAB40', text: '#212121' },
    { label: 'Negative', bg: '#FF5252', text: '#FFFFFF' },
    { label: 'Neutral', bg: '#F5F5F5', text: '#212121' },
  ];

  filledHoverButtons = [
    { label: 'Accent', bg: '#1E88E5', text: '#FFFFFF' },
    { label: 'Positive', bg: '#16A34A', text: '#FFFFFF' },
    { label: 'Warning', bg: '#FFA000', text: '#212121' },
    { label: 'Negative', bg: '#E53935', text: '#FFFFFF' },
    { label: 'Neutral', bg: '#EEEEEE', text: '#212121' },
  ];

  filledPressButtons = [
    { label: 'Accent', bg: '#1565C0', text: '#FFFFFF' },
    { label: 'Positive', bg: '#15803D', text: '#FFFFFF' },
    { label: 'Warning', bg: '#FF8F00', text: '#212121' },
    { label: 'Negative', bg: '#C62828', text: '#FFFFFF' },
    { label: 'Neutral', bg: '#E0E0E0', text: '#212121' },
  ];

  outlinedButtons = [
    { label: 'Accent', border: '#448AFF', text: '#448AFF' },
    { label: 'Positive', border: '#14B456', text: '#14B456' },
    { label: 'Warning', border: '#FFAB40', text: '#F57C00' },
    { label: 'Negative', border: '#FF5252', text: '#FF5252' },
    { label: 'Neutral', border: '#E0E0E0', text: '#212121' },
  ];

  textButtons = [
    { label: 'Accent', text: '#448AFF' },
    { label: 'Positive', text: '#14B456' },
    { label: 'Warning', text: '#F57C00' },
    { label: 'Negative', text: '#FF5252' },
    { label: 'Neutral', text: '#757575' },
  ];

  iconButtons = [
    { label: 'Filled', bg: '#448AFF', icon: '#FFFFFF' },
    { label: 'Outlined', bg: 'transparent', icon: '#448AFF' },
    { label: 'Neutral', bg: '#F5F5F5', icon: '#616161' },
  ];

  chips = [
    { label: 'Default', bg: '#EEEEEE', text: '#212121', border: '' },
    { label: 'Selected', bg: '#E3F2FD', text: '#448AFF', border: '#448AFF' },
    { label: 'Disabled', bg: '#F5F5F5', text: '#BDBDBD', border: '' },
  ];

  filledInputs = [
    { state: 'Default', bg: '#F5F5F5', text: '#212121', borderBottom: '#9E9E9E', placeholder: 'Placeholder' },
    { state: 'Focus', bg: '#F5F5F5', text: '#212121', borderBottom: '#448AFF', placeholder: 'Focused input' },
    { state: 'Error', bg: '#F5F5F5', text: '#212121', borderBottom: '#FF5252', placeholder: 'Error input' },
    { state: 'Disabled', bg: '#FAFAFA', text: '#BDBDBD', borderBottom: '#E0E0E0', placeholder: 'Disabled' },
  ];

  outlinedInputs = [
    { state: 'Default', text: '#212121', border: '#E0E0E0', placeholder: 'Placeholder' },
    { state: 'Focus', text: '#212121', border: '#448AFF', placeholder: 'Focused input' },
    { state: 'Error', text: '#212121', border: '#FF5252', placeholder: 'Error input' },
    { state: 'Disabled', text: '#BDBDBD', border: '#EEEEEE', placeholder: 'Disabled' },
  ];

  checkboxes = [
    { label: 'Unchecked', bg: 'transparent', border: '#9E9E9E', checked: false, indeterminate: false, labelColor: '#212121' },
    { label: 'Checked', bg: '#448AFF', border: '', checked: true, indeterminate: false, labelColor: '#212121' },
    { label: 'Indeterminate', bg: '#448AFF', border: '', checked: false, indeterminate: true, labelColor: '#212121' },
    { label: 'Disabled', bg: '#EEEEEE', border: '', checked: true, indeterminate: false, labelColor: '#BDBDBD' },
  ];

  radioButtons = [
    { label: 'Unselected', border: '#9E9E9E', bg: 'transparent', selected: false, dot: '', labelColor: '#212121' },
    { label: 'Selected', border: '#448AFF', bg: 'transparent', selected: true, dot: '#448AFF', labelColor: '#212121' },
    { label: 'Disabled', border: '#E0E0E0', bg: '#F5F5F5', selected: false, dot: '', labelColor: '#BDBDBD' },
  ];

  toggles = [
    { label: 'Off', trackBg: '#E0E0E0', thumbBg: '#FAFAFA', on: false, labelColor: '#212121' },
    { label: 'On', trackBg: '#448AFF', thumbBg: '#FFFFFF', on: true, labelColor: '#212121' },
    { label: 'Disabled', trackBg: '#F5F5F5', thumbBg: '#E0E0E0', on: false, labelColor: '#BDBDBD' },
  ];

  statuses = [
    { label: 'Active', bg: '#DCFCE7', text: '#15803D', dot: '#14B456' },
    { label: 'Warning', bg: '#FFF8E1', text: '#F57C00', dot: '#FFAB40' },
    { label: 'Error', bg: '#FFEBEE', text: '#D32F2F', dot: '#FF5252' },
    { label: 'Info', bg: '#E3F2FD', text: '#1565C0', dot: '#448AFF' },
    { label: 'Neutral', bg: '#F5F5F5', text: '#757575', dot: '#9E9E9E' },
  ];

  tabs = [
    { label: 'Активная', active: true },
    { label: 'Вторая', active: false },
    { label: 'Третья', active: false },
  ];

  badges = [
    { label: 'Accent', bg: '#448AFF', text: '#FFFFFF', value: '3' },
    { label: 'Negative', bg: '#FF5252', text: '#FFFFFF', value: '12' },
    { label: 'Warning', bg: '#FFAB40', text: '#212121', value: '!' },
  ];

  cards = [
    { title: 'Card Default', desc: 'Стандартная карточка', bg: '#FFFFFF', border: '#E0E0E0', shadow: 'none', titleColor: '#212121', descColor: '#757575' },
    { title: 'Card Elevated', desc: 'С тенью уровня S', bg: '#FFFFFF', border: 'transparent', shadow: '0px 0px 2px 0px rgba(0,0,0,0.24), 0px 2px 8px 0px rgba(0,0,0,0.08)', titleColor: '#212121', descColor: '#757575' },
    { title: 'Card Hover', desc: 'При наведении', bg: '#FAFAFA', border: '#448AFF', shadow: '0px 0px 2px 0px rgba(0,0,0,0.24), 0px 2px 8px 0px rgba(0,0,0,0.08)', titleColor: '#212121', descColor: '#757575' },
  ];

  tableRows = [
    { name: 'Алексей Петров', role: 'Администратор', status: 'Активен', statusBg: '#DCFCE7', statusColor: '#15803D' },
    { name: 'Мария Иванова', role: 'Менеджер', status: 'На модерации', statusBg: '#FFF8E1', statusColor: '#F57C00' },
    { name: 'Дмитрий Козлов', role: 'Сотрудник', status: 'Заблокирован', statusBg: '#FFEBEE', statusColor: '#D32F2F' },
  ];

  banners = [
    { message: 'Информационный баннер', bg: '#E3F2FD', text: '#1565C0', icon: 'info' },
    { message: 'Успешная операция', bg: '#DCFCE7', text: '#15803D', icon: 'check-circle-2' },
    { message: 'Предупреждение', bg: '#FFF8E1', text: '#F57C00', icon: 'alert-triangle' },
    { message: 'Ошибка операции', bg: '#FFEBEE', text: '#D32F2F', icon: 'alert-circle' },
  ];

  steps = [
    { num: '1', label: 'Шаг 1', bg: '#448AFF', text: '#FFFFFF', labelColor: '#212121', lineColor: '#448AFF' },
    { num: '2', label: 'Шаг 2', bg: '#448AFF', text: '#FFFFFF', labelColor: '#212121', lineColor: '#E0E0E0' },
    { num: '3', label: 'Шаг 3', bg: '#F5F5F5', text: '#757575', labelColor: '#757575', lineColor: '#E0E0E0' },
  ];

  listItems = [
    { text: 'Элемент списка (обычный)', bg: '#FFFFFF', textColor: '#212121', action: true },
    { text: 'Элемент списка (выбран)', bg: '#E3F2FD', textColor: '#448AFF', action: true },
    { text: 'Элемент списка (hover)', bg: '#FAFAFA', textColor: '#212121', action: true },
    { text: 'Элемент списка (disabled)', bg: '#FFFFFF', textColor: '#BDBDBD', action: false },
  ];
}
