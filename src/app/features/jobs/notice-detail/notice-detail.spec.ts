import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { NoticeDetail } from './notice-detail';

describe('NoticeDetail', () => {
  let component: NoticeDetail;
  let fixture: ComponentFixture<NoticeDetail>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoticeDetail],
      providers: [
        provideRouter([]), provideHttpClient(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1', typeId: '1', examId: '1', categoryId: '1' }) } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(NoticeDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });
  it('should create', () => { expect(component).toBeTruthy(); });
});
