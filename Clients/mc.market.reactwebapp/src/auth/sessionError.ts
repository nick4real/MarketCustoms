import type { SessionErrorView } from "../models/session";

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

function visitorSafeAuth0Code(code: string): SessionErrorView {
  if (code === "missing_config") {
    return MISSING_CONFIG;
  }
  if (code === "access_denied" || code === "unauthorized") {
    return {
      code,
      message:
        "Sign-in was cancelled or denied. You can try again when you're ready.",
      canRetry: true,
    };
  }
  if (code === "callback_failed") {
    return CALLBACK_FAILED;
  }
  if (code === "profile_failed") {
    return PROFILE_FAILED;
  }
  return {
    code,
    message: GENERIC_RETRY.message,
    canRetry: true,
  };
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
  if (input.missingConfig) {
    return MISSING_CONFIG;
  }
  if (input.callbackFailed) {
    return CALLBACK_FAILED;
  }
  if (input.profileFailed) {
    return PROFILE_FAILED;
  }
  if (input.queryCode?.trim()) {
    return visitorSafeAuth0Code(input.queryCode.trim());
  }
  if (input.auth0Error) {
    return visitorSafeAuth0Code(auth0ErrorCode(input.auth0Error));
  }
  return null;
}
