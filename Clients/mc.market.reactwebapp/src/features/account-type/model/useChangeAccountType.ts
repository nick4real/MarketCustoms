import { useMutation } from "@tanstack/react-query";
import { clarifyAccountType, type AccountType } from "@/entities/profile";
import { useSessionActions } from "@/entities/session";

export function useChangeAccountType() {
  const { getAccessToken } = useSessionActions();

  return useMutation({
    mutationFn: async (accountType: AccountType) =>
      clarifyAccountType(await getAccessToken(), accountType),
  });
}
