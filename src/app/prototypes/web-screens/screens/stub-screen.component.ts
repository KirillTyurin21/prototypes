import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'app-stub-screen',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="stub-container">
      <lucide-icon name="info" [size]="48" class="stub-icon"></lucide-icon>
      <h3 class="stub-title">Раздел в разработке</h3>
      <p class="stub-text">Этот раздел будет доступен в следующей версии</p>
    </div>
  `,
  styles: [`
    .stub-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      padding: 40px;
    }
    .stub-icon { color: #bdbdbd; }
    .stub-title {
      font-size: 18px;
      font-weight: 500;
      color: #757575;
      margin: 16px 0 8px;
    }
    .stub-text {
      font-size: 14px;
      color: #9e9e9e;
    }
  `],
})
export class StubScreenComponent {}
