import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({ selector: 'app-user-profile', imports: [ReactiveFormsModule, RouterLink], templateUrl: './user-profile.html', styleUrl: './user-profile.scss' })
export class UserProfile implements OnInit {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly user = signal<User | null>(null);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly saveSuccess = signal(false);
  readonly saveError = signal('');

  readonly form = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.email]],
    address: [''],
    bio: [''],
    gender: [''],
    date_of_birth: [''],
    secondary_phone_number: [''],
    facebook_profile: [''],
    twitter_profile: [''],
    linkedin_profile: [''],
  });

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (u) => {
        this.user.set(u);
        this.form.patchValue({
          username: u.username,
          email: u.email ?? '',
          address: u.address ?? '',
          bio: u.bio ?? '',
          gender: u.gender ?? '',
          date_of_birth: u.date_of_birth ?? '',
          secondary_phone_number: u.secondary_phone_number ?? '',
          facebook_profile: u.facebook_profile ?? '',
          twitter_profile: u.twitter_profile ?? '',
          linkedin_profile: u.linkedin_profile ?? '',
        });
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  onSave(): void {
    if (this.form.invalid) return;
    this.isSaving.set(true);
    this.saveSuccess.set(false);
    this.saveError.set('');
    this.userService.updateProfile(this.form.getRawValue() as Partial<User>).subscribe({
      next: (u) => {
        this.user.set(u);
        this.isSaving.set(false);
        this.saveSuccess.set(true);
        this.authService.fetchAndStoreCurrentUser().subscribe();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.saveError.set(err.error?.detail || 'সংরক্ষণ ব্যর্থ হয়েছে।');
      },
    });
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.userService.uploadProfilePicture(file).subscribe({
      next: (res) => this.user.update((u) => u ? { ...u, profile_picture: res.profile_picture } : u),
    });
  }
}
