import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordGames } from './word-games';

describe('WordGames', () => {
  let component: WordGames;
  let fixture: ComponentFixture<WordGames>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordGames]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordGames);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
