import { useRootCategoriesQuery } from "@/entities/category";
import { SectionHeader, StatusMessage } from "@/shared";
import { Link } from "react-router";

export default function CategoriesTopicsStrip() {
  const { data, isPending, isError } = useRootCategoriesQuery();

  if (data?.length === 0) {
    return null;
  }

  return (
    <section className="px-6 py-14 md:px-12 lg:px-16 lg:py-20">
      <SectionHeader
        title="Browse by Category"
        action={{ to: "/browse", label: "All →" }}
      />

      {isPending ? (
        <StatusMessage size="inline" message="Loading categories…" />
      ) : isError ? (
        <StatusMessage size="inline" message="Couldn't load categories" />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {data.map((cat) => (
            <Link
              key={cat.id}
              to={`/browse?categoryId=${cat.id}`}
              className="group border-border bg-card hover:border-primary/50 hover:bg-primary-subtle rounded-xs border p-4 transition-all duration-200"
            >
              <div className="text-foreground mb-1 text-sm font-medium">
                {cat.name}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
