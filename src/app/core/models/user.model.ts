export type UserRole = 'admin' | 'teacher' | 'student' | 'operator';

export interface User {
  id: number;
  username: string;
  phone_number: string;
  role: UserRole;
  email: string;
  address: string;
  other_information: string;
  profile_picture: string | null;
  date_of_birth: string | null;
  gender: string | null;
  secondary_phone_number: string;
  facebook_profile: string;
  twitter_profile: string;
  linkedin_profile: string;
  bio: string;
  preferences: Record<string, unknown>;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface SignupResponse extends AuthTokens {
  user: User;
}

export interface LoginRequest {
  phone_number: string;
  password: string;
}

export interface SignupRequest {
  phone_number: string;
  email: string;
  username: string;
  password: string;
  role?: UserRole;
  address?: string;
  other_information?: string;
  date_of_birth?: string;
  gender?: string;
  secondary_phone_number?: string;
  facebook_profile?: string;
  twitter_profile?: string;
  linkedin_profile?: string;
  bio?: string;
}

export interface UserRoleResponse {
  role: UserRole;
  username: string;
  user_id: number;
}
