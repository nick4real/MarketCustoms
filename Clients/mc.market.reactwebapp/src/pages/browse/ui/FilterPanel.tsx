import {
  PriceFilter,
  CategoryFilter,
  ConditionFilter,
  SearchFilter,
  SearchButton,
} from "@/features/listing-search";

export function FilterPanel() {
  return (
    <>
      <SearchFilter />
      <SearchButton />
      <CategoryFilter />
      <ConditionFilter />
      <PriceFilter />
    </>
  );
}
