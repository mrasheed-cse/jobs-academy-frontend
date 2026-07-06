import { TestBed } from '@angular/core/testing';
import { ExamManage } from './exam-manage';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('ExamManage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamManage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ExamManage);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
