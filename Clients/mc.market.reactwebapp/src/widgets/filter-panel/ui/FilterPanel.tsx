import {
  PriceFilter,
  CategoryFilter,
  ConditionFilter,
  SearchFilter,
} from "@/features/listing-filters";

export default function FilterPanel() {
  return (
    <>
      <SearchFilter />
      <CategoryFilter />
      <ConditionFilter />
      <PriceFilter />
    </>
  );
}
