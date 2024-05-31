import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  hasValue(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}
