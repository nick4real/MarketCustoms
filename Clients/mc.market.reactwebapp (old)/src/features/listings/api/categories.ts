import type {
  Category,
  CategoryNode,
  CreateCategoryPayload,
} from "@/features/listings/types/product";

const categoriesBaseUrl = "/api/categories";

function nonEmpty(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function readCategoryId(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return null;
  }
  return value;
}

export function mapCategoryNode(body: unknown): CategoryNode {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid category");
  }

  const row = body as Record<string, unknown>;
  const id = readCategoryId(row.id);
  const name = nonEmpty(row.name);
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

  return childCategories?.length
    ? { id, name, childCategories }
    : { id, name };
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

async function readJsonResponse(response: Response, action: string): Promise<unknown> {
  if (!response.ok) {
    throw new Error(`${action} failed (${response.status})`);
  }

  return response.json();
}

export async function getRootCategories(
  signal?: AbortSignal,
): Promise<Category[]> {
  const response = await fetch(categoriesBaseUrl, { signal });
  if (response.status === 404) {
    return [];
  }
  return mapRootCategories(await readJsonResponse(response, "Categories request"));
}

export async function getCategoryById(
  categoryId: number,
  signal?: AbortSignal,
): Promise<Category> {
  const response = await fetch(`${categoriesBaseUrl}/${categoryId}`, { signal });
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

  if (!response.ok) {
    throw new Error(`Create category request failed (${response.status})`);
  }
}
