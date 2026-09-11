export type ListingSort = "newest" | "priceAsc" | "priceDesc";

export interface ListingParams {
  categoryId?: number;
  sort?: ListingSort;
}

export interface ListingParameter {
  name: string;
  value: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Listing {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  categoryId: number;
  category: Category;
  createdAt: string;
  price: number;
  stock: number;
  images: string[];
  tags: string[];
  parameters: ListingParameter[];
  location?: {
    country?: string | null;
    region?: string | null;
    city?: string | null;
  };
  condition?: string;
  sellerRating?: number;
  sellerSales?: number;
}

export interface ListingView {
  id: string;
  title: string;
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

export function listingImageUrl(
  photoId: string,
  width: number,
  height: number,
) {
  return `https://images.unsplash.com/${photoId}?w=${width}&h=${height}&fit=crop&auto=format`;
}

export function listingSku(id: string | number) {
  return `MKT-${String(id).padStart(4, "0")}`;
}

export function sellerInitials(name: string) {
  return name
    .replaceAll(".", "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
