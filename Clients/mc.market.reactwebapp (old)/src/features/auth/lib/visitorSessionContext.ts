import { createContext } from "react";
import type { VisitorSessionView } from "@/features/auth/types/session";

export const VisitorSessionContext = createContext<VisitorSessionView | null>(
  null,
);
