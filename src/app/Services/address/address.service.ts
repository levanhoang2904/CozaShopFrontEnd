import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  _id?: string;
  name?: string;
  phone?: string;
  detailAddress?: string;
  city?: string;
  district?: string;
  ward?: string;
  note?: string;
  constructor() {}
}
