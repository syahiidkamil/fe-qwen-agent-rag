import { useRef, useState } from "react";
import { Upload, Trash2, Check } from "lucide-react";
import { useConfigStore } from "@/stores/useConfigStore";
import { BrandMark } from "@/components/shared/BrandMark";
import { LogoService } from "@/services/LogoService";

const ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml";
const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];
const MAX_BYTES = 2 * 1024 * 1024; // 2MB

/**
 * Super-admin company-logo control. Uploading writes `config.logo_url`
 * server-side (it overrides the brand mark for every user) and patches the
 * editing config so the live sidebars/login swap immediately AND a subsequent
 * CMS "Save" round-trips the value.
 */
export function CmsLogoField() {
  const fileRef = useRef<HTMLInputElement>(null);
  const logoUrl = useConfigStore((s) => s.config.logo_url);
  const patchConfig = useConfigStore((s) => s.patchConfig);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const hasLogo = typeof logoUrl === "string" && logoUrl.length > 0;

  const onSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so re-selecting the same file fires onChange again.
    e.target.value = "";
    if (!file) return;

    setSaved(false);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Use a PNG, JPG, WEBP, or SVG image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be 2MB or smaller.");
      return;
    }
    setError(null);

    setBusy(true);
    try {
      const { logo_url } = await LogoService.upload(file);
      // Server persisted it; mirror into the editing config so the override
      // applies app-wide now and survives the next whole-config Save.
      patchConfig({ logo_url: logo_url ?? "" });
      setSaved(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const onRemove = async () => {
    setSaved(false);
    setError(null);
    setBusy(true);
    try {
      await LogoService.remove();
      // Empty string reverts BrandMark to the default SVG and round-trips on Save.
      patchConfig({ logo_url: "" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Remove failed";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="field">
      <div className="field-label">
        <span>Company logo</span>
        {hasLogo ? <span>custom</span> : <span>default</span>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: 10,
            border: "1px solid var(--line)",
            background: "var(--paper)",
            flexShrink: 0,
          }}
        >
          <BrandMark size={48} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
            >
              <Upload size={12} strokeWidth={1.6} />
              {busy ? "Uploading…" : hasLogo ? "Replace" : "Upload"}
            </button>
            {hasLogo && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={onRemove}
                disabled={busy}
              >
                <Trash2 size={12} strokeWidth={1.6} />
                Reset to default
              </button>
            )}
            {saved && !busy && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: "var(--teal-deep)",
                }}
              >
                <Check size={12} strokeWidth={2} />
                Saved
              </span>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT}
            hidden
            onChange={onSelect}
          />
        </div>
      </div>

      {error && <div className="field-error">{error}</div>}

      <p style={{ color: "var(--ink-2)", fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>
        Applies to all users. PNG/JPG/WEBP/SVG, max 2MB. The logo is saved
        immediately.
      </p>
    </div>
  );
}
