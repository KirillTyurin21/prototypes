import {
  Component,
  Input,
  Output,
  EventEmitter,
  Directive,
  TemplateRef,
  ContentChildren,
  QueryList,
  AfterContentInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';

/* ─────────────────────────────────────────────
   TableColumn Interface
   ───────────────────────────────────────────── */
export interface TableColumn {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

/* ─────────────────────────────────────────────
   TableCellDefDirective
   ───────────────────────────────────────────── */
@Directive({
  selector: '[tableCellDef]',
  standalone: true,
})
export class TableCellDefDirective {
  @Input('tableCellDef') columnKey = '';

  constructor(public templateRef: TemplateRef<any>) {}
}

/* ─────────────────────────────────────────────
   UiTableComponent
   ───────────────────────────────────────────── */
@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="w-full overflow-auto rounded border border-border bg-surface">
      <table class="w-full border-collapse text-sm">
        <!-- Header -->
        <thead>
          <tr class="border-b border-border bg-surface-secondary">
            <th
              *ngFor="let col of columns"
              [style.width]="col.width || 'auto'"
              class="px-3 py-2.5 text-xs font-medium text-text-secondary uppercase tracking-wide select-none"
              [ngClass]="{
                'text-left': col.align !== 'center' && col.align !== 'right',
                'text-center': col.align === 'center',
                'text-right': col.align === 'right',
                'cursor-pointer hover:text-text-primary hover:bg-surface-tertiary': col.sortable
              }"
              (click)="col.sortable ? onSort(col.key) : null"
            >
              <span class="inline-flex items-center gap-1">
                {{ col.header }}
                <ng-container *ngIf="col.sortable">
                  <lucide-icon
                    *ngIf="sortColumn === col.key && sortDirection === 'asc'"
                    name="chevron-up"
                    [size]="14"
                  ></lucide-icon>
                  <lucide-icon
                    *ngIf="sortColumn === col.key && sortDirection === 'desc'"
                    name="chevron-down"
                    [size]="14"
                  ></lucide-icon>
                  <lucide-icon
                    *ngIf="sortColumn !== col.key"
                    name="chevrons-up-down"
                    [size]="14"
                    class="opacity-40"
                  ></lucide-icon>
                </ng-container>
              </span>
            </th>
          </tr>
        </thead>

        <!-- Body -->
        <tbody>
          <ng-container *ngIf="data.length > 0; else emptyTpl">
            <tr
              *ngFor="let item of data; trackBy: trackByFn"
              class="border-b border-border last:border-b-0 transition-colors"
              [ngClass]="{
                'hover:bg-surface-hover cursor-pointer': rowClick.observed,
                'bg-surface-selected': selectedKey !== undefined && rowKeyFn && rowKeyFn(item) === selectedKey
              }"
              (click)="onRowClick(item)"
            >
              <td
                *ngFor="let col of columns"
                class="px-3"
                [ngClass]="{
                  'py-2': compact,
                  'py-2.5': !compact,
                  'text-left': col.align !== 'center' && col.align !== 'right',
                  'text-center': col.align === 'center',
                  'text-right': col.align === 'right'
                }"
              >
                <ng-container *ngIf="getCellTemplate(col.key) as tpl; else defaultCell">
                  <ng-container *ngTemplateOutlet="tpl; context: { $implicit: item, column: col }"></ng-container>
                </ng-container>
                <ng-template #defaultCell>
                  {{ item[col.key] }}
                </ng-template>
              </td>
            </tr>
          </ng-container>

          <ng-template #emptyTpl>
            <tr>
              <td [attr.colspan]="columns.length" class="px-3 py-8 text-center text-sm text-text-secondary">
                {{ emptyMessage }}
              </td>
            </tr>
          </ng-template>
        </tbody>
      </table>
    </div>
  `,
})
export class UiTableComponent implements AfterContentInit {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() rowKeyFn?: (item: any) => string | number;
  @Input() selectedKey?: string | number;
  @Input() emptyMessage = 'Нет данных';
  @Input() compact = false;
  @Input() sortColumn?: string;
  @Input() sortDirection: 'asc' | 'desc' = 'asc';

  @Output() rowClick = new EventEmitter<any>();
  @Output() sort = new EventEmitter<{ column: string; direction: 'asc' | 'desc' }>();

  @ContentChildren(TableCellDefDirective) cellDefs!: QueryList<TableCellDefDirective>;

  private cellDefMap = new Map<string, TemplateRef<any>>();

  ngAfterContentInit(): void {
    this.buildCellDefMap();
    this.cellDefs.changes.subscribe(() => this.buildCellDefMap());
  }

  private buildCellDefMap(): void {
    this.cellDefMap.clear();
    this.cellDefs.forEach((def: TableCellDefDirective) => {
      this.cellDefMap.set(def.columnKey, def.templateRef);
    });
  }

  getCellTemplate(key: string): TemplateRef<any> | null {
    return this.cellDefMap.get(key) || null;
  }

  trackByFn = (index: number, item: any): any => {
    return this.rowKeyFn ? this.rowKeyFn(item) : index;
  };

  onRowClick(item: any): void {
    this.rowClick.emit(item);
  }

  onSort(columnKey: string): void {
    let direction: 'asc' | 'desc' = 'asc';
    if (this.sortColumn === columnKey) {
      direction = this.sortDirection === 'asc' ? 'desc' : 'asc';
    }
    this.sortColumn = columnKey;
    this.sortDirection = direction;
    this.sort.emit({ column: columnKey, direction });
  }
}
