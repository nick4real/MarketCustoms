export {
  Auth0VisitorSessionProvider,
  ProvideVisitorSession,
} from "@/features/visitor-session/lib/VisitorSessionProvider";
export { useVisitorSession } from "@/features/visitor-session/lib/useVisitorSession";
export {
  missingConfigSession,
  type ProfileLoadState,
} from "@/features/visitor-session/lib/visitorSessionView";
export {
  destinationAfterSignIn,
  emailVerificationPath,
  isPublicStorefrontPath,
  savePostSignInReturnTo,
  sanitizeReturnTo,
  takePostSignInReturnTo,
} from "@/features/visitor-session/lib/returnTo";
export {
  getAuth0ProviderOptions,
  logoutReturnTo,
  isAuth0Configured,
} from "@/features/visitor-session/lib/auth0";
export { parseAuthPageMode } from "@/features/visitor-session/lib/authPageMode";
export { startHostedLogin } from "@/features/visitor-session/lib/hostedLogin";
export type { AuthPageMode } from "@/features/visitor-session/lib/authPageMode";
export { default as HeaderAccountControls } from "@/features/visitor-session/ui/HeaderAccountControls";
