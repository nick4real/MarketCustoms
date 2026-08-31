export type AuthPageMode = "sign-in" | "sign-up";

export function parseAuthPageMode(
  value: string | null | undefined,
): AuthPageMode {
  return value === "sign-up" ? "sign-up" : "sign-in";
}
