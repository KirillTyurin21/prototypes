import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-editor-canvas',
  standalone: true,
  template: `
    <div class="canvas-area">
      <div class="canvas-scroll">
        <div
          class="canvas-viewport"
          [style.width.px]="width"
          [style.height.px]="height"
          [style.transform]="'scale(' + zoom + ')'"
          [style.background-color]="backgroundColor"
          (click)="onCanvasClick()"
        >
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex: 1;
      min-width: 0;
      min-height: 0;
      overflow: hidden;
    }
    .canvas-area {
      flex: 1;
      min-width: 0;
      overflow: auto;
      background: #e0e0e0;
    }
    .canvas-scroll {
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
      min-height: 100%;
      padding: 0;
    }
    .canvas-viewport {
      position: relative;
      transform-origin: top left;
      background-color: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
  `],
})
export class EditorCanvasComponent {
  @Input() width = 1024;
  @Input() height = 768;
  @Input() zoom = 1.0;
  @Input() backgroundColor = '#fff';

  @Output() zoomChange = new EventEmitter<number>();
  @Output() canvasClick = new EventEmitter<void>();

  onCanvasClick(): void {
    this.canvasClick.emit();
  }
}
