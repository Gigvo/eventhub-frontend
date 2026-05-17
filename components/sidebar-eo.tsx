"use client";

import React from "react";
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
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";

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
    name: "Katalog Event",
    href: "/katalog-event-eo",
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

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const linkClass = (href: string) =>
    `flex items-center gap-2.5 w-full rounded-[6px] px-2 py-1.5 transition-colors ${
      isActive(href)
        ? "bg-[#EEF2FF] text-[#003EC7] font-semibold"
        : "text-[#6B7280] hover:bg-gray-200 hover:text-[#374151]"
    }`;

  const iconClass = (href: string) =>
    `w-5 ${isActive(href) ? "text-[#003EC7]" : "text-[#6B7280]"}`;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("firebaseToken");
      localStorage.removeItem("buatEventStep3Data");
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
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
        <ul className="flex flex-col items-start gap-1">
          {menuItems.map((item) => (
            <li key={item.name} className="w-full px-1 text-[14px]">
              <Link href={item.href} className={linkClass(item.href)}>
                <item.icon className={iconClass(item.href)} />
                {item.name}
              </Link>
            </li>
          ))}
          {/* <li className="w-full px-1 text-[14px]">
            <Link href="/token-billing" className={linkClass("/token-billing")}>
              <Image
                src={"/icons/money.svg"}
                width={20}
                height={20}
                alt="Token & Billing"
              />
              Token & Billing
            </Link>
          </li> */}
          <li className="w-full px-1 text-[14px]">
            <Link
              href="/token-management"
              className={linkClass("/token-management")}
            >
              <Image
                src={"/icons/token.svg"}
                width={20}
                height={20}
                alt="Token Management"
              />
              Token Management
            </Link>
          </li>
        </ul>
      </div>
      <div className="border-t-1 border-[#E5E7EB] pt-4">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 pb-2.5 text-[14px] ${
            isActive("/settings")
              ? "text-[#003EC7] font-semibold"
              : "text-[#6B7280] hover:text-[#374151]"
          } transition-colors`}
        >
          <Settings
            className={`w-6 h-6 ${isActive("/settings") ? "text-[#003EC7]" : ""}`}
          />
          <span>Pengaturan</span>
        </Link>

        <Link
          href="/help"
          className={`flex items-center gap-3 px-3 py-2.5 text-[14px] ${
            isActive("/help")
              ? "text-[#003EC7] font-semibold"
              : "text-[#6B7280] hover:text-[#374151]"
          } transition-colors`}
        >
          <HelpCircle
            className={`w-6 h-6 ${isActive("/help") ? "text-[#003EC7]" : ""}`}
          />
          <span>Bantuan</span>
        </Link>

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
