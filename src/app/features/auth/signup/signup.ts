import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

interface FieldErrors {
  username?: string;
  phone_number?: string;
  email?: string;
  password?: string;
  role?: string;
}

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone_number: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  readonly fieldErrors = signal<FieldErrors>({});
  readonly errorMessage = signal<string>('');
  readonly isSubmitting = signal(false);

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.fieldErrors.set({});
    this.errorMessage.set('');
    this.isSubmitting.set(true);

    const { username, email, phone_number, password } = this.form.getRawValue();

    this.authService
      .signup({
        username: username!,
        email: email!,
        phone_number: phone_number!,
        password: password!,
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/dashboard']);
        },
        error: (err: HttpErrorResponse) => {
          this.isSubmitting.set(false);
          this.applyServerErrors(err);
        },
      });
  }

  private applyServerErrors(err: HttpErrorResponse): void {
    const data = err.error ?? {};
    const errors: FieldErrors = {};

    const joinIfArray = (value: unknown): string | undefined =>
      Array.isArray(value) ? value.join(', ') : typeof value === 'string' ? value : undefined;

    if (data.username) errors.username = joinIfArray(data.username);
    if (data.phone_number) errors.phone_number = joinIfArray(data.phone_number);
    if (data.email) errors.email = joinIfArray(data.email);
    if (data.password) errors.password = joinIfArray(data.password);
    if (data.role) errors.role = joinIfArray(data.role);

    this.fieldErrors.set(errors);

    if (data.non_field_errors) {
      this.errorMessage.set(joinIfArray(data.non_field_errors) ?? 'Registration failed.');
    } else if (Object.keys(errors).length === 0) {
      this.errorMessage.set(data.detail || 'Registration failed. Please try again.');
    }
  }
}
