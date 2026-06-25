import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { PastExamTypes } from './past-exam-types';

describe('PastExamTypes', () => {
  let component: PastExamTypes;
  let fixture: ComponentFixture<PastExamTypes>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PastExamTypes],
      providers: [
        provideRouter([]), provideHttpClient(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1', typeId: '1', examId: '1', categoryId: '1' }) } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PastExamTypes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });
  it('should create', () => { expect(component).toBeTruthy(); });
});
