import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageHome } from './language-home';

describe('LanguageHome', () => {
  let component: LanguageHome;
  let fixture: ComponentFixture<LanguageHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LanguageHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
