import { type Category, getRootCategories } from "@/entities/category";
import { useEffect, useState } from "react";
import { Link } from "react-router";

export default function CategoriesTopicsStrip() {
  const [categoryStatus, setCategoryStatus] = useState<
    "loading" | "ready" | "empty" | "error"
  >("loading");
  const [roots, setRoots] = useState<Category[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    void getRootCategories(controller.signal)
      .then((categories) => {
        if (controller.signal.aborted) {
          return;
        }
        setRoots(categories);
        setCategoryStatus(categories.length === 0 ? "empty" : "ready");
      })
      .catch((error: unknown) => {
        if (
          controller.signal.aborted ||
          (error instanceof DOMException && error.name === "AbortError") ||
          (error instanceof Error && error.name === "AbortError")
        ) {
          return;
        }
        setRoots([]);
        setCategoryStatus("error");
      });

    return () => controller.abort();
  }, []);

  return (
    <>
      {categoryStatus !== "empty" && (
        <section className="px-6 py-14 md:px-12 lg:px-16 lg:py-20">
          <div className="mb-8 flex items-baseline justify-between lg:mb-10">
            <h2
              className="text-foreground text-[28px] font-bold sm:text-[34px] lg:text-[38px]"
              style={{ fontFamily: "Fraunces, Georgia, serif" }}
            >
              Browse by Category
            </h2>
            <Link
              to="/browse"
              className="text-muted-foreground hover:text-foreground ml-4 shrink-0 text-xs tracking-wide transition-colors"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              All →
            </Link>
          </div>

          {categoryStatus === "loading" ? (
            <p
              className="text-muted-foreground text-sm font-light"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Loading categories…
            </p>
          ) : categoryStatus === "error" ? (
            <p
              className="text-muted-foreground text-sm font-light"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Couldn&apos;t load categories
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {roots.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/browse?categoryId=${cat.id}`}
                  className="group border-border bg-card hover:border-primary/50 hover:bg-primary-subtle border p-4 transition-all duration-200"
                  style={{ borderRadius: "2px" }}
                >
                  <div className="text-foreground mb-1 text-sm font-medium">
                    {cat.name}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
