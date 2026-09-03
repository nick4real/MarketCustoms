export interface CurrentUserMetadata {
  id: string;
  displayName: string;
  pictureUrl: string | null;
  accountType: string;
}

export interface OwnerProfile {
  profileExists: boolean;
  isVerified: boolean;
  isSeller: boolean;
  displayName: string;
  email: string;
  phoneNumber: string;
  emailAttestedByIdentity: boolean;
  phoneAttestedByIdentity: boolean;
}

export interface PublicProfile {
  id: string;
  displayName: string;
  shopName?: string | null;
  bio?: string | null;
  isSeller?: boolean;
}

export interface CompleteClarificationPayload {
  displayName: string;
  email?: string | null;
  phoneNumber?: string | null;
}

export interface OwnerSellerStatus {
  isSeller: boolean;
  shopName?: string | null;
  bio?: string | null;
  application?: SellerApplicationSnapshot | null;
}

export interface SellerApplicationSnapshot {
  shopName: string;
  bio?: string | null;
  submittedAt: string;
  outcome: "Accepted" | "Rejected";
  rejectionReason?: string | null;
}

export interface SubmitSellerApplicationPayload {
  shopName: string;
  bio?: string | null;
}
