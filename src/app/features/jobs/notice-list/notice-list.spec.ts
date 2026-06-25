import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { NoticeList } from './notice-list';

describe('NoticeList', () => {
  let component: NoticeList;
  let fixture: ComponentFixture<NoticeList>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoticeList],
      providers: [
        provideRouter([]), provideHttpClient(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1', typeId: '1', examId: '1', categoryId: '1' }) } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(NoticeList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });
  it('should create', () => { expect(component).toBeTruthy(); });
});
