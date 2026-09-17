import type { CategoryNode } from "@/entities/category/model/types";

export interface CategoryFilterRow {
  id: number;
  name: string;
  depth: number;
}

export function flattenCategoryForest(
  nodes: CategoryNode[],
  depth = 0,
): CategoryFilterRow[] {
  const rows: CategoryFilterRow[] = [];
  for (const node of nodes) {
    rows.push({ id: node.id, name: node.name, depth });
    if (node.childCategories?.length) {
      rows.push(...flattenCategoryForest(node.childCategories, depth + 1));
    }
  }
  return rows;
}
