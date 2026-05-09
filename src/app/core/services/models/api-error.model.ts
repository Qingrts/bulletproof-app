export interface ApiError {
  code: number;
  message: string;
  details?: unknown;
  timestamp: string;
}