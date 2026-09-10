import { useContext } from "react";
import type { VisitorSessionView } from "@/features/auth/types/session";
import { VisitorSessionContext } from "./visitorSessionContext";

export function useVisitorSession(): VisitorSessionView {
  const session = useContext(VisitorSessionContext);
  if (!session) {
    throw new Error("useVisitorSession must be used within a session provider");
  }
  return session;
}
