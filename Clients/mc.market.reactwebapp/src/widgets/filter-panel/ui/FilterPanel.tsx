import type { CategoryFilterRow } from "@/entities/category";
import {
  PriceFilter,
  CategoryFilter,
  ConditionFilter,
  SearchFilter,
} from "@/features/listing-filters";

export interface FilterPanelProps {
  categoryRows: CategoryFilterRow[];
  categoryStatus: "loading" | "ready" | "error";
  selectedCategoryId: number | null;
  setSelectedCategoryId: (id: number | null) => void;
  selectedCondition: string;
  setSelectedCondition: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
}

export default function FilterPanel({
  categoryRows,
  categoryStatus,
  selectedCategoryId,
  setSelectedCategoryId,
  selectedCondition,
  setSelectedCondition,
  search,
  setSearch,
}: FilterPanelProps) {
  return (
    <>
      <SearchFilter search={search} setSearch={setSearch} />
      <CategoryFilter
        categoryRows={categoryRows}
        categoryStatus={categoryStatus}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
      />
      <ConditionFilter
        selectedCondition={selectedCondition}
        setSelectedCondition={setSelectedCondition}
      />
      <PriceFilter />
    </>
  );
}
