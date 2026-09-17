import type { SessionErrorView } from "@/entities/session/model/types";

const MISSING_CONFIG: SessionErrorView = {
  code: "missing_config",
  message:
    "Sign-in isn't available right now. You can keep browsing and try again later.",
  canRetry: true,
};

const CALLBACK_FAILED: SessionErrorView = {
  code: "callback_failed",
  message: "We couldn't finish signing you in. You can try again.",
  canRetry: true,
};

const PROFILE_FAILED: SessionErrorView = {
  code: "profile_failed",
  message: "We couldn't load your account. You can try again.",
  canRetry: true,
};

const GENERIC_RETRY: SessionErrorView = {
  code: "callback_failed",
  message: "Sign-in didn't complete. You can try again from this page.",
  canRetry: true,
};

const ACCESS_DENIED: SessionErrorView = {
  code: "access_denied",
  message:
    "Sign-in was cancelled or denied. You can try again when you're ready.",
  canRetry: true,
};

const CANCELLED: SessionErrorView = {
  code: "cancelled",
  message:
    "Sign-in was cancelled or denied. You can try again when you're ready.",
  canRetry: true,
};

function visitorSafeAuth0Code(code: string): SessionErrorView {
  switch (code) {
    case "missing_config":
      return MISSING_CONFIG;
    case "access_denied":
      return ACCESS_DENIED;
    case "cancelled":
      return CANCELLED;
    case "callback_failed":
      return CALLBACK_FAILED;
    case "profile_failed":
      return PROFILE_FAILED;
    default:
      return GENERIC_RETRY;
  }
}

function auth0ErrorCode(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "error" in error &&
    typeof error.error === "string" &&
    error.error.trim()
  ) {
    return error.error.trim();
  }
  return "callback_failed";
}

export function mapSessionError(input: {
  missingConfig?: boolean;
  auth0Error?: unknown;
  callbackFailed?: boolean;
  profileFailed?: boolean;
  queryCode?: string | null;
}): SessionErrorView | null {
  switch (true) {
    case input.missingConfig:
      return MISSING_CONFIG;
    case input.callbackFailed:
      return CALLBACK_FAILED;
    case input.profileFailed:
      return PROFILE_FAILED;
    case input.queryCode !== null && input.queryCode !== undefined:
      return visitorSafeAuth0Code(input.queryCode.trim());
    case input.auth0Error:
      return visitorSafeAuth0Code(auth0ErrorCode(input.auth0Error));
    default:
      return GENERIC_RETRY;
  }
}
