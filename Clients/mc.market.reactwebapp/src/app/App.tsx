import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { AuthProvider } from "./auth/AuthProvider";
import { router } from "./routing/router";
import { isNotFoundError } from "@/shared/api";

const MAX_QUERY_RETRIES = 3;

// A 404 won't change on retry; failing fast lets pages show "not found" immediately.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) =>
        !isNotFoundError(error) && failureCount < MAX_QUERY_RETRIES,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
