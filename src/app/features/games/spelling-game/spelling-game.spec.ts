import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { SpellingGame } from './spelling-game';

describe('SpellingGame', () => {
  let component: SpellingGame;
  let fixture: ComponentFixture<SpellingGame>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpellingGame],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
    fixture = TestBed.createComponent(SpellingGame);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });
  it('should create', () => { expect(component).toBeTruthy(); });
});
