import { TestBed } from '@angular/core/testing';

import { ProductSizeService } from './product-size.service';

describe('ProductSizeService', () => {
  let service: ProductSizeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductSizeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
