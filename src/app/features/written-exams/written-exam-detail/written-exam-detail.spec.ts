import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { WrittenExamDetail } from './written-exam-detail';

describe('WrittenExamDetail', () => {
  let component: WrittenExamDetail;
  let fixture: ComponentFixture<WrittenExamDetail>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WrittenExamDetail],
      providers: [
        provideRouter([]), provideHttpClient(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(WrittenExamDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });
  it('should create', () => { expect(component).toBeTruthy(); });
});
