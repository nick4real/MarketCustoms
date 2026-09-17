import type { ListingQueryParams } from "../model/types";

export function listingSearchBody(
  input?: ListingQueryParams,
): ListingQueryParams | undefined {
  const body: ListingQueryParams = {};
  if (
    input?.categoryId !== undefined &&
    Number.isInteger(input.categoryId) &&
    input.categoryId > 0
  ) {
    body.categoryId = input.categoryId;
  }
  if (input?.sort) {
    body.sort = input.sort;
  }

  return body.categoryId !== undefined || body.sort !== undefined
    ? body
    : undefined;
}
