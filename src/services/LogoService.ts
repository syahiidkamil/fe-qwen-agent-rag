import { api } from "@/lib/api";

/** Returned by both POST and DELETE /api/branding/logo. `logo_url` is the new
 *  public URL after upload, or `null` after removal/reset-to-default. */
export interface LogoResult {
  logo_url: string | null;
  updated_at: string;
}

/**
 * Super-admin company-logo management. The backend persists the uploaded image
 * AND writes `config.logo_url` into the landing-config blob, so the override
 * propagates to every user via GET /api/landing-config.
 */
export const LogoService = {
  /** Upload a new logo image (multipart, field name "file"). */
  async upload(file: File): Promise<LogoResult> {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await api.post<{ data: LogoResult }>(
      "/api/branding/logo",
      fd,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data.data;
  },

  /** Remove the uploaded logo, reverting to the default brand mark. */
  async remove(): Promise<LogoResult> {
    const { data } = await api.delete<{ data: LogoResult }>(
      "/api/branding/logo",
    );
    return data.data;
  },
};
