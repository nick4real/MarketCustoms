import { createContext, useContext } from "react";

export const PROFILE_ID_CLAIM = "https://marketcustoms/profile_id";

export interface SessionActions {
  getAccessToken(): Promise<string>;
  reloadSession(): void;
}

export const SessionActionsContext = createContext<SessionActions | null>(null);

export function useSessionActions(): SessionActions {
  const actions = useContext(SessionActionsContext);
  if (!actions) {
    throw new Error("useSessionActions must be used within a session provider");
  }
  return actions;
}
