import { useContext } from "react";
import { VisitorSessionContext } from "./context";
import type { VisitorSessionView } from "./types";

export function useVisitorSession(): VisitorSessionView {
  const session = useContext(VisitorSessionContext);
  if (!session) {
    throw new Error("useVisitorSession must be used within a session provider");
  }
  return session;
}
