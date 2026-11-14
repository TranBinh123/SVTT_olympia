import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

export const SESSION_PREFIX = "olympia-session:";

/**
 * useState nhưng lưu vào localStorage để F5 giữa lượt chơi không mất trạng thái.
 * Mọi lỗi localStorage (private mode, quota) đều bị nuốt, app vẫn chạy bình thường.
 */
export function usePersistentState<T>(
  key: string,
  initial: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
  const storageKey = SESSION_PREFIX + key;
  const initialRef = useRef(initial);

  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw !== null) return JSON.parse(raw) as T;
    } catch {
      /* ignore */
    }
    const init = initialRef.current;
    return typeof init === "function" ? (init as () => T)() : init;
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [storageKey, value]);

  const set = useCallback<Dispatch<SetStateAction<T>>>(
    (next) => setValue(next),
    [],
  );

  return [value, set];
}

/** Xóa toàn bộ trạng thái ván đang chơi (dùng khi reset điểm / làm lại). */
export function clearSessionState(scope = ""): void {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(SESSION_PREFIX + scope))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}
