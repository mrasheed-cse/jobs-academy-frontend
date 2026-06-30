import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { WordGather } from './word-gather';

describe('WordGather', () => {
  let component: WordGather;
  let fixture: ComponentFixture<WordGather>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordGather],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
    fixture = TestBed.createComponent(WordGather);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });
  it('should create', () => { expect(component).toBeTruthy(); });
});
