import { Injectable } from '@angular/core';
import { ProductSizeService } from '../product-size/product-size.service';

@Injectable({
  providedIn: 'root',
})
export class ProductDetailService {
  _id!: string;
  color!: string;
  image!: string;
  _idProduct!: string;
  sizes!: ProductSizeService[];
  constructor() {}
}
