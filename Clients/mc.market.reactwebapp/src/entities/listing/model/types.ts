export type ListingSort = "newest" | "priceAsc" | "priceDesc";

export type ListingCondition =
  "any" | "new" | "used" | "refurbished" | "damaged";

export interface ListingQueryParams {
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
  condition?: ListingCondition;
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
