import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { JobDetail } from './job-detail';

describe('JobDetail', () => {
  let component: JobDetail;
  let fixture: ComponentFixture<JobDetail>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobDetail],
      providers: [
        provideRouter([]), provideHttpClient(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1', typeId: '1', examId: '1', categoryId: '1' }) } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(JobDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });
  it('should create', () => { expect(component).toBeTruthy(); });
});
