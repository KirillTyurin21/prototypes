import { Component, Input, Output, EventEmitter } from '@angular/core';

type HandlePosition = 'tl' | 'tr' | 'bl' | 'br' | 'tm' | 'bm' | 'ml' | 'mr';

@Component({
  selector: 'app-resize-handle',
  standalone: true,
  template: `
    <div
      class="handle"
      [style.top]="posStyle.top"
      [style.bottom]="posStyle.bottom"
      [style.left]="posStyle.left"
      [style.right]="posStyle.right"
      [style.cursor]="cursorMap[position]"
      (mousedown)="onMouseDown($event)"
    ></div>
  `,
  styles: [`
    .handle {
      position: absolute;
      width: 8px;
      height: 8px;
      background: #fff;
      border: 2px solid #448aff;
      z-index: 2;
    }
  `],
})
export class ResizeHandleComponent {
  @Input() position: HandlePosition = 'br';
  @Output() handleMouseDown = new EventEmitter<{ event: MouseEvent; handle: string }>();

  readonly cursorMap: Record<HandlePosition, string> = {
    tl: 'nw-resize',
    tr: 'ne-resize',
    bl: 'sw-resize',
    br: 'se-resize',
    tm: 'n-resize',
    bm: 's-resize',
    ml: 'w-resize',
    mr: 'e-resize',
  };

  get posStyle(): Record<string, string> {
    const map: Record<HandlePosition, Record<string, string>> = {
      tl: { top: '-4px', left: '-4px' },
      tr: { top: '-4px', right: '-4px' },
      bl: { bottom: '-4px', left: '-4px' },
      br: { bottom: '-4px', right: '-4px' },
      tm: { top: '-4px', left: 'calc(50% - 4px)' },
      bm: { bottom: '-4px', left: 'calc(50% - 4px)' },
      ml: { top: 'calc(50% - 4px)', left: '-4px' },
      mr: { top: 'calc(50% - 4px)', right: '-4px' },
    };
    return map[this.position] || {};
  }

  onMouseDown(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.handleMouseDown.emit({ event, handle: this.position });
  }
}
