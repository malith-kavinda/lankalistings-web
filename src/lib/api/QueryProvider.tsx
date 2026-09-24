"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ApiError } from "./client";

/**
 * Query configuration for the whole app.
 *
 * <p>The retry rule is the part worth reading. Retrying a 422 or a 409 cannot succeed — the server
 * has already decided — and retrying a 401 just delays sending the seller to sign in. Only
 * genuinely transient failures are worth a second attempt, and treating everything as retryable
 * turns one rejected answer into four identical rejected answers.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  // Created in state, not at module scope: a module-level client is shared between requests on the
  // server and would leak one user's cached drafts into another's render.
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) =>
              error instanceof ApiError && error.isTransient && failureCount < 2,
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
          mutations: {
            // Never automatically: a repeated write is a repeated side effect, and only creation
            // carries an idempotency key to make that safe.
            retry: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
