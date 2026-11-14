import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GamePhase, Team, TeamId } from "../types/game";

const phaseScores = (): Record<GamePhase, number> => ({
  warmup: 0,
  obstacle: 0,
  acceleration: 0,
  finish: 0,
});

export const DEFAULT_TEAM_NAMES: Record<TeamId, string> = {
  "team-1": "ĐỘI 1",
  "team-2": "ĐỘI 2",
  "team-3": "ĐỘI 3",
  "team-4": "ĐỘI 4",
};

export const DEFAULT_TEAM_COLORS: Record<TeamId, string> = {
  "team-1": "#22c55e",
  "team-2": "#ef4444",
  "team-3": "#eab308",
  "team-4": "#3b82f6",
};

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

const initialTeams: Team[] = [
  { id: "team-1", name: DEFAULT_TEAM_NAMES["team-1"], color: DEFAULT_TEAM_COLORS["team-1"], totalScore: 0, phaseScores: phaseScores() },
  { id: "team-2", name: DEFAULT_TEAM_NAMES["team-2"], color: DEFAULT_TEAM_COLORS["team-2"], totalScore: 0, phaseScores: phaseScores() },
  { id: "team-3", name: DEFAULT_TEAM_NAMES["team-3"], color: DEFAULT_TEAM_COLORS["team-3"], totalScore: 0, phaseScores: phaseScores() },
  { id: "team-4", name: DEFAULT_TEAM_NAMES["team-4"], color: DEFAULT_TEAM_COLORS["team-4"], totalScore: 0, phaseScores: phaseScores() },
];

type GameStore = {
  teams: Team[];
  addScore: (teamId: TeamId, points: number, phase: GamePhase) => void;
  resetScores: () => void;
  updateTeamSettings: (
    patch: Partial<Record<TeamId, { name?: string; color?: string }>>,
  ) => void;
  resetPhase: (phase: GamePhase) => void;
};

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      teams: initialTeams,
      addScore: (teamId, points, phase) =>
        set((state) => ({
          teams: state.teams.map((team) =>
            team.id !== teamId
              ? team
              : {
                  ...team,
                  totalScore: team.totalScore + points,
                  phaseScores: {
                    ...team.phaseScores,
                    [phase]: team.phaseScores[phase] + points,
                  },
                },
          ),
        })),
      // Reset điểm nhưng GIỮ tên/màu đội hiện tại
      resetScores: () =>
        set((state) => ({
          teams: state.teams.map((t) => ({
            ...t,
            totalScore: 0,
            phaseScores: phaseScores(),
          })),
        })),
      updateTeamSettings: (patch) =>
        set((state) => ({
          teams: state.teams.map((t) => {
            const p = patch[t.id];
            if (!p) return t;
            const name = p.name?.trim().slice(0, 60);
            const color = p.color && HEX_COLOR.test(p.color) ? p.color.toLowerCase() : undefined;
            return { ...t, name: name || t.name, color: color || t.color };
          }),
        })),
      resetPhase: (phase) =>
        set((state) => ({
          teams: state.teams.map((team) => ({
            ...team,
            totalScore: team.totalScore - team.phaseScores[phase],
            phaseScores: { ...team.phaseScores, [phase]: 0 },
          })),
        })),
    }),
    { name: "olympia-core-game" },
  ),
);
