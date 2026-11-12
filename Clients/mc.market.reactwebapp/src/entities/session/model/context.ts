import { createContext } from "react";
import type { VisitorSessionView } from "./types";

export const VisitorSessionContext = createContext<VisitorSessionView | null>(
  null,
);
