import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceStats } from './performance-stats';

describe('PerformanceStats', () => {
  let component: PerformanceStats;
  let fixture: ComponentFixture<PerformanceStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerformanceStats]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerformanceStats);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
