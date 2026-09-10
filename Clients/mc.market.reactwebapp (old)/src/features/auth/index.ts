export { AccountGate } from "@/features/auth/components/AccountGate";
export { default as HeaderAccountControls } from "@/features/auth/components/HeaderAccountControls";
export {
  Auth0VisitorSessionProvider,
  ProvideVisitorSession,
} from "@/features/auth/lib/VisitorSessionProvider";
export { useVisitorSession } from "@/features/auth/lib/useVisitorSession";
export { missingConfigSession } from "@/features/auth/lib/visitorSessionView";
export {
  getAuth0ProviderOptions,
  isAuth0Configured,
} from "@/features/auth/lib/auth0";
export {
  destinationAfterSignIn,
  emailVerificationPath,
  isPublicStorefrontPath,
  savePostSignInReturnTo,
  sanitizeReturnTo,
  takePostSignInReturnTo,
} from "@/features/auth/lib/returnTo";
export { mapSessionError } from "@/features/auth/lib/sessionError";
export {
  showAccountNav,
  showGuestAuthActions,
  showIdentityControl,
} from "@/features/auth/lib/sessionChrome";
export { parseAuthPageMode } from "@/features/auth/lib/authPageMode";
export { startHostedLogin } from "@/features/auth/lib/hostedLogin";
export type { AuthPageMode } from "@/features/auth/lib/authPageMode";
export type {
  AccountView,
  VisitorSessionView,
  SessionErrorView,
} from "@/features/auth/types/session";
