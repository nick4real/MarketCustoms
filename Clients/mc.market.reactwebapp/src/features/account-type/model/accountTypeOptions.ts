import type { AccountType } from "@/entities/profile";

export const accountTypeOptions: {
  value: AccountType;
  label: string;
  description: string;
}[] = [
  {
    value: "Basic",
    label: "Not selling yet",
    description: "Browse and buy. Choose a seller type to start listing.",
  },
  {
    value: "Individual",
    label: "Private seller",
    description: "You sell as a private person.",
  },
  {
    value: "Business",
    label: "Business seller",
    description: "You sell as a company.",
  },
];

export function isSellerAccountType(type: string | null): boolean {
  return type === "Individual" || type === "Business";
}
