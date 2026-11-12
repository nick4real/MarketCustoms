import type { ReactNode } from "react";
import { VisitorSessionContext } from "./context";
import type { VisitorSessionView } from "./types";

export function SessionContextProvider({
  session,
  children,
}: {
  session: VisitorSessionView;
  children: ReactNode;
}) {
  return (
    <VisitorSessionContext.Provider value={session}>
      {children}
    </VisitorSessionContext.Provider>
  );
}
