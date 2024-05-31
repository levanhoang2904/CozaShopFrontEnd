import { TestBed } from '@angular/core/testing';

import { CateogryService } from './cateogry.service';

describe('CateogryService', () => {
  let service: CateogryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CateogryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
