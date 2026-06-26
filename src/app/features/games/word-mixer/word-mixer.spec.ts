import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordMixer } from './word-mixer';

describe('WordMixer', () => {
  let component: WordMixer;
  let fixture: ComponentFixture<WordMixer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordMixer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordMixer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
