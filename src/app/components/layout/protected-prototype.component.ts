import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { AccessCodeService } from '@/shared/access-code.service';
import { RateLimitService } from '@/shared/rate-limit.service';
import { CodeInputModalComponent } from '@/components/ui/code-input-modal.component';

/**
 * Обёртка для прототипов с проверкой кода доступа.
 * Если у пользователя есть доступ — показывает содержимое (router-outlet).
 * Если нет — показывает модалку ввода кода.
 */
@Component({
  selector: 'app-protected-prototype',
  standalone: true,
  imports: [CommonModule, RouterOutlet, CodeInputModalComponent],
  template: `
    <router-outlet *ngIf="hasAccess"></router-outlet>

    <ui-code-input-modal
      [visible]="!hasAccess"
      [title]="'Доступ к прототипу'"
      [subtitle]="'Введите код доступа для просмотра этого прототипа'"
      [error]="codeError"
      [locked]="isLocked"
      [lockoutRemainingMs]="lockoutRemainingMs"
      [remainingAttempts]="remainingAttempts"
      [maxAttempts]="maxAttempts"
      (codeSubmitted)="onCodeSubmit($event)"
      (closed)="onClose()"
    ></ui-code-input-modal>
  `,
})
export class ProtectedPrototypeComponent implements OnInit {
  private accessService = inject(AccessCodeService);
  private rateLimitService = inject(RateLimitService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  codeError = '';
  isLocked = false;
  lockoutRemainingMs = 0;
  remainingAttempts = 10;
  maxAttempts = 10;

  get slug(): string {
    // Берём slug из URL: /prototype/<slug>/...
    const url = this.router.url;
    const match = url.match(/\/prototype\/([^/?#/]+)/);
    return match ? match[1] : '';
  }

  get hasAccess(): boolean {
    return this.accessService.hasAccessToPrototype(this.slug);
  }

  async ngOnInit(): Promise<void> {
    await this.accessService.checkCodeFromUrl();
    await this.rateLimitService.init();
    this.updateRateLimitState();
  }

  async onCodeSubmit(code: string): Promise<void> {
    const result = await this.accessService.validateAndStoreCode(code);
    this.updateRateLimitState();

    if (result.type === 'locked') {
      this.codeError = '';
      return;
    }

    if (result.valid && this.hasAccess) {
      this.codeError = '';
    } else if (result.valid) {
      // Код валиден, но не для этого прототипа
      this.codeError = 'Этот код не даёт доступ к данному прототипу';
    } else {
      this.codeError = 'Неверный код доступа';
    }
  }

  onClose(): void {
    this.codeError = '';
    this.router.navigateByUrl('/');
  }

  private updateRateLimitState(): void {
    this.isLocked = this.rateLimitService.isLocked();
    this.lockoutRemainingMs = this.rateLimitService.getRemainingLockMs();
    this.remainingAttempts = this.rateLimitService.getRemainingAttempts();
    this.maxAttempts = this.rateLimitService.getMaxAttempts();
  }
}
