import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AccessCodeService } from './access-code.service';

export const accessGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const accessService = inject(AccessCodeService);
  accessService.checkCodeFromUrl();
  return true;
};
