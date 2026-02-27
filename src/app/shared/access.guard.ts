import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AccessCodeService } from './access-code.service';

export const accessGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const accessService = inject(AccessCodeService);
  const router = inject(Router);

  await accessService.checkCodeFromUrl();

  // Определяем slug прототипа из маршрута
  // Маршрут: path: 'prototype/<slug>' → route.url = [{path:'prototype'}, {path:'slug'}]
  const segments = route.url.map(s => s.path);
  const protoIndex = segments.indexOf('prototype');
  const slug = protoIndex >= 0 && segments.length > protoIndex + 1
    ? segments[protoIndex + 1]
    : segments[segments.length - 1] || '';

  // Если slug определён и доступа нет — блокируем навигацию
  if (slug && slug !== 'prototype' && !accessService.hasAccessToPrototype(slug)) {
    return router.createUrlTree(['/']);
  }

  return true;
};
