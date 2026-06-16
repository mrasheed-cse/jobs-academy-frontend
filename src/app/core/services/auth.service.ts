import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthTokens,
  LoginRequest,
  SignupRequest,
  SignupResponse,
  User,
  UserRoleResponse,
} from '../models/user.model';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.apiBaseUrl;

  private readonly currentUserSignal = signal<User | null>(this.readStoredUser());
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null || !!this.getAccessToken());

  constructor(private http: HttpClient) {}

  signup(payload: SignupRequest): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.baseUrl}/auth/signup/`, payload).pipe(
      tap((res) => this.storeSession(res.user, { access: res.access, refresh: res.refresh })),
    );
  }

  login(payload: LoginRequest): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.baseUrl}/auth/login/`, payload).pipe(
      tap((tokens) => {
        this.setTokens(tokens);
        // Login only returns tokens; fetch the profile separately so currentUser is populated.
        this.fetchAndStoreCurrentUser().subscribe();
      }),
    );
  }

  fetchAndStoreCurrentUser(): Observable<User | null> {
    if (!this.getAccessToken()) {
      return of(null);
    }
    return this.http.get<User>(`${this.baseUrl}/auth/user/me/`).pipe(
      tap((user) => {
        this.currentUserSignal.set(user);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }

  getUserRole(): Observable<UserRoleResponse> {
    return this.http.get<UserRoleResponse>(`${this.baseUrl}/auth/user-role/`);
  }

  refreshAccessToken(): Observable<{ access: string }> {
    const refresh = this.getRefreshToken();
    return this.http.post<{ access: string }>(`${this.baseUrl}/auth/token/refresh/`, { refresh }).pipe(
      tap((res) => localStorage.setItem(ACCESS_TOKEN_KEY, res.access)),
    );
  }

  logout(): void {
    // Best-effort server-side call; token is discarded client-side regardless of the result,
    // since this API does not blacklist tokens.
    this.http.post(`${this.baseUrl}/auth/logout/`, {}).subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  requestOtp(phoneNumber: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/auth/request-otp/`, { phone_number: phoneNumber });
  }

  verifyOtp(phoneNumber: string, otp: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/auth/verify-otp/`, {
      phone_number: phoneNumber,
      otp,
      new_password: newPassword,
    });
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  private setTokens(tokens: AuthTokens): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
  }

  private storeSession(user: User, tokens: AuthTokens): void {
    this.setTokens(tokens);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSignal.set(null);
  }

  private readStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
