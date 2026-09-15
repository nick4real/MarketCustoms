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
