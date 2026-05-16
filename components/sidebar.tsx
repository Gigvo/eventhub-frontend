"use client";

import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CirclePlus,
  BriefcaseBusiness,
  ClipboardCheck,
  MessageSquare,
  Handshake,
  Settings,
  HelpCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";
import { apiCall } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Buat Event",
    href: "/buat-event",
    icon: CirclePlus,
    requiredRole: "EO",
  },
  {
    name: "Katalog Perusahaan",
    href: "/katalog-perusahaan",
    icon: BriefcaseBusiness,
  },
  {
    name: "Proposal Smart Review",
    href: "/proposal-smart-review",
    icon: ClipboardCheck,
  },
  {
    name: "Cari Sponsor",
    href: "/cari-sponsor",
    icon: Handshake,
  },
  {
    name: "Pesan",
    href: "/pesan",
    icon: MessageSquare,
  },
];

interface UserData {
  id: string;
  name: string;
  role: string;
}

export default function Sidebar() {
  const router = useRouter();

  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);

      // Clear any stored tokens
      localStorage.removeItem("firebaseToken");
      localStorage.removeItem("buatEventStep3Data");

      // Redirect to home
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.requiredRole) {
      return user?.role === item.requiredRole;
    }
    return true;
  });
  return (
    <aside className="bg-[#F3F4F6] flex flex-col justify-between px-4 h-screen w-64 py-4 border-r-1 border-[#E5E7EB] fixed">
      <div>
        <div className="flex flex-row items-center gap-3 mx-4 pb-6">
          <div className="w-8 h-8  rounded-[4px] flex items-center justify-center bg-[#003EC7]">
            <Image
              src={"/icons/eventhub-logo.svg"}
              alt="Event Curator"
              width={20}
              height={24}
            />
          </div>

          <div>
            <p className="text-[18px] font-bold">EventHub</p>
            <p className="text-[10px] text-[#6B7280] font-bold">
              Sponsorship Platform
            </p>
          </div>
        </div>
        <ul className="flex flex-col items-start text-[#6B7280]">
          {filteredMenuItems.map((item) => (
            <li key={item.name} className="px-3 py-2.5 text-[14px]">
              <a href={item.href} className="flex items-center gap-2.5">
                <item.icon className="w-6 text-[#6B7280]" />
                {item.name}
              </a>
            </li>
          ))}
          <li className="text-[14px] px-3 py-2.5">
            <a href="/token-billing" className="flex items-center gap-2.5">
              <Image
                src={"/icons/money.svg"}
                width={25}
                height={28}
                alt="Token & Billing"
              />
              Token & Billing
            </a>
          </li>
          <li className="text-[14px] px-3 py-2.5">
            <a href="/token-management" className="flex items-center gap-2.5">
              <Image
                src={"/icons/token.svg"}
                width={25}
                height={28}
                alt="Token Management"
              />
              Token Management
            </a>
          </li>
        </ul>
      </div>
      <div className="border-t-1 border-[#E5E7EB] pt-4">
        <a
          href="/settings"
          className="flex items-center gap-3 px-3 pb-2.5 text-[14px] text-[#6B7280] hover:text-[#374151] transition-colors"
        >
          <Settings className="w-6 h-6" />
          <span>Pengaturan</span>
        </a>

        <a
          href="/help"
          className="flex items-center gap-3 px-3 py-2.5 text-[14px] text-[#6B7280] hover:text-[#374151] transition-colors"
        >
          <HelpCircle className="w-6 h-6" />
          <span>Bantuan</span>
        </a>

        <div className="px-4 py-4 bg-[#EEF2FF] border border-[#E0E7FF] rounded-lg">
          <h3 className="text-[14px] font-semibold text-[#1E40AF] mb-1">
            Upgrade to Pro
          </h3>
          <p className="text-[12px] text-[#475569] mb-3">
            Dapatkan akses ke analytics premium dan sponsorship tools eksklusif.
          </p>
          <Button className="w-full bg-[#003EC7] hover:bg-[#002BA8] text-white text-[14px] py-1.5">
            Upgrade Now
          </Button>
        </div>
        <Button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-[8px] w-full mt-2"
        >
          Logout
        </Button>
      </div>
    </aside>
  );
}
