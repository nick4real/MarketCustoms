export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageLink: string;
}

export interface ProductPaginatedResponse {
  items: Product[];
  pageSize: number;
  pageIndex: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
