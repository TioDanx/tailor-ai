import { ReactNode } from "react";
import { Providers } from "@/components/layout/Providers";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>;
}
