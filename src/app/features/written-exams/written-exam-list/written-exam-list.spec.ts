import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WrittenExamList } from './written-exam-list';

describe('WrittenExamList', () => {
  let component: WrittenExamList;
  let fixture: ComponentFixture<WrittenExamList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WrittenExamList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WrittenExamList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
