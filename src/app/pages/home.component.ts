import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UiCardComponent, UiButtonComponent, UiBadgeComponent } from '@/components/ui/index';
import { IconsModule } from '@/shared/icons.module';
import { PROTOTYPES } from '@/shared/prototypes.registry';
import { AccessCodeService } from '@/shared/access-code.service';
import { RateLimitService } from '@/shared/rate-limit.service';
import { CodeInputModalComponent } from '@/components/ui/code-input-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, UiCardComponent, UiButtonComponent, UiBadgeComponent, IconsModule, CodeInputModalComponent],
  template: `
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-2xl font-medium text-text-primary mb-2">Добро пожаловать в Прототипы</h2>
        <p class="text-text-secondary">
          Рабочая область для создания интерактивных прототипов плагинов Front и Web.
          <span *ngIf="hasAnyAccess && !hasMaster">Ниже показаны доступные вам прототипы.</span>
          <span *ngIf="hasMaster">Выберите прототип из списка ниже или создайте новый.</span>
          <span *ngIf="!hasAnyAccess">Введите код доступа, чтобы открыть прототип.</span>
        </p>
      </div>

      <!-- Карточки доступных прототипов -->
      <div *ngIf="visiblePrototypes.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <ui-card *ngFor="let proto of visiblePrototypes" [hoverable]="true" [padding]="'lg'" (cardClick)="navigate(proto.path)">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-lg bg-app-primary/10 text-app-primary flex items-center justify-center shrink-0">
              <lucide-icon [name]="proto.icon" [size]="20"></lucide-icon>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-medium text-text-primary truncate">{{ proto.label }}</h3>
                <ui-badge variant="primary">Прототип</ui-badge>
              </div>
              <p *ngIf="proto.description" class="text-sm text-text-secondary">{{ proto.description }}</p>
            </div>
            <lucide-icon name="arrow-right" [size]="18" class="text-text-disabled shrink-0 mt-1"></lucide-icon>
          </div>
        </ui-card>
      </div>

      <!-- Состояние: 0 кодов — большая карточка с замком -->
      <ui-card *ngIf="!hasAnyAccess" padding="lg" class="mb-8">
        <div class="flex flex-col items-center py-10 text-center">
          <div class="w-16 h-16 rounded-full bg-app-primary/10 flex items-center justify-center mb-4">
            <lucide-icon name="lock" [size]="32" class="text-app-primary"></lucide-icon>
          </div>
          <h3 class="text-lg font-medium text-text-primary mb-2">Доступ к прототипам</h3>
          <p class="text-sm text-text-secondary mb-6 max-w-md">
            Для просмотра прототипов введите код доступа.
            Если у вас есть прямая ссылка на прототип — перейдите по ней.
          </p>
          <button (click)="openCodeModal()"
                  class="px-6 py-2.5 bg-app-primary text-white font-medium rounded-lg hover:bg-app-primary/90 transition-colors flex items-center gap-2">
            <lucide-icon name="key-round" [size]="16"></lucide-icon>
            Ввести код доступа
          </button>
        </div>
      </ui-card>

      <!-- CTA: есть доступы, но не мастер — предложение ввести ещё код -->
      <ui-card *ngIf="hasAnyAccess && !hasMaster" padding="md" class="mb-8">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-surface-secondary flex items-center justify-center shrink-0">
            <lucide-icon name="key-round" [size]="20" class="text-text-secondary"></lucide-icon>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-text-secondary">
              Есть ещё код доступа? Введите его, чтобы открыть дополнительные прототипы.
            </p>
          </div>
          <button (click)="openCodeModal()"
                  class="px-4 py-2 text-sm font-medium text-app-primary border border-app-primary/30 rounded-lg hover:bg-app-primary/5 transition-colors shrink-0 flex items-center gap-1.5">
            <lucide-icon name="plus" [size]="14"></lucide-icon>
            Ввести код
          </button>
        </div>
      </ui-card>
    </div>

    <!-- Code input modal -->
    <ui-code-input-modal
      [visible]="showCodeModal"
      [error]="codeError"
      [locked]="isLocked"
      [lockoutRemainingMs]="lockoutRemainingMs"
      [remainingAttempts]="remainingAttempts"
      [maxAttempts]="maxAttempts"
      (codeSubmitted)="onCodeSubmit($event)"
      (closed)="onCodeModalClose()">
    </ui-code-input-modal>
  `,
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly accessService = inject(AccessCodeService);
  private readonly rateLimitService = inject(RateLimitService);

  showCodeModal = false;
  codeError = '';
  isLocked = false;
  lockoutRemainingMs = 0;
  remainingAttempts = 10;
  maxAttempts = 10;

  get hasMaster(): boolean {
    return this.accessService.hasMasterAccess();
  }

  get hasAnyAccess(): boolean {
    return this.accessService.getAccessiblePrototypeSlugs().length > 0;
  }

  get visiblePrototypes() {
    if (this.hasMaster) return PROTOTYPES;
    const slugs = this.accessService.getAccessiblePrototypeSlugs();
    if (slugs.length === 0) return [];
    return PROTOTYPES.filter(p => {
      const slug = p.path.replace('/prototype/', '');
      return slugs.includes(slug);
    });
  }

  async ngOnInit(): Promise<void> {
    await this.accessService.checkCodeFromUrl();
    await this.rateLimitService.init();
    this.updateRateLimitState();
  }

  openCodeModal(): void {
    this.updateRateLimitState();
    this.showCodeModal = true;
    this.codeError = '';
  }

  async onCodeSubmit(code: string): Promise<void> {
    const result = await this.accessService.validateAndStoreCode(code);
    this.updateRateLimitState();

    if (result.type === 'locked') {
      this.codeError = '';
      return;
    }

    if (result.valid) {
      this.showCodeModal = false;
      this.codeError = '';
    } else {
      this.codeError = 'Неверный код доступа';
    }
  }

  onCodeModalClose(): void {
    this.showCodeModal = false;
    this.codeError = '';
  }

  navigate(path: string): void {
    this.router.navigateByUrl(path);
  }

  private updateRateLimitState(): void {
    this.isLocked = this.rateLimitService.isLocked();
    this.lockoutRemainingMs = this.rateLimitService.getRemainingLockMs();
    this.remainingAttempts = this.rateLimitService.getRemainingAttempts();
    this.maxAttempts = this.rateLimitService.getMaxAttempts();
  }
}
