import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordGather } from './word-gather';

describe('WordGather', () => {
  let component: WordGather;
  let fixture: ComponentFixture<WordGather>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordGather]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordGather);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
