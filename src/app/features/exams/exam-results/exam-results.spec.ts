import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { ExamResults } from './exam-results';

describe('ExamResults', () => {
  let component: ExamResults;
  let fixture: ComponentFixture<ExamResults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamResults],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ examId: 'test-exam-id' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExamResults);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
