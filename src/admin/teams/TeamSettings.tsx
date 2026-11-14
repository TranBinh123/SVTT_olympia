import { useEffect, useState } from "react";
import {
  DEFAULT_TEAM_COLORS,
  DEFAULT_TEAM_NAMES,
  useGameStore,
} from "../../core/store/gameStore";
import type { TeamId } from "../../core/types/game";

const MAX_LENGTH = 60;

// Gợi ý màu theo ngũ hành (người chơi vẫn có thể chọn màu tự do bằng bảng màu)
const PRESETS: { label: string; color: string }[] = [
  { label: "Mộc", color: "#22c55e" },
  { label: "Hỏa", color: "#ef4444" },
  { label: "Thổ", color: "#eab308" },
  { label: "Thủy", color: "#3b82f6" },
  { label: "Kim", color: "#94a3b8" },
  { label: "Cam", color: "#f97316" },
  { label: "Hồng", color: "#ec4899" },
  { label: "Tím", color: "#a855f7" },
  { label: "Ngọc", color: "#14b8a6" },
  { label: "Nâu", color: "#a16207" },
];

type Draft = { name: string; color: string };
type Drafts = Record<TeamId, Draft>;

export function TeamSettings() {
  const teams = useGameStore((state) => state.teams);
  const updateTeamSettings = useGameStore((state) => state.updateTeamSettings);

  const fromStore = (): Drafts =>
    Object.fromEntries(
      teams.map((t) => [t.id, { name: t.name, color: t.color }]),
    ) as Drafts;

  const [drafts, setDrafts] = useState<Drafts>(fromStore);
  const [saved, setSaved] = useState(false);

  // Đồng bộ khi dữ liệu đội thay đổi từ nơi khác (reload, reset)
  useEffect(() => {
    setDrafts(fromStore());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teams]);

  const dirty = teams.some(
    (t) => drafts[t.id]?.name !== t.name || drafts[t.id]?.color !== t.color,
  );
  const hasEmpty = teams.some((t) => !drafts[t.id]?.name.trim());

  const colors = teams.map((t) => drafts[t.id]?.color.toLowerCase());
  const isDuplicate = (id: TeamId) =>
    colors.filter((c) => c === drafts[id]?.color.toLowerCase()).length > 1;
  const hasDuplicate = teams.some((t) => isDuplicate(t.id));

  const patch = (id: TeamId, change: Partial<Draft>) => {
    setDrafts((current) => ({ ...current, [id]: { ...current[id], ...change } }));
    setSaved(false);
  };

  const save = () => {
    if (hasEmpty) {
      window.alert("Tên đội không được để trống.");
      return;
    }
    if (hasDuplicate) {
      window.alert("Hai đội đang trùng màu. Vui lòng chọn màu khác nhau.");
      return;
    }
    updateTeamSettings(drafts);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const restoreDefaults = () => {
    if (!window.confirm("Đưa tên và màu 4 đội về mặc định?")) return;
    updateTeamSettings(
      Object.fromEntries(
        teams.map((t) => [
          t.id,
          { name: DEFAULT_TEAM_NAMES[t.id], color: DEFAULT_TEAM_COLORS[t.id] },
        ]),
      ) as Record<TeamId, Draft>,
    );
  };

  return (
    <section className="admin-card">
      <div className="section-label">TÊN & MÀU CÁC ĐỘI CHƠI</div>

      <p className="admin-help">
        Đặt tên và chọn màu cho từng đội (gợi ý màu theo ngũ hành hoặc chọn màu
        tự do). Mỗi đội một màu riêng. Đổi tên/màu không làm mất điểm hay tiến
        trình đang chơi.
      </p>

      <div style={{ display: "grid", gap: 16, marginTop: 12 }}>
        {teams.map((team, index) => {
          const draft = drafts[team.id] ?? { name: team.name, color: team.color };
          return (
            <div key={team.id} style={{ display: "grid", gap: 8 }}>
              <strong>Đội {index + 1}</strong>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="color"
                  aria-label={`Màu đội ${index + 1}`}
                  value={draft.color}
                  onChange={(e) => patch(team.id, { color: e.target.value })}
                  style={{
                    width: 48,
                    height: 40,
                    padding: 2,
                    cursor: "pointer",
                    flex: "none",
                  }}
                />
                <input
                  style={{ flex: 1 }}
                  value={draft.name}
                  maxLength={MAX_LENGTH}
                  placeholder={DEFAULT_TEAM_NAMES[team.id]}
                  onChange={(e) => patch(team.id, { name: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {PRESETS.map((preset) => {
                  const active =
                    draft.color.toLowerCase() === preset.color.toLowerCase();
                  return (
                    <button
                      key={preset.color}
                      type="button"
                      title={`${preset.label} (${preset.color})`}
                      onClick={() => patch(team.id, { color: preset.color })}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "4px 10px",
                        borderRadius: 999,
                        border: active
                          ? `2px solid ${preset.color}`
                          : "1px solid rgba(148,163,184,.4)",
                        background: "transparent",
                        color: "inherit",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: preset.color,
                        }}
                      />
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {isDuplicate(team.id) && (
                <small style={{ color: "#dc2626", fontWeight: 700 }}>
                  ⚠ Màu này đang trùng với một đội khác.
                </small>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
        <button
          type="button"
          className="primary-button"
          disabled={!dirty || hasEmpty || hasDuplicate}
          onClick={save}
        >
          LƯU TÊN & MÀU
        </button>
        <button type="button" className="ghost-button" onClick={restoreDefaults}>
          Về mặc định
        </button>
        {saved && (
          <span style={{ alignSelf: "center", fontWeight: 700 }}>✓ Đã lưu</span>
        )}
      </div>
    </section>
  );
}
