"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { apiCall } from "@/lib/api-client";

export default function OnboardingGuard() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    const check = async () => {
      try {
        const data = await apiCall<{
          data: {
            role: string | null;
            eoProfile?: { id: string } | null;
            companyProfile?: { id: string } | null;
          };
        }>("/auth/me");

        const hasProfile =
          !!data?.data?.eoProfile?.id || !!data?.data?.companyProfile?.id;

        if (!hasProfile) {
          router.replace("/onboarding");
        }
      } catch {}
    };

    check();
  }, [authLoading, isAuthenticated, router]);

  return null;
}
