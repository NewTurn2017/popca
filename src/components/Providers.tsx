"use client";

import { ConvexProvider } from "convex/react";
import { useEffect, useState, type ReactNode } from "react";
import { getConvexClient } from "@/lib/convexClient";

export function Providers({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ReturnType<typeof getConvexClient>>(null);

  useEffect(() => {
    setClient(getConvexClient());
  }, []);

  if (!client) return <>{children}</>;
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
