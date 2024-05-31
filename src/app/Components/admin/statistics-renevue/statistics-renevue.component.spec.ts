import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticsRenevueComponent } from './statistics-renevue.component';

describe('StatisticsRenevueComponent', () => {
  let component: StatisticsRenevueComponent;
  let fixture: ComponentFixture<StatisticsRenevueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatisticsRenevueComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StatisticsRenevueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
