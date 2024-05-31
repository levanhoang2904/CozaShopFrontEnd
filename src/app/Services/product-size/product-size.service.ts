import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProductSizeService {
  _id!: string;
  size!: string;
  quantity!: number;
  constructor() {}
}
