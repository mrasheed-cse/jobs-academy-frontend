import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { DeleteAccount } from './delete-account';

describe('DeleteAccount', () => {
  let component: DeleteAccount;
  let fixture: ComponentFixture<DeleteAccount>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteAccount],
      providers: [
        provideRouter([]), provideHttpClient(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DeleteAccount);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });
  it('should create', () => { expect(component).toBeTruthy(); });
});
