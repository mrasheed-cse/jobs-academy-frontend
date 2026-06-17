import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { ExamTake } from './exam-take';

describe('ExamTake', () => {
  let component: ExamTake;
  let fixture: ComponentFixture<ExamTake>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamTake],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ examId: 'test-exam-id' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExamTake);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
