import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({ selector: 'app-settings', imports: [ReactiveFormsModule, RouterLink], templateUrl: './settings.html', styleUrl: './settings.scss' })
export class Settings implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSaving = signal(false);
  readonly saveSuccess = signal(false);
  readonly saveError = signal('');

  readonly passwordForm = this.fb.group({
    old_password: ['', Validators.required],
    new_password: ['', [Validators.required, Validators.minLength(8)]],
    confirm_password: ['', Validators.required],
  });

  ngOnInit(): void {}

  changePassword(): void {
    const { old_password, new_password, confirm_password } = this.passwordForm.getRawValue();
    if (new_password !== confirm_password) { this.saveError.set('নতুন পাসওয়ার্ড মিলছে না।'); return; }
    this.isSaving.set(true);
    this.saveError.set('');
    this.userService.changePassword(old_password!, new_password!).subscribe({
      next: () => { this.isSaving.set(false); this.saveSuccess.set(true); this.passwordForm.reset(); },
      error: (err) => { this.isSaving.set(false); this.saveError.set(err.error?.detail || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।'); },
    });
  }

  logout(): void { this.authService.logout(); this.router.navigate(['/']); }
}
