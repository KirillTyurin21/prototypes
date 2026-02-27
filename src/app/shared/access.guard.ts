import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AccessCodeService } from './access-code.service';

export const accessGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const accessService = inject(AccessCodeService);
  await accessService.checkCodeFromUrl();
  return true;
};
