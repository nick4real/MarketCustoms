import { createContext } from "react";
import type { VisitorSessionView } from "@/entities/session";

export const VisitorSessionContext = createContext<VisitorSessionView | null>(
  null,
);
