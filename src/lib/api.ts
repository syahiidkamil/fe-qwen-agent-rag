import axios, { AxiosError, type AxiosInstance } from "axios";

import { supabase } from "./supabase";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3081";

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(code: string, message: string, status: number, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
});

// Attach the Supabase access token to every request. The backend ignores
// missing tokens on public endpoints (/api/chat, GET /api/landing-config),
// and requires them on admin endpoints.
api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Map the backend's `{error: {code, message, details}}` envelope to ApiError.
api.interceptors.response.use(
  (resp) => resp,
  (error: AxiosError<{ error?: { code: string; message: string; details?: unknown } }>) => {
    if (error.response) {
      // FastAPI wraps HTTPException.detail as { detail: {...} }; we raise the
      // {error: {code, message}} envelope inside that wrapper, so accept both
      // top-level and detail-nested shapes.
      const data = error.response.data as
        | { error?: { code: string; message: string; details?: unknown } }
        | { detail?: { error?: { code: string; message: string; details?: unknown } } }
        | undefined;
      const payload =
        (data as { error?: { code: string; message: string; details?: unknown } })?.error ??
        (data as { detail?: { error?: { code: string; message: string; details?: unknown } } })
          ?.detail?.error;
      if (payload) {
        return Promise.reject(
          new ApiError(payload.code, payload.message, error.response.status, payload.details),
        );
      }
      return Promise.reject(
        new ApiError("HTTP_ERROR", error.message, error.response.status),
      );
    }
    return Promise.reject(new ApiError("NETWORK_ERROR", error.message, 0));
  },
);

export const STREAM_URL = (path: string) => `${BASE_URL}${path}`;
