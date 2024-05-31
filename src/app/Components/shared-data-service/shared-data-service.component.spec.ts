import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedDataServiceComponent } from './shared-data-service.component';

describe('SharedDataServiceComponent', () => {
  let component: SharedDataServiceComponent;
  let fixture: ComponentFixture<SharedDataServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedDataServiceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SharedDataServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
