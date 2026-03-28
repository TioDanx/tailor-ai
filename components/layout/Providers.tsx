"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
import { AppLayout } from "./AppLayout";
import { AuthGate } from "./AuthGate";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <UserProfileProvider>
        <AuthGate>
          <AppLayout>{children}</AppLayout>
        </AuthGate>
      </UserProfileProvider>
    </AuthProvider>
  );
}
