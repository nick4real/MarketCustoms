import type {
  CompleteClarificationPayload,
  OwnerProfile,
  OwnerSellerStatus,
  SubmitSellerApplicationPayload,
} from "../models/profile";

export class ProfilesUnavailableError extends Error {
  override name = "ProfilesUnavailableError";

  constructor(message = "Profiles service is unavailable") {
    super(message);
  }
}

interface ApiOwnerProfile {
  profileExists: boolean;
  isVerified: boolean;
  isSeller: boolean;
  displayName: string;
  email: string;
  phoneNumber: string;
  emailAttestedByIdentity: boolean;
  phoneAttestedByIdentity: boolean;
}

interface ApiErrorBody {
  message?: string;
  title?: string;
  errors?: Record<string, string[]>;
}

function mapOwnerProfile(api: ApiOwnerProfile): OwnerProfile {
  return {
    profileExists: api.profileExists,
    isVerified: api.isVerified,
    isSeller: api.isSeller,
    displayName: api.displayName,
    email: api.email,
    phoneNumber: api.phoneNumber,
    emailAttestedByIdentity: api.emailAttestedByIdentity,
    phoneAttestedByIdentity: api.phoneAttestedByIdentity,
  };
}

async function readErrorMessage(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
  if (body?.message) {
    return body.message;
  }

  if (body?.errors) {
    const first = Object.values(body.errors).flat()[0];
    if (first) {
      return first;
    }
  }

  if (body?.title) {
    return body.title;
  }

  return `HTTP ${response.status}`;
}

async function authorizedJson<T>(
  path: string,
  accessToken: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch {
    throw new ProfilesUnavailableError();
  }

  if (response.status >= 500) {
    throw new ProfilesUnavailableError();
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as T;
}

export async function getMyProfile(accessToken: string): Promise<OwnerProfile> {
  const api = await authorizedJson<ApiOwnerProfile>("/api/profiles/me", accessToken);
  return mapOwnerProfile(api);
}

export async function completeClarification(
  payload: CompleteClarificationPayload,
  accessToken: string,
): Promise<OwnerProfile> {
  const api = await authorizedJson<ApiOwnerProfile>("/api/profiles/me", accessToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      displayName: payload.displayName,
      email: payload.email ?? null,
      phoneNumber: payload.phoneNumber ?? null,
    }),
  });
  return mapOwnerProfile(api);
}

export async function getMySellerStatus(accessToken: string): Promise<OwnerSellerStatus> {
  return authorizedJson<OwnerSellerStatus>("/api/profiles/me/seller", accessToken);
}

export async function submitSellerApplication(
  payload: SubmitSellerApplicationPayload,
  accessToken: string,
): Promise<OwnerSellerStatus> {
  return authorizedJson<OwnerSellerStatus>("/api/profiles/me/seller-applications", accessToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      shopName: payload.shopName,
      bio: payload.bio ?? null,
    }),
  });
}
