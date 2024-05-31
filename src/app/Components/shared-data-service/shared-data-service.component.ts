import { Component, EventEmitter, Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-shared-data-service',
  standalone: true,
  imports: [],
  templateUrl: './shared-data-service.component.html',
  styleUrl: './shared-data-service.component.css',
})
@Injectable({ providedIn: 'root' })
export class SharedDataService {
  accessToken = localStorage.getItem('accessToken');
  private routerChange: EventEmitter<any> = new EventEmitter();
  _socialUser: any = {};
  set socialUser(val: object) {
    this._socialUser = val;
  }

  public emitRouterChange() {
    this.routerChange.emit();
  }

  private isActiveSubject = new BehaviorSubject<boolean>(false);
  isActive$ = this.isActiveSubject.asObservable();

  convertText(data: string, action: string, encryptionKey: string): string {
    let result: string;
    if (action === 'encrypt') {
      result = CryptoJS.AES.encrypt(
        data.trim(),
        encryptionKey.trim()
      ).toString();
    } else if (action === 'decrypt') {
      result = CryptoJS.AES.decrypt(data.trim(), encryptionKey.trim()).toString(
        CryptoJS.enc.Utf8
      );
    } else {
      result = '';
      console.log('lỗi');
    }

    return result;
  }

  updateActive(value: boolean) {
    this.isActiveSubject.next(value);
  }
}
