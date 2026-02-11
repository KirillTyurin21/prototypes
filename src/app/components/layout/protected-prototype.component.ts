import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { AccessCodeService } from '@/shared/access-code.service';
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
      (codeSubmitted)="onCodeSubmit($event)"
      (closed)="onClose()"
    ></ui-code-input-modal>
  `,
})
export class ProtectedPrototypeComponent implements OnInit {
  private accessService = inject(AccessCodeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  codeError = '';

  get slug(): string {
    // Берём slug из URL: /prototype/<slug>/...
    const url = this.router.url;
    const match = url.match(/\/prototype\/([^/?#/]+)/);
    return match ? match[1] : '';
  }

  get hasAccess(): boolean {
    return this.accessService.hasAccessToPrototype(this.slug);
  }

  ngOnInit(): void {
    this.accessService.checkCodeFromUrl();
  }

  onCodeSubmit(code: string): void {
    const result = this.accessService.validateAndStoreCode(code);
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
}
