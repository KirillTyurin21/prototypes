import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { CATALOG_SECTIONS } from '../data/catalog-entries';
import { CatalogCell, CatalogSection } from '../types';

@Component({
  selector: 'app-pudu-catalog-screen',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="min-h-screen bg-gray-50" style="font-family: Roboto, sans-serif;">

      <!-- Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-6xl mx-auto px-6 py-4">
          <!-- Breadcrumb -->
          <nav class="text-sm text-gray-400 mb-2">
            <span>Главная</span>
            <span class="mx-1">/</span>
            <span>Плагины Front</span>
            <span class="mx-1">/</span>
            <span class="text-gray-600">PUDU — Управление роботами</span>
          </nav>

          <!-- Заголовок -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <lucide-icon name="bot" [size]="20" class="text-white"></lucide-icon>
            </div>
            <div>
              <h1 class="text-2xl font-semibold text-gray-900">
                PUDU — Управление роботами
              </h1>
              <p class="text-sm text-gray-500 mt-0.5">
                Плагин кассового терминала: доставка меню, уборка, QR-оплата, маркетинговый круиз
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Сетка секций -->
      <div class="max-w-6xl mx-auto px-6 py-6 space-y-8">

        <div *ngFor="let section of sections; let last = last">

          <!-- Заголовок секции -->
          <div class="flex items-center gap-2 mb-4">
            <lucide-icon [name]="section.icon" [size]="20"
                         class="text-gray-400"></lucide-icon>
            <h2 class="text-lg font-medium text-gray-700">{{ section.title }}</h2>
            <span class="text-sm text-gray-400 ml-1">— {{ section.description }}</span>
          </div>

          <!-- Сетка ячеек (3 колонки на desktop) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            <div *ngFor="let cell of section.cells"
                 (click)="onCellClick(cell)"
                 class="relative bg-white rounded-xl border border-gray-200 p-5
                        hover:shadow-md cursor-pointer
                        transition-all duration-200 group"
                 [ngClass]="{
                   'hover:border-blue-300': section.category === 'context-order',
                   'hover:border-purple-300': section.category === 'context-main',
                   'hover:border-amber-300': section.category === 'scenario',
                   'hover:border-gray-300': section.category === 'modal',
                   'hover:border-red-300': section.category === 'notification'
                 }">

              <!-- Бейдж (опциональный, правый верхний угол) -->
              <span *ngIf="cell.badge"
                    class="absolute top-3 right-3 text-xs font-medium px-2 py-0.5 rounded-full"
                    [style.background-color]="cell.badgeColor + '20'"
                    [style.color]="cell.badgeColor">
                {{ cell.badge }}
              </span>

              <!-- Иконка в цветном круге -->
              <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                   [style.background-color]="cell.iconColor + '20'">
                <lucide-icon [name]="cell.icon" [size]="24"
                             [style.color]="cell.iconColor"></lucide-icon>
              </div>

              <!-- Заголовок -->
              <h3 class="font-medium text-gray-900 mb-1 group-hover:text-blue-600
                         transition-colors">
                {{ cell.label }}
              </h3>

              <!-- Описание -->
              <p class="text-sm text-gray-500 line-clamp-2">
                {{ cell.description }}
              </p>

              <!-- Метка типа -->
              <p class="text-xs text-gray-400 mt-3 uppercase tracking-wide">
                {{ getCellTypeLabel(cell) }}
              </p>
            </div>
          </div>

          <!-- Разделитель между секциями -->
          <hr *ngIf="!last" class="border-gray-200 mt-6" />
        </div>
      </div>
    </div>
  `,
})
export class PuduCatalogScreenComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  sections: CatalogSection[] = CATALOG_SECTIONS;

  onCellClick(cell: CatalogCell): void {
    const queryParams: Record<string, string> = {};

    // 1. Контекст POS-экрана (order / main)
    if (cell.context) {
      queryParams['context'] = cell.context;
    }

    // 2. Модалка для открытия
    if (cell.modalType) {
      queryParams['modal'] = cell.modalType;
    }

    // 3. Сценарий для запуска
    if (cell.scenario) {
      queryParams['scenario'] = cell.scenario;
    }

    // 4. Уведомление для показа
    if (cell.category === 'notification') {
      queryParams['notification'] = cell.id;
    }

    this.router.navigate(['pos'], {
      relativeTo: this.route,
      queryParams,
    });
  }

  getCellTypeLabel(cell: CatalogCell): string {
    switch (cell.category) {
      case 'context-order': return 'POS CONTEXT';
      case 'context-main': return 'POS CONTEXT';
      case 'scenario': return 'POS SCENARIO';
      case 'modal': return 'POS MODAL';
      case 'notification': return 'POS TOAST';
      default: return 'POS MODAL';
    }
  }
}
