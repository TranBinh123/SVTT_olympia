import { useState } from "react";
import type { FormEvent } from "react";

const SESSION_KEY = "olympia-admin-unlocked";

// Đặt mật khẩu bằng biến môi trường VITE_ADMIN_PASSWORD (Vercel > Settings > Environment Variables).
// Mặc định "banacode" chỉ để chạy thử: PHẢI đổi trước khi deploy.
const ADMIN_PASSWORD =
  (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) || "banacode";

export function isAdminUnlocked(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

type Props = {
  onUnlock: () => void;
};

export function AdminGate({ onUnlock }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (value === ADMIN_PASSWORD) {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }
      onUnlock();
    } else {
      setError(true);
      setValue("");
    }
  };

  return (
    <main className="admin-page">
      <section
        className="admin-card"
        style={{ maxWidth: 420, margin: "60px auto" }}
      >
        <div className="section-label">🔒 KHU VỰC QUẢN TRỊ</div>
        <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
          <input
            type="password"
            autoFocus
            value={value}
            placeholder="Nhập mật khẩu quản trị"
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
          />
          {error && (
            <small style={{ color: "#dc2626", fontWeight: 700 }}>
              Sai mật khẩu.
            </small>
          )}
          <button type="submit" className="primary-button">
            MỞ KHÓA
          </button>
        </form>
      </section>
    </main>
  );
}
