export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  image: {
    id: number;
    url: string;
  };
}

export interface ProductPaginatedResponse {
  items: Product[];
  pageSize: number;
  pageIndex: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
