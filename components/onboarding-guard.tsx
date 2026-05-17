"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { apiCall } from "@/lib/api-client";

/**
 * Guards all (with-sidebar) pages.
 * If the user is authenticated but hasn't completed onboarding
 * (no eoProfile or companyProfile), redirect them to /onboarding.
 */
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
          // Authenticated but onboarding not completed — send them back
          router.replace("/onboarding");
        }
      } catch {
        // Can't reach backend or user not registered at all → onboarding
        router.replace("/onboarding");
      }
    };

    check();
  }, [authLoading, isAuthenticated, router]);

  // Renders nothing — pure side-effect component
  return null;
}
