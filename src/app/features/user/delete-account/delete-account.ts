import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

@Component({ selector: 'app-delete-account', imports: [ReactiveFormsModule, RouterLink], templateUrl: './delete-account.html', styleUrl: './delete-account.scss' })
export class DeleteAccount {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly step = signal<1 | 2>(1);
  readonly isProcessing = signal(false);
  readonly error = signal('');

  readonly form = this.fb.group({
    password: ['', Validators.required],
    confirm: ['', Validators.required],
  });

  goToStep2(): void {
    if (this.form.controls['confirm'].value !== 'DELETE') {
      this.error.set('নিশ্চিত করতে "DELETE" টাইপ করুন।'); return;
    }
    this.step.set(2);
    this.error.set('');
  }

  deleteAccount(): void {
    this.isProcessing.set(true);
    this.http.delete(`${environment.apiBaseUrl}/auth/user/delete/`, {
      body: { password: this.form.value.password },
    }).subscribe({
      next: () => { this.authService.logout(); this.router.navigate(['/']); },
      error: (err) => { this.isProcessing.set(false); this.error.set(err.error?.detail || 'অ্যাকাউন্ট মুছতে ব্যর্থ হয়েছে।'); },
    });
  }
}
