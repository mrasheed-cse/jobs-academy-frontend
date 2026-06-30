import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { WordMixer } from './word-mixer';

describe('WordMixer', () => {
  let component: WordMixer;
  let fixture: ComponentFixture<WordMixer>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordMixer],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
    fixture = TestBed.createComponent(WordMixer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });
  it('should create', () => { expect(component).toBeTruthy(); });
});
