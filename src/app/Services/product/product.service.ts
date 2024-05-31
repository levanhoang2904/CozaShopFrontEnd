import { Injectable } from '@angular/core';
import { ProductDetailService } from '../product-detail/product-detail.service';
import { CateogryService } from '../category/cateogry.service';
import { HttpServerService } from '../http-server/http-server.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  _id!: string;
  name!: string;
  categoryId!: CateogryService;
  price!: number;
  sale!: number;
  quantitySold: number = 0;
  path!: string;
  fabric!: string;
  details!: ProductDetailService[];
  constructor() {}
}
