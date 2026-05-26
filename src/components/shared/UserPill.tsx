import { useAuthStore } from "@/stores/useAuthStore";

/**
 * Compact identity pill shown in the topbar: avatar circle + display
 * name + email. Reads from the auth store directly so callers don't
 * have to thread props through layout components.
 */
export function UserPill() {
  const email = useAuthStore((s) => s.email);
  if (!email) return null;

  const localPart = email.split("@")[0];
  const namePart = localPart.split(/[._]/)[0] || "User";
  const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
  const initial = displayName.charAt(0);

  return (
    <div className="user-pill" aria-label={`Signed in as ${email}`}>
      <div className="user-pill-av">{initial}</div>
      <div className="user-pill-meta">
        <div className="user-pill-name">{displayName}</div>
        <div className="user-pill-mail">{email}</div>
      </div>
    </div>
  );
}
