import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;

  readonly canManageDictionary = () => {
    const role = this.currentUser()?.role;
    return role === 'admin' || role === 'teacher';
  };

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
