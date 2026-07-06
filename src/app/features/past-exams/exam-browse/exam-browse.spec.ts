import { TestBed } from '@angular/core/testing';
import { ExamBrowse } from './exam-browse';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('ExamBrowse', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamBrowse],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ExamBrowse);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
