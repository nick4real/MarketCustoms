export type VisitorStatus = "guest" | "authenticating" | "signed-in";

export interface AccountView {
  subject: string;
  displayName: string | null;
  email: string | null;
  photoUrl: string | null;
  emailVerified: boolean;
  isFullyUsable: boolean;
}

export interface SessionErrorView {
  code: string;
  message: string;
  canRetry: boolean;
}

export interface VisitorSessionView {
  status: VisitorStatus;
  account: AccountView | null;
  error: SessionErrorView | null;
}
