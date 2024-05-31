import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingGuideComponent } from './shopping-guide.component';

describe('ShoppingGuideComponent', () => {
  let component: ShoppingGuideComponent;
  let fixture: ComponentFixture<ShoppingGuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppingGuideComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShoppingGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
