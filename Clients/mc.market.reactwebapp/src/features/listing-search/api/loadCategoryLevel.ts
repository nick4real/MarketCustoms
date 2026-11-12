import {
  type Category,
  getCategoryById,
  getCategoryWithChildren,
} from "@/entities/category";
import { isNotFoundError } from "@/shared/api";

export type CategoryLevel = {
  category: Category;
  children: Category[];
};

export async function loadCategoryLevel(
  categoryId: number,
  signal: AbortSignal,
): Promise<CategoryLevel> {
  try {
    const node = await getCategoryWithChildren(categoryId, signal);
    return {
      category: { id: node.id, name: node.name },
      children: (node.childCategories ?? []).map(({ id, name }) => ({
        id,
        name,
      })),
    };
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error;
    }
    const category = await getCategoryById(categoryId, signal);
    return { category, children: [] };
  }
}
