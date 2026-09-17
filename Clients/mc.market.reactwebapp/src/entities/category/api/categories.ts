import type {
  Category,
  CategoryNode,
  CreateCategoryPayload,
} from "@/entities/category/model/types";
import {
  readPositiveInt,
  readStringNonEmpty,
  readJsonResponse,
} from "@/shared";

/* Categories API */
const categoriesBaseUrl = "/api/categories";

/* Maps */
export function mapCategoryNode(body: unknown): CategoryNode {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid category");
  }

  const row = body as Record<string, unknown>;
  const id = readPositiveInt(row.id);
  const name = readStringNonEmpty(row.name);
  if (id === null || !name) {
    throw new Error("Invalid category");
  }

  const rawChildren = row.childCategories;
  const childCategories =
    rawChildren === null || rawChildren === undefined
      ? undefined
      : Array.isArray(rawChildren)
        ? rawChildren.map(mapCategoryNode)
        : (() => {
            throw new Error("Invalid category");
          })();

  return childCategories?.length ? { id, name, childCategories } : { id, name };
}

export function mapCategory(body: unknown): Category {
  const { id, name } = mapCategoryNode(body);
  return { id, name };
}

export function mapRootCategories(body: unknown): Category[] {
  if (!Array.isArray(body)) {
    throw new Error("Invalid categories response");
  }

  return body.map(mapCategory);
}

/* API */
export async function getRootCategories(
  signal?: AbortSignal,
): Promise<Category[]> {
  const response = await fetch(categoriesBaseUrl, { signal });
  if (response.status === 404) {
    return [];
  }
  return mapRootCategories(
    await readJsonResponse(response, "Categories request"),
  );
}

export async function getCategoryById(
  categoryId: number,
  signal?: AbortSignal,
): Promise<Category> {
  const response = await fetch(`${categoriesBaseUrl}/${categoryId}`, {
    signal,
  });
  return mapCategory(await readJsonResponse(response, "Category request"));
}

export async function getCategoryWithChildren(
  categoryId: number,
  signal?: AbortSignal,
): Promise<CategoryNode> {
  const response = await fetch(`${categoriesBaseUrl}/children/${categoryId}`, {
    signal,
  });
  return mapCategoryNode(
    await readJsonResponse(response, "Category children request"),
  );
}

export async function getCategoryFullTree(
  categoryId: number,
  signal?: AbortSignal,
): Promise<CategoryNode> {
  const response = await fetch(`${categoriesBaseUrl}/tree/${categoryId}`, {
    signal,
  });
  return mapCategoryNode(
    await readJsonResponse(response, "Category tree request"),
  );
}

export async function createCategory(
  accessToken: string,
  payload: CreateCategoryPayload,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(categoriesBaseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: payload.name,
      parentId: payload.parentId ?? null,
    }),
    signal,
  });

  await readJsonResponse(response, "Create category request");
}
