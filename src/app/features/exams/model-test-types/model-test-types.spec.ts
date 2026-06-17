import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelTestTypes } from './model-test-types';

describe('ModelTestTypes', () => {
  let component: ModelTestTypes;
  let fixture: ComponentFixture<ModelTestTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelTestTypes],
    }).compileComponents();

    fixture = TestBed.createComponent(ModelTestTypes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
