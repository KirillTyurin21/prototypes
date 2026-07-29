import { Component, inject, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-phoenix-prototype',
  standalone: true,
  imports: [],
  template: `
    <iframe
      [src]="safeUrl"
      class="w-full min-h-[100dvh] border-0"
      title="Phoenix — Kiosk 2.0"
    ></iframe>
  `,
})
export class PhoenixPrototypeComponent implements OnInit {
  private sanitizer = inject(DomSanitizer);
  safeUrl: SafeResourceUrl = '';

  ngOnInit() {
    const url = '/assets/static-prototypes/phoenix/index.html';
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
