"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { apiCall } from "@/lib/api-client";
import DashboardEO from "@/components/dashboard/dashboard-eo";
import DashboardCompany from "@/components/dashboard/dashboard-company";

function EODashboard() {
  return <DashboardEO />;
}

function CompanyDashboard() {
  return <DashboardCompany />;
}

// ─── Main Page — Role Switcher ────────────────────────────────────────────────

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    apiCall<{ data: { role: string } }>("/auth/me")
      .then((res) => setRole(res.data.role))
      .catch(() => setRole(null))
      .finally(() => setRoleLoading(false));
  }, [authLoading, isAuthenticated]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (role === "COMPANY") return <CompanyDashboard />;
  return <EODashboard />;
}
