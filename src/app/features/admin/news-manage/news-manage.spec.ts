import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NewsManage } from './news-manage';

describe('NewsManage', () => {
  let component: NewsManage;
  let fixture: ComponentFixture<NewsManage>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsManage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(NewsManage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });
  it('should create', () => { expect(component).toBeTruthy(); });
});
