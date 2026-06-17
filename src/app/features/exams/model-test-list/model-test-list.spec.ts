import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { ModelTestList } from './model-test-list';

describe('ModelTestList', () => {
  let component: ModelTestList;
  let fixture: ComponentFixture<ModelTestList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelTestList],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ typeId: '1' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModelTestList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
