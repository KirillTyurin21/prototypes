import { Component, Input } from '@angular/core';

/**
 * Рендерит иконку Material Icons через шрифтовую лигатуру.
 * Аналог <iiko-icon> из @iiko/ng-iiko-common — использует тот же Material Icons шрифт.
 *
 * Использование:
 *   <app-material-icon name="text_fields" [size]="16"></app-material-icon>
 */
@Component({
  selector: 'app-material-icon',
  standalone: true,
  template: `<span
    class="material-icons"
    [style.font-size.px]="size"
    [style.width.px]="size"
    [style.height.px]="size"
    [style.line-height.px]="size"
    role="img"
    [attr.aria-label]="name">{{ name }}</span>`,
})
export class MaterialIconComponent {
  @Input() name = '';
  @Input() size = 24;
}
