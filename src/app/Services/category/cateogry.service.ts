import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CateogryService {
  _id!: string
  namecategory!: string
  note!: string
  constructor() { }
}
