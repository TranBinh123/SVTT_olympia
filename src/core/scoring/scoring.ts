import type { GamePhase, TeamId } from "../types/game";
import { useGameStore } from "../store/gameStore";

export function resetPhaseScores(phase: GamePhase) {
  useGameStore.getState().resetPhase(phase);
}

export function addScore(teamId: TeamId, points: number, phase: GamePhase) {
  useGameStore.getState().addScore(teamId, points, phase);
}