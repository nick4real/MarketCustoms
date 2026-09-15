export interface Category {
  id: number;
  name: string;
}

export interface CategoryNode {
  id: number;
  name: string;
  childCategories?: CategoryNode[];
}

export interface CreateCategoryPayload {
  name: string;
  parentId?: number | null;
}
