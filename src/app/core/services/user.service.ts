import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/auth/user/me/`);
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/auth/user/update/`, data);
  }

  uploadProfilePicture(file: File): Observable<{ profile_picture: string }> {
    const form = new FormData();
    form.append('profile_picture', file);
    return this.http.patch<{ profile_picture: string }>(`${this.baseUrl}/auth/user/update/`, form);
  }

  changePassword(oldPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/auth/change-password/`, {
      old_password: oldPassword,
      new_password: newPassword,
    });
  }
}
