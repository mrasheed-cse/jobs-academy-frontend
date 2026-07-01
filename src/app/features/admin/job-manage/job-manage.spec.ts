import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { JobManage } from './job-manage';

describe('JobManage', () => {
  let component: JobManage;
  let fixture: ComponentFixture<JobManage>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobManage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(JobManage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });
  it('should create', () => { expect(component).toBeTruthy(); });
});
