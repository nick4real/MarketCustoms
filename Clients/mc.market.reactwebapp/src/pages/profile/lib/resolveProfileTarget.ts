export function resolveProfileTarget(
  paramId: string | undefined,
  accountProfileId: string | null | undefined,
): { profileId: string | null; isOwn: boolean } {
  const profileId = paramId ?? accountProfileId ?? null;
  return {
    profileId,
    isOwn: profileId !== null && profileId === accountProfileId,
  };
}
