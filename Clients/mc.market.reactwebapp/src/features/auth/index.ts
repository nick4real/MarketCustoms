export { AccountGate } from "@/features/auth/components/AccountGate";
export { default as HeaderAccountControls } from "@/features/auth/components/HeaderAccountControls";
export {
  Auth0VisitorSessionProvider,
  ProvideVisitorSession,
  missingConfigSession,
  useVisitorSession,
} from "@/features/auth/lib/useVisitorSession";
export {
  getAuth0ProviderOptions,
  isAuth0Configured,
} from "@/features/auth/lib/auth0";
export { savePostSignInReturnTo } from "@/features/auth/lib/postSignInReturnTo";
export { destinationAfterSignIn } from "@/features/auth/lib/afterSignIn";
export { takePostSignInReturnTo } from "@/features/auth/lib/postSignInReturnTo";
export { mapSessionError } from "@/features/auth/lib/sessionError";
export {
  showAccountNav,
  showGuestAuthActions,
  showIdentityControl,
} from "@/features/auth/lib/chrome";
export { parseAuthPageMode } from "@/features/auth/lib/authPageMode";
export { startHostedLogin } from "@/features/auth/lib/hostedLogin";
export {
  emailVerificationPath,
  isPublicStorefrontPath,
  sanitizeReturnTo,
} from "@/features/auth/lib/returnTo";
export type { AuthPageMode } from "@/features/auth/lib/authPageMode";
export type {
  AccountView,
  VisitorSessionView,
  SessionErrorView,
} from "@/features/auth/types/session";
