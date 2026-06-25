import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { PastExamDetail } from './past-exam-detail';

describe('PastExamDetail', () => {
  let component: PastExamDetail;
  let fixture: ComponentFixture<PastExamDetail>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PastExamDetail],
      providers: [
        provideRouter([]), provideHttpClient(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1', typeId: '1', examId: '1', categoryId: '1' }) } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PastExamDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });
  it('should create', () => { expect(component).toBeTruthy(); });
});
