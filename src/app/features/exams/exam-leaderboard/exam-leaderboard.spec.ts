import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { ExamLeaderboard } from './exam-leaderboard';

describe('ExamLeaderboard', () => {
  let component: ExamLeaderboard;
  let fixture: ComponentFixture<ExamLeaderboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamLeaderboard],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ examId: 'test-exam-id' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExamLeaderboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
