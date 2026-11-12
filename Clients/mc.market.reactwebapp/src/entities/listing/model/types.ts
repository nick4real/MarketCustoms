import { LISTING_CONDITIONS, LISTING_SORTS } from "./constants";

export type ListingCondition = (typeof LISTING_CONDITIONS)[number];
export type ListingSort = (typeof LISTING_SORTS)[number];

export interface ListingQueryParams {
  categoryId?: number;
  condition?: ListingCondition;
  sort?: ListingSort;
  title?: string;
}

export interface ListingParameter {
  name: string;
  value: string;
}

export interface ListingCategory {
  id: number;
  name: string;
}

export interface ListingLocation {
  country: string | null;
  region: string | null;
  city: string | null;
}

export interface Listing {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  categoryId: number;
  category: ListingCategory;
  createdAt: string;
  price: number;
  stock: number;
  images: string[];
  tags: string[];
  parameters: ListingParameter[];
  location: ListingLocation | null;
  condition: ListingCondition | null;
  sellerRating: number | null;
  sellerSales: number | null;
}

export interface ListingView {
  id: string;
  title: string;
  condition: ListingCondition;
  description: string;
  price: number;
  imageId: string;
}

export interface ListingPaginatedResponse {
  items: ListingView[];
  pageSize: number;
  pageIndex: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
