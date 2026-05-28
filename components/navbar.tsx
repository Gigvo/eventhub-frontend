"use client";

import React, { useEffect, useState } from "react";
import { Bell, CircleUserRound, MessageSquare, Menu } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { apiCall } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";
import { useSidebar } from "@/components/sidebar-provider";
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
  const { toggle } = useSidebar();

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
    <nav className="bg-[#F8F9FB] py-3.5 sm:py-4.5 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 w-full border-b border-[#E5E7EB] z-10 opacity-100">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      <div className="flex flex-row items-center gap-3 sm:gap-4">
        <div className="flex items-center pr-3 sm:pr-4 md:pr-6 border-r border-[#FFDBD2]">
          <Link href={"./pesan"}>
            <MessageSquare className="w-5 h-5 text-gray-700 hover:text-gray-900 transition-colors" />
          </Link>
        </div>
        <div className="flex flex-row gap-2.5 items-center pl-1 sm:pl-2">
          <div className="hidden sm:block text-right">
            <p className="text-[13px] sm:text-[14px] font-bold text-gray-900 leading-tight">
              {isLoading ? "Loading..." : user?.name || "User"}
            </p>
            <p className="text-[10px] sm:text-[11px] text-[#6B7280]">
              {isLoading ? "-" : user?.role || "-"}
            </p>
          </div>
          <CircleUserRound className="w-7 h-7 sm:w-8 h-8 text-gray-700" />
        </div>
        {user?.role === "EO" && (
          <Link href="/buat-event" className="hidden sm:block ml-2 sm:ml-4">
            <Button className="rounded-[4px] bg-[#003EC7] px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
              Buat Event Baru
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
