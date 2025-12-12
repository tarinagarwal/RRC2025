import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { loggerLink, unstable_httpBatchStreamLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { useState } from "react";
import SuperJSON from "superjson";

import { type AppRouter } from "../../../server/src/api/root";
import { createQueryClient } from "./query-client";

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    return createQueryClient();
  }

  return (clientQueryClientSingleton ??= createQueryClient());
};

export const api = createTRPCReact<AppRouter>();

export type RouterInputs = inferRouterInputs<AppRouter>;

export type RouterOutputs = inferRouterOutputs<AppRouter>;

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            //@ts-ignore
            import.meta.env.DEV ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        unstable_httpBatchStreamLink({
          transformer: SuperJSON,
          url: getBaseUrl() + "/api/trpc",
          headers: () => {
            const headers = new Headers();
            headers.set("x-trpc-source", "react-client");
            return headers;
          },
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}

function getBaseUrl() {
  if (typeof window !== "undefined") {
    // Use the API URL from environment variable if available, otherwise use default
    let baseUrl = import.meta.env.VITE_API_URL || "https://voxboardhackathon.onrender.com";
    // Remove trailing slash if present to avoid double slashes when concatenating with "/api/trpc"
    return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }
  // Server-side / SSR
  let baseUrl = process.env.VITE_API_URL || "https://voxboardhackathon.onrender.com";
  // Remove trailing slash if present to avoid double slashes when concatenating with "/api/trpc"
  return baseUrl?.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}
