export interface ApiErrorDetail {
  detail?: string;
  error?: string;
  message?: string;
  [field: string]: unknown;
}
