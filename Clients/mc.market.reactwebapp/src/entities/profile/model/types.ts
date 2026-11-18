export interface CurrentUserMetadata {
  id: string;
  displayName: string;
  pictureUrl: string | null;
  accountType: string;
}

export interface PublicProfile {
  id: string;
  displayName: string;
  bio: string | null;
  pictureUrl: string | null;
  isSeller: boolean;
}

export type AccountType = "Basic" | "Individual" | "Business";
