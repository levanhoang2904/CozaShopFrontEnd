import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  private isShowHeaderSubject = new BehaviorSubject<boolean>(false);
  isShowHeader$ = this.isShowHeaderSubject.asObservable();
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  constructor() {}
  getData() {
    return this.isShowHeader$;
  }

  updateData(value: boolean) {
    this.isShowHeaderSubject.next(value);
  }

  updateLoginStatus(value: boolean) {
    this.isLoggedInSubject.next(value);
    return this.isLoggedIn$;
  }

  getLoginStatus() {
    return this.isLoggedIn$;
  }
}
