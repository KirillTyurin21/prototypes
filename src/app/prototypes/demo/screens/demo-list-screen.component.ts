import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  UiTableComponent,
  TableCellDefDirective,
  TableColumn,
  UiButtonComponent,
  UiBadgeComponent,
  UiBreadcrumbsComponent,
  UiInputComponent,
} from '@/components/ui/index';
import { IconsModule } from '@/shared/icons.module';

interface DemoItem {
  id: number;
  name: string;
  category: string;
  price: number;
  status: 'active' | 'inactive' | 'draft';
}

const MOCK_DATA: DemoItem[] = [
  { id: 1, name: 'Пицца Маргарита', category: 'Пицца', price: 490, status: 'active' },
  { id: 2, name: 'Цезарь с курицей', category: 'Салаты', price: 380, status: 'active' },
  { id: 3, name: 'Том Ям', category: 'Супы', price: 420, status: 'active' },
  { id: 4, name: 'Ролл Филадельфия', category: 'Роллы', price: 550, status: 'inactive' },
  { id: 5, name: 'Тирамису', category: 'Десерты', price: 320, status: 'draft' },
  { id: 6, name: 'Латте', category: 'Напитки', price: 220, status: 'active' },
  { id: 7, name: 'Капучино', category: 'Напитки', price: 250, status: 'active' },
  { id: 8, name: 'Паста Карбонара', category: 'Паста', price: 460, status: 'draft' },
];

const STATUS_BADGE: Record<string, { label: string; variant: string }> = {
  active: { label: 'Активен', variant: 'success' },
  inactive: { label: 'Неактивен', variant: 'danger' },
  draft: { label: 'Черновик', variant: 'default' },
};

@Component({
  selector: 'app-demo-list-screen',
  standalone: true,
  imports: [
    CommonModule,
    UiTableComponent,
    TableCellDefDirective,
    UiButtonComponent,
    UiBadgeComponent,
    UiBreadcrumbsComponent,
    UiInputComponent,
    IconsModule,
  ],
  template: `
    <div class="max-w-4xl">
      <ui-breadcrumbs [items]="breadcrumbs"></ui-breadcrumbs>

      <div class="mt-4 mb-4 flex items-center justify-between gap-4">
        <h2 class="text-xl font-medium text-text-primary">Список элементов</h2>
        <div class="flex items-center gap-2">
          <ui-button variant="primary" size="sm" iconName="plus">Добавить</ui-button>
          <ui-button variant="danger" size="sm" iconName="trash-2" [disabled]="selectedId === undefined">Удалить</ui-button>
        </div>
      </div>

      <div class="mb-4 max-w-sm">
        <ui-input placeholder="Поиск по имени или категории..." [(value)]="search" iconName="search"></ui-input>
      </div>

      <ui-table
        [columns]="columns"
        [data]="filteredData"
        [rowKeyFn]="rowKeyFn"
        [selectedKey]="selectedId"
        [sortColumn]="sortCol"
        [sortDirection]="sortDir"
        (rowClick)="onRowClick($event)"
        (sort)="onSort($event)"
        emptyMessage="Ничего не найдено"
      >
        <ng-template tableCellDef="price" let-item>
          {{ item.price | number:'1.0-0':'ru' }} ₽
        </ng-template>
        <ng-template tableCellDef="status" let-item>
          <ui-badge [variant]="getStatusVariant(item.status)">{{ getStatusLabel(item.status) }}</ui-badge>
        </ng-template>
      </ui-table>

      <div class="mt-4">
        <ui-button variant="ghost" size="sm" iconName="arrow-left" (click)="goBack()">Назад</ui-button>
      </div>
    </div>
  `,
})
export class DemoListScreenComponent {
  private router = inject(Router);

  search = '';
  selectedId: number | undefined = undefined;
  sortCol = 'name';
  sortDir: 'asc' | 'desc' = 'asc';
  items: DemoItem[] = [...MOCK_DATA];

  columns: TableColumn[] = [
    { key: 'id', header: '№', width: '60px', sortable: true },
    { key: 'name', header: 'Наименование', sortable: true },
    { key: 'category', header: 'Категория', sortable: true },
    { key: 'price', header: 'Цена, ₽', width: '110px', align: 'right', sortable: true },
    { key: 'status', header: 'Статус', width: '120px' },
  ];

  breadcrumbs = [
    { label: 'Демо-прототип', onClick: () => this.goBack() },
    { label: 'Список элементов' },
  ];

  rowKeyFn = (item: any) => item.id;

  get filteredData(): DemoItem[] {
    const term = this.search.toLowerCase().trim();
    let result = this.items;

    if (term) {
      result = result.filter(
        item =>
          item.name.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term)
      );
    }

    result = [...result].sort((a, b) => {
      const key = this.sortCol as keyof DemoItem;
      const aVal = a[key];
      const bVal = b[key];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return this.sortDir === 'asc'
          ? aVal.localeCompare(bVal, 'ru')
          : bVal.localeCompare(aVal, 'ru');
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return this.sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    return result;
  }

  onRowClick(item: any): void {
    this.selectedId = this.selectedId === item.id ? undefined : item.id;
  }

  onSort(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.sortCol = event.column;
    this.sortDir = event.direction;
  }

  getStatusVariant(status: string): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' {
    return (STATUS_BADGE[status]?.variant as any) ?? 'default';
  }

  getStatusLabel(status: string): string {
    return STATUS_BADGE[status]?.label ?? status;
  }

  goBack(): void {
    this.router.navigate(['/prototype/demo']);
  }
}
