import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { ExternalMenuCategory } from '../../data/mock-data';

@Component({
  selector: 'app-dish-selector-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="modal-overlay" (click)="cancel.emit()" *ngIf="open">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">Выбор блюд из внешнего меню</h3>
          <button class="modal-close" (click)="cancel.emit()"><lucide-icon name="x" [size]="20"></lucide-icon></button>
        </div>
        <div class="modal-search" *ngIf="categories.length > 0">
          <lucide-icon name="search" [size]="16" class="search-icon"></lucide-icon>
          <input type="text" class="search-input" placeholder="Поиск по названию..." [(ngModel)]="searchQuery" />
        </div>
        <div class="modal-body" *ngIf="categories.length > 0">
          <div class="cat-panel">
            <div *ngFor="let cat of categories" class="cat-item" [class.cat-active]="activeCategory === cat.id" (click)="activeCategory = cat.id; searchQuery = ''">
              <lucide-icon name="folder" [size]="16" class="cat-icon"></lucide-icon>
              <span class="cat-name">{{ cat.name }}</span>
              <span class="cat-count">{{ cat.items.length }}</span>
            </div>
          </div>
          <div class="dishes-panel">
            <div *ngFor="let dish of filteredDishes" class="dish-item" [class.dish-selected]="isSelected(dish.externalId)" (click)="toggleDish(dish)">
              <div class="dish-check"><lucide-icon [name]="isSelected(dish.externalId) ? 'check-square' : 'square'" [size]="18" [class.check-on]="isSelected(dish.externalId)"></lucide-icon></div>
              <div class="dish-icon-wrap"><lucide-icon name="coffee" [size]="22" class="dish-icon"></lucide-icon></div>
              <div class="dish-info">
                <span class="dish-name">{{ dish.name }}</span>
                <span class="dish-meta" *ngIf="dish.modifiers?.length">Модификаторы: {{ dish.modifiers?.join(', ') }}</span>
                <span class="dish-meta" *ngIf="dish.sizes?.length">Размеры: {{ getSizesLabel(dish) }}</span>
              </div>
              <div class="dish-price">{{ formatPrice(dish.price) }}</div>
            </div>
            <div *ngIf="filteredDishes.length === 0" class="dishes-empty">
              <lucide-icon name="search" [size]="32" class="empty-icon"></lucide-icon><span>Ничего не найдено</span>
            </div>
          </div>
        </div>
        <div class="modal-body modal-empty" *ngIf="categories.length === 0">
          <lucide-icon name="alert-circle" [size]="40" class="empty-icon"></lucide-icon>
          <p class="empty-text">Внешнее меню не настроено. Создайте внешнее меню для MenuBoard в разделе Внешнее меню</p>
        </div>
        <div class="modal-footer">
          <span class="footer-count">Выбрано {{ selectedIds.length }} блюд</span>
          <div class="footer-actions">
            <button class="btn-cancel" (click)="cancel.emit()">Отмена</button>
            <button class="btn-confirm" [disabled]="selectedIds.length === 0" (click)="confirmSelection()">Готово</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 200; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.15s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal-content { background: #fff; border-radius: 8px; width: 90%; max-width: 800px; height: 85vh; max-height: 600px; display: flex; flex-direction: column; box-shadow: 0 12px 40px rgba(0,0,0,0.2); animation: slideUp 0.2s ease-out; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #e0e0e0; flex-shrink: 0; }
    .modal-title { font-size: 16px; font-weight: 500; color: #212121; margin: 0; }
    .modal-close { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: none; border-radius: 4px; background: transparent; color: #757575; cursor: pointer; }
    .modal-close:hover { background: #f5f5f5; }
    .modal-search { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-bottom: 1px solid #eeeeee; flex-shrink: 0; }
    .search-icon { color: #9e9e9e; flex-shrink: 0; }
    .search-input { flex: 1; border: none; outline: none; font-size: 14px; font-family: Roboto, sans-serif; color: #333; }
    .search-input::placeholder { color: #bdbdbd; }
    .modal-body { flex: 1; display: flex; overflow: hidden; }
    .modal-empty { flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 40px; text-align: center; }
    .empty-icon { color: #bdbdbd; }
    .empty-text { font-size: 14px; color: #757575; max-width: 400px; margin: 0; }
    .cat-panel { width: 200px; flex-shrink: 0; border-right: 1px solid #eeeeee; overflow-y: auto; padding: 8px 0; }
    .cat-item { display: flex; align-items: center; gap: 8px; padding: 8px 16px; cursor: pointer; font-size: 13px; color: #616161; transition: all 0.1s; }
    .cat-item:hover { background: #f5f5f5; }
    .cat-active { background: #e3f2fd; color: #1565c0; font-weight: 500; }
    .cat-icon { flex-shrink: 0; }
    .cat-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cat-count { font-size: 11px; color: #9e9e9e; background: #f5f5f5; padding: 1px 6px; border-radius: 8px; }
    .dishes-panel { flex: 1; overflow-y: auto; padding: 8px 0; }
    .dish-item { display: flex; align-items: center; gap: 10px; padding: 8px 16px; cursor: pointer; transition: background 0.1s; border-bottom: 1px solid #f5f5f5; }
    .dish-item:hover { background: #fafafa; }
    .dish-selected { background: #e8f5e9; }
    .dish-check { flex-shrink: 0; display: flex; color: #bdbdbd; }
    .check-on { color: #4caf50; }
    .dish-icon-wrap { width: 36px; height: 36px; background: #f5f5f5; border-radius: 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .dish-icon { color: #9e9e9e; }
    .dish-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .dish-name { font-size: 14px; font-weight: 500; color: #212121; }
    .dish-meta { font-size: 11px; color: #9e9e9e; }
    .dish-price { font-size: 14px; font-weight: 600; color: #c62828; flex-shrink: 0; white-space: nowrap; }
    .dishes-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 40px 20px; color: #bdbdbd; font-size: 14px; }
    .modal-footer { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-top: 1px solid #e0e0e0; flex-shrink: 0; background: #fafafa; }
    .footer-count { font-size: 13px; color: #757575; }
    .footer-actions { display: flex; gap: 8px; }
    .btn-cancel { padding: 7px 16px; border: 1px solid #e0e0e0; border-radius: 4px; background: #fff; color: #616161; font-size: 13px; font-family: Roboto, sans-serif; cursor: pointer; }
    .btn-cancel:hover { background: #f5f5f5; }
    .btn-confirm { padding: 7px 20px; border: none; border-radius: 4px; background: #1976d2; color: #fff; font-size: 13px; font-weight: 500; font-family: Roboto, sans-serif; cursor: pointer; }
    .btn-confirm:hover { background: #1565c0; }
    .btn-confirm:disabled { background: #90caf9; cursor: default; }
  `],
})
export class DishSelectorModalComponent implements OnInit, OnChanges {
  @Input() open = false;
  @Input() categories: ExternalMenuCategory[] = [];
  @Input() selectedIds: string[] = [];

  @Output() confirm = new EventEmitter<string[]>();
  @Output() cancel = new EventEmitter<void>();

  activeCategory = '';
  searchQuery = '';

  ngOnInit(): void {
    if (this.categories.length > 0) this.activeCategory = this.categories[0].id;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categories'] && this.categories.length > 0 && !this.activeCategory) {
      this.activeCategory = this.categories[0].id;
    }
  }

  get currentCategory(): ExternalMenuCategory | undefined {
    return this.categories.find(c => c.id === this.activeCategory);
  }

  get filteredDishes() {
    const dishes = this.currentCategory?.items ?? [];
    if (!this.searchQuery.trim()) return dishes;
    const q = this.searchQuery.trim().toLowerCase();
    return dishes.filter(d => d.name.toLowerCase().includes(q));
  }

  isSelected(externalId: string): boolean { return this.selectedIds.includes(externalId); }

  toggleDish(dish: { externalId: string }): void {
    const idx = this.selectedIds.indexOf(dish.externalId);
    if (idx >= 0) {
      this.selectedIds = this.selectedIds.filter(id => id !== dish.externalId);
    } else {
      this.selectedIds = [...this.selectedIds, dish.externalId];
    }
  }

  getSizesLabel(dish: { sizes?: { name: string; price: number }[] }): string {
    return dish.sizes?.map(s => s.name).join(', ') ?? '';
  }

  formatPrice(price: number): string { return price + ' \u20BD'; }

  confirmSelection(): void { this.confirm.emit([...this.selectedIds]); }
}
