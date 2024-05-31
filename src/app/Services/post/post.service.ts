import { Injectable } from '@angular/core';
import { CateogryService } from '../category/cateogry.service';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  _id!: string;
  title!: string;
  category!: CateogryService;
  thumbnail!: string;
  description!: string;
  status!: number;
  createDate!: Date;
  constructor() {}
}
