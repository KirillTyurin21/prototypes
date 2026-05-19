import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PosTerminalShellComponent,
  PosMainScreenComponent,
} from '@/components/pos-terminal';

/**
 * Главный экран прототипа front-base.
 * Отображает POS-терминал с главным экраном Front.
 */
@Component({
  selector: 'app-front-base-main-screen',
  standalone: true,
  imports: [CommonModule, PosTerminalShellComponent, PosMainScreenComponent],
  template: `
    <div class="h-[calc(100vh-48px)]">
      <pos-terminal-shell [showPlaceholder]="false"
                          (bottomAction)="onBottomAction($event)">
        <pos-main-screen posScreen></pos-main-screen>
      </pos-terminal-shell>
    </div>
  `,
})
export class FrontBaseMainScreenComponent {
  onBottomAction(action: string): void {
    console.log('[Front Base] Bottom action:', action);
  }
}
