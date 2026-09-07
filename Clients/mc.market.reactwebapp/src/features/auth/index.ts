export { AccountGate } from "@/features/auth/components/AccountGate";
export { default as HeaderAccountControls } from "@/features/auth/components/HeaderAccountControls";
export {
  Auth0VisitorSessionProvider,
  ProvideVisitorSession,
  missingConfigSession,
  useVisitorSession,
} from "@/features/auth/lib/session/useVisitorSession";
export {
  getAuth0ProviderOptions,
  isAuth0Configured,
} from "@/features/auth/lib/config/auth0";
export { savePostSignInReturnTo } from "@/features/auth/lib/navigation/postSignInReturnTo";
export { destinationAfterSignIn } from "@/features/auth/lib/navigation/afterSignIn";
export { takePostSignInReturnTo } from "@/features/auth/lib/navigation/postSignInReturnTo";
export { mapSessionError } from "@/features/auth/lib/session/sessionError";
export {
  showAccountNav,
  showGuestAuthActions,
  showIdentityControl,
} from "@/features/auth/lib/ui/chrome";
export { parseAuthPageMode } from "@/features/auth/lib/login/authPageMode";
export { startHostedLogin } from "@/features/auth/lib/login/hostedLogin";
export {
  emailVerificationPath,
  isPublicStorefrontPath,
  sanitizeReturnTo,
} from "@/features/auth/lib/navigation/returnTo";
export type { AuthPageMode } from "@/features/auth/lib/login/authPageMode";
export type {
  AccountView,
  VisitorSessionView,
  SessionErrorView,
} from "@/features/auth/types/session";
