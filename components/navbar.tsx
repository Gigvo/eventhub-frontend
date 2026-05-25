"use client";

import React, { useEffect, useState } from "react";
import { Bell, CircleUserRound, MessageSquare } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { apiCall } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";
interface UserData {
  id: string;
  name: string;
  role: string;
  eoProfile?: {
    organizationName: string;
  };
}

export default function Navbar() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only fetch user data when Firebase auth is ready and user is authenticated
    if (authLoading) return;

    const fetchUser = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await apiCall<{ data: UserData }>("/auth/me");
        setUser(data.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [authLoading, isAuthenticated]);

  return (
    <nav className="bg-[#F8F9FB] py-4.5 px-8 flex items-center justify-between sticky top-0 w-full border-b-1 border-[#E5E7EB] z-10 opacity-100">
      <div></div>
      <div className="flex flex-row items-center">
        <div className="flex items-center gap-4 pr-6 border-r-1 border-[#FFDBD2]">
          <Bell className="" />
          <MessageSquare className="" />
        </div>
        <div className="flex flex-row gap-3 items-center pl-6">
          <div>
            <p className="text-[14px] font-bold">
              {isLoading ? "Loading..." : user?.name || "User"}
            </p>
            <p className="text-[11px] text-[#6B7280]">
              {isLoading ? "-" : user?.role || "-"}
            </p>
          </div>
          <CircleUserRound className="w-8 h-8" />
        </div>
        {user?.role === "EO" && (
          <Link href="/buat-event" className="ml-6">
            <Button className="rounded-[4px] bg-[#003EC7] px-4 py-2">
              Buat Event Baru
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
