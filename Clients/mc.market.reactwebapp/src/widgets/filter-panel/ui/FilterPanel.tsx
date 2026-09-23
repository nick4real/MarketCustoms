import {
  PriceFilter,
  CategoryFilter,
  ConditionFilter,
  SearchFilter,
} from "@/features/listing-filters";
import SearchButton from "./SearchButton";

export default function FilterPanel() {
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
