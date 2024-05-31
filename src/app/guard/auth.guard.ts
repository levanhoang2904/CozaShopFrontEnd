import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const localData = localStorage.getItem('accessToken');
  if (localData != null) {
    return true;
  } else {
    router.navigateByUrl('/login');
    return false;
  }
};

export const isAdmin: CanActivateFn = () => {
  const router = inject(Router);
  const localData = localStorage.getItem('user');
  if (localData != null) {
    const user = JSON.parse(localData)
    if (user.role === 'admin') return true
    router.navigateByUrl('/noAccess')
    return false
  } else {
    router.navigateByUrl('/login');
    return false;
  }
}
