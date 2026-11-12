import { type Category, useRootCategoriesQuery } from "@/entities/category";
import { Eyebrow, StatusMessage } from "@/shared/ui";
import { loadCategoryLevel } from "../api/loadCategoryLevel";
import { useListingSearchState } from "../model/listingSearchStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export function CategoryFilter() {
  const visited = useRef(
    new Map<number, { name: string; parentId: number | null }>(),
  );

  const {
    applied,
    selectedCategoryId,
    selectedCategoryName,
    actions: {
      setSelectedCategoryId,
      setSelectedCategoryName,
      setAppliedCategoryName,
    },
  } = useListingSearchState();

  const rootsQuery = useRootCategoriesQuery();

  const levelQuery = useQuery({
    queryKey: ["categories", "children", selectedCategoryId],
    queryFn: ({ signal }) => loadCategoryLevel(selectedCategoryId!, signal),
    enabled: selectedCategoryId !== null,
  });

  useEffect(() => {
    for (const category of rootsQuery.data ?? []) {
      visited.current.set(category.id, { name: category.name, parentId: null });
    }
  }, [rootsQuery.data]);

  useEffect(() => {
    if (selectedCategoryId === null || !levelQuery.data) {
      return;
    }

    const { category, children } = levelQuery.data;
    const known = visited.current.get(category.id);
    visited.current.set(category.id, {
      name: category.name,
      parentId: known?.parentId ?? null,
    });
    for (const child of children) {
      const knownChild = visited.current.get(child.id);
      visited.current.set(child.id, {
        name: child.name,
        parentId: knownChild?.parentId ?? selectedCategoryId,
      });
    }
    setSelectedCategoryName(category.name);
    if (applied.categoryId === category.id) {
      setAppliedCategoryName(category.id, category.name);
    }
  }, [
    applied.categoryId,
    levelQuery.data,
    selectedCategoryId,
    setAppliedCategoryName,
    setSelectedCategoryName,
  ]);

  const selectCategory = (categoryId: number | null, name: string | null) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategoryName(name);
  };

  const handleCategoryClick = (categoryId: number | null, name: string) => {
    if (categoryId === null) {
      selectCategory(null, null);
      return;
    }

    if (categoryId === selectedCategoryId) {
      const parentId = visited.current.get(categoryId)?.parentId ?? null;
      const parent = parentId === null ? null : visited.current.get(parentId);
      selectCategory(parentId, parent?.name ?? null);
      return;
    }

    visited.current.set(categoryId, {
      name,
      parentId: selectedCategoryId,
    });
    selectCategory(categoryId, name);
  };

  const isPending =
    selectedCategoryId === null ? rootsQuery.isPending : levelQuery.isPending;
  const isError =
    selectedCategoryId === null ? rootsQuery.isError : levelQuery.isError;

  const rows: Category[] =
    selectedCategoryId === null
      ? (rootsQuery.data ?? [])
      : (levelQuery.data?.children ?? []);

  const selectedLabel =
    selectedCategoryId === null
      ? "All listings"
      : (levelQuery.data?.category.name ?? selectedCategoryName ?? "Category");

  return (
    <div className="mb-7">
      <Eyebrow as="h3" className="mb-3">
        Category
      </Eyebrow>
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={() =>
            handleCategoryClick(
              selectedCategoryId,
              selectedCategoryId === null ? "All listings" : selectedLabel,
            )
          }
          aria-label={
            selectedCategoryId === null
              ? "All listings"
              : `Back from ${selectedLabel}`
          }
          className="text-primary flex items-center gap-1.5 rounded-xs px-2 py-1.5 text-left text-sm transition-colors"
        >
          {selectedCategoryId !== null && (
            <svg
              aria-hidden="true"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              className="shrink-0"
            >
              <path d="M15 18 9 12l6-6" />
            </svg>
          )}
          {selectedLabel}
        </button>
        {isPending ? (
          <StatusMessage
            size="inline"
            message="Loading categories…"
            className="px-2 py-1.5"
          />
        ) : isError ? (
          <StatusMessage
            size="inline"
            message="Couldn't load categories"
            className="px-2 py-1.5"
          />
        ) : (
          rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => handleCategoryClick(row.id, row.name)}
              className="text-muted-foreground hover:text-foreground-muted rounded-xs px-2 py-1.5 text-left text-sm transition-colors"
            >
              {row.name}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
