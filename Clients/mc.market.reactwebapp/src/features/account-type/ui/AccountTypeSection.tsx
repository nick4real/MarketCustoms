import { useState } from "react";
import type { AccountType } from "@/entities/profile";
import { useSessionActions, useVisitorSession } from "@/entities/session";
import { Button } from "@/shared/ui";
import {
  accountTypeOptions,
  canSaveAccountType,
  isSellerAccountType,
} from "../model/accountTypeOptions";
import { useChangeAccountType } from "../model/useChangeAccountType";

export function AccountTypeSection() {
  const { account } = useVisitorSession();
  const { reloadSession } = useSessionActions();
  const mutation = useChangeAccountType();
  const accountType = account?.accountType ?? null;
  const current: AccountType = isSellerAccountType(accountType)
    ? accountType
    : "Basic";
  // The selection is kept after saving so the radio does not flick back while the session reloads.
  const [selected, setSelected] = useState<AccountType | null>(null);
  const value = selected ?? current;
  const canSave = canSaveAccountType(value, current);

  function save() {
    mutation.mutate(value, { onSuccess: () => reloadSession() });
  }

  return (
    <section className="border-border mb-8 border-b pb-8">
      <h4 className="text-foreground mb-4 text-sm font-medium">
        Seller account
      </h4>
      <div role="radiogroup" aria-label="Seller account" className="space-y-2">
        {accountTypeOptions.map((option) => (
          <label
            key={option.value}
            className="border-border bg-card flex cursor-pointer items-start gap-3 rounded-xs border p-4"
          >
            <input
              type="radio"
              name="account-type"
              value={option.value}
              checked={value === option.value}
              onChange={() => setSelected(option.value)}
              className="mt-1"
            />
            <span>
              <span className="text-foreground block text-sm font-medium">
                {option.label}
              </span>
              <span className="text-muted-foreground mt-0.5 block font-mono text-xs">
                {option.description}
              </span>
            </span>
          </label>
        ))}
      </div>
      {mutation.isError && (
        <p role="alert" className="text-destructive mt-3 text-sm">
          Could not update your account type. Try again.
        </p>
      )}
      <Button
        variant="primary"
        className="mt-4 w-full sm:w-auto"
        disabled={!canSave || mutation.isPending}
        onClick={save}
      >
        Save
      </Button>
    </section>
  );
}
