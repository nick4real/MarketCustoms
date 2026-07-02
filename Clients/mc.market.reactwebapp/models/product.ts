export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageLink: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface ProductDetail {
  id: string;
  title: string;
  description: string;
  categoryId: number;
  category: Category;
  createdAt: string;
  price: number;
  stockQuantity: number;
  imageLinks: string[];
}

export interface ProductPaginatedResponse {
  items: Product[];
  pageSize: number;
  pageIndex: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CreateProductPayload {
  ownerId: string;
  title: string;
  description: string;
  categoryId: number;
  price: number;
  stockQuantity: number;
  imageLinks: string[];
  tags: string[];
  parameters: [string, string][];
}
