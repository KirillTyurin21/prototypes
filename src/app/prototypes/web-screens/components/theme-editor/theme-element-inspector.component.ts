import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { ArrivalsThemeElement, ArrivalsElementType } from '../../types';
import { CollapsibleSectionComponent } from '../inspector/collapsible-section.component';
import { LayoutFieldsComponent } from '../inspector/layout-fields.component';
import { BorderFieldsComponent } from '../inspector/border-fields.component';
import { FontFieldsComponent } from '../inspector/font-fields.component';
import { AlignFieldsComponent } from '../inspector/align-fields.component';

@Component({
  selector: 'app-theme-element-inspector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,
    CollapsibleSectionComponent,
    LayoutFieldsComponent,
    BorderFieldsComponent,
    FontFieldsComponent,
    AlignFieldsComponent,
  ],
  template: `
    <!-- ── Text element ── -->
    <ng-container *ngIf="element.type === 'text'">
      <div class="field-group">
        <label class="field-label">Текст</label>
        <textarea class="field-textarea" rows="3"
          [(ngModel)]="element.text"></textarea>
      </div>

      <app-collapsible-section title="Макет">
        <app-layout-fields
          [(x)]="element.x" [(y)]="element.y"
          [(width)]="element.width" [(height)]="element.height">
        </app-layout-fields>
      </app-collapsible-section>

      <app-collapsible-section title="Граница">
        <app-border-fields
          [(borderWidth)]="element.borderWidth"
          [(borderColor)]="element.borderColor"
          [(borderRadius)]="element.borderRadius">
        </app-border-fields>
      </app-collapsible-section>

      <app-collapsible-section title="Шрифт">
        <app-font-fields
          [(fontFamily)]="element.fontFamily!"
          [(fontSize)]="element.fontSize!"
          [(fontBold)]="element.fontBold!"
          [(fontItalic)]="element.fontItalic!">
        </app-font-fields>
        <app-align-fields
          [(hAlign)]="element.textAlign!">
        </app-align-fields>
      </app-collapsible-section>
    </ng-container>

    <!-- ── Image element ── -->
    <ng-container *ngIf="element.type === 'image'">
      <div class="field-group">
        <label class="field-label">URL изображения</label>
        <input class="field-input" [(ngModel)]="element.imageUrl" placeholder="https://..." />
      </div>

      <app-collapsible-section title="Макет">
        <app-layout-fields
          [(x)]="element.x" [(y)]="element.y"
          [(width)]="element.width" [(height)]="element.height">
        </app-layout-fields>
      </app-collapsible-section>

      <app-collapsible-section title="Граница">
        <app-border-fields
          [(borderWidth)]="element.borderWidth"
          [(borderColor)]="element.borderColor"
          [(borderRadius)]="element.borderRadius">
        </app-border-fields>
      </app-collapsible-section>
    </ng-container>

    <!-- ── Generic element (order-number, client-name, etc.) ── -->
    <ng-container *ngIf="isGenericElement(element.type)">
      <app-collapsible-section title="Макет">
        <app-layout-fields
          [(x)]="element.x" [(y)]="element.y"
          [(width)]="element.width" [(height)]="element.height">
        </app-layout-fields>
      </app-collapsible-section>

      <app-collapsible-section title="Граница">
        <app-border-fields
          [(borderWidth)]="element.borderWidth"
          [(borderColor)]="element.borderColor"
          [(borderRadius)]="element.borderRadius">
        </app-border-fields>
      </app-collapsible-section>
    </ng-container>
  `,
  styles: [`
    .field-group { margin-bottom: 12px; }
    .field-label { display: block; font-size: 12px; color: #757575; margin-bottom: 4px; }
    .field-input {
      width: 100%; height: 36px; padding: 0 10px;
      border: 1px solid #e0e0e0; border-radius: 4px;
      font-size: 14px; font-family: Roboto, sans-serif; color: #333;
      box-sizing: border-box; transition: border-color 0.15s;
    }
    .field-input:focus { outline: none; border-color: #448aff; }
    .field-textarea {
      width: 100%; padding: 8px 10px; border: 1px solid #e0e0e0; border-radius: 4px;
      font-size: 14px; font-family: Roboto, sans-serif; color: #333;
      resize: vertical; min-height: 60px; box-sizing: border-box;
    }
    .field-textarea:focus { outline: none; border-color: #448aff; }
  `],
})
export class ThemeElementInspectorComponent {
  @Input() element!: ArrivalsThemeElement;

  isGenericElement(type: ArrivalsElementType): boolean {
    return !['text', 'image', 'area'].includes(type);
  }
}
