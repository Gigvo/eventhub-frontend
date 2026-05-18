"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { apiCall } from "@/lib/api-client";
import SidebarEO from "@/components/sidebar-eo";
import SidebarCompany from "@/components/sidebar-company";

export default function SidebarSwitcher() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    apiCall<{ data: { role: string } }>("/auth/me")
      .then((res) => setRole(res.data.role))
      .catch(() => setRole(null));
  }, [authLoading, isAuthenticated]);

  if (role === "COMPANY") return <SidebarCompany />;
  if (role === "EO") return <SidebarEO />;
}
