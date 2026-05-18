import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResizeHandleComponent } from './resize-handle.component';

@Component({
  selector: 'app-canvas-element',
  standalone: true,
  imports: [CommonModule, ResizeHandleComponent],
  template: `
    <div
      class="canvas-element"
      [class.selected]="selected"
      [class.dragging]="dragging"
      [style.left.px]="x"
      [style.top.px]="y"
      [style.width.px]="width"
      [style.height.px]="height"
      [style.border-width.px]="borderWidth"
      [style.border-color]="borderColor"
      [style.border-radius.px]="borderRadius"
      (click)="onSelect($event)"
      (mousedown)="onMouseDown($event)"
    >
      <ng-content></ng-content>

      <ng-container *ngIf="selected">
        <app-resize-handle position="tl" (handleMouseDown)="onHandleDown($event)"></app-resize-handle>
        <app-resize-handle position="tr" (handleMouseDown)="onHandleDown($event)"></app-resize-handle>
        <app-resize-handle position="bl" (handleMouseDown)="onHandleDown($event)"></app-resize-handle>
        <app-resize-handle position="br" (handleMouseDown)="onHandleDown($event)"></app-resize-handle>
        <app-resize-handle position="tm" (handleMouseDown)="onHandleDown($event)"></app-resize-handle>
        <app-resize-handle position="bm" (handleMouseDown)="onHandleDown($event)"></app-resize-handle>
        <app-resize-handle position="ml" (handleMouseDown)="onHandleDown($event)"></app-resize-handle>
        <app-resize-handle position="mr" (handleMouseDown)="onHandleDown($event)"></app-resize-handle>
      </ng-container>
    </div>
  `,
  styles: [`
    .canvas-element {
      position: absolute;
      border-style: dashed;
      cursor: move;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.5);
      transition: box-shadow 0.15s;
      font-size: 13px;
      color: #333;
      overflow: hidden;
      user-select: none;
    }
    .canvas-element:hover {
      box-shadow: 0 0 0 1px #448aff;
    }
    .canvas-element.selected {
      border-style: solid;
      border-color: #448aff !important;
      box-shadow: 0 0 0 1px #448aff;
    }
    .canvas-element.dragging {
      opacity: 0.85;
      transition: none;
    }
  `],
})
export class CanvasElementComponent {
  @Input() x = 0;
  @Input() y = 0;
  @Input() width = 100;
  @Input() height = 50;
  @Input() selected = false;
  @Input() dragging = false;
  @Input() borderWidth = 1;
  @Input() borderColor = '#ccc';
  @Input() borderRadius = 0;

  @Output() selectElement = new EventEmitter<MouseEvent>();
  @Output() elementMouseDown = new EventEmitter<MouseEvent>();
  @Output() resizeHandleMouseDown = new EventEmitter<{ event: MouseEvent; handle: string }>();

  onSelect(event: MouseEvent): void {
    event.stopPropagation();
    this.selectElement.emit(event);
  }

  onMouseDown(event: MouseEvent): void {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.classList.contains('handle')) return;
    event.preventDefault();
    event.stopPropagation();
    this.elementMouseDown.emit(event);
  }

  onHandleDown(data: { event: MouseEvent; handle: string }): void {
    this.resizeHandleMouseDown.emit(data);
  }
}
