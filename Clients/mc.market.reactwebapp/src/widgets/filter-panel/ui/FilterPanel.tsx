import {
  PriceFilter,
  CategoryFilter,
  ConditionFilter,
  SearchFilter,
} from "@/features/listing-filters";

export interface FilterPanelProps {
  selectedCategoryId: number | null;
  setSelectedCategoryId: (id: number | null) => void;
  selectedCondition: string;
  setSelectedCondition: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
}

export default function FilterPanel({
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
