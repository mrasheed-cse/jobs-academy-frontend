import { TestBed } from '@angular/core/testing';
import { ExamAttempt } from './exam-attempt';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('ExamAttempt', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamAttempt],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ExamAttempt);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
