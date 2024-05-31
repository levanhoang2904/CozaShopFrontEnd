import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticsProductComponent } from './statistics-product.component';

describe('StatisticsProductComponent', () => {
  let component: StatisticsProductComponent;
  let fixture: ComponentFixture<StatisticsProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatisticsProductComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StatisticsProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
