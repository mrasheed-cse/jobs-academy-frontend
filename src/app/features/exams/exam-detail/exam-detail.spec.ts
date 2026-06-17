import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { ExamDetail } from './exam-detail';

describe('ExamDetail', () => {
  let component: ExamDetail;
  let fixture: ComponentFixture<ExamDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamDetail],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ examId: 'test-exam-id' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExamDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
