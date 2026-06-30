import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { DictionaryManage } from './dictionary-manage';

describe('DictionaryManage', () => {
  let component: DictionaryManage;
  let fixture: ComponentFixture<DictionaryManage>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DictionaryManage],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
    fixture = TestBed.createComponent(DictionaryManage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });
  it('should create', () => { expect(component).toBeTruthy(); });
});
