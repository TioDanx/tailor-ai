"use client";

import { useUserProfile } from "@/contexts/UserProfileContext";
import { Plan } from "@/types";

export function useUserQuota() {
  const { profile } = useUserProfile();

  const credits  = profile?.cvCredits  ?? 0;
  const plan     = (profile?.plan ?? "free") as Plan;
  const unlimited = profile?.unlimited ?? false;

  const maxCredits: Record<Plan, number> = {
    free:    5,
    starter: 50,
    pro:     100,
  };

  const max       = maxCredits[plan];
  const hasQuota  = unlimited || credits > 0;
  const pctUsed   = Math.min((credits / max) * 100, 100);

  return { credits, plan, max, hasQuota, pctUsed, unlimited };
}
