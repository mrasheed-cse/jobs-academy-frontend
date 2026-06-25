import { Component, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({ selector: 'app-contact', imports: [ReactiveFormsModule], templateUrl: './contact.html', styleUrl: './contact.scss' })
export class Contact {
  private fb = inject(FormBuilder);
  readonly submitted = signal(false);
  readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(20)]],
  });

  onSubmit(): void {
    if (this.form.valid) this.submitted.set(true);
    else this.form.markAllAsTouched();
  }
}
