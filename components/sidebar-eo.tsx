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
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { useSidebar } from "@/components/sidebar-provider";

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
    name: "Event Kamu",
    href: "/katalog-event-eo",
    icon: BriefcaseBusiness,
  },
  {
    name: "Proposal",
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
  const { isOpen, isCollapsed, close, toggleCollapse } = useSidebar();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const linkClass = (href: string) =>
    `flex items-center rounded-[6px] py-1.5 transition-colors ${
      isCollapsed
        ? "justify-center px-0 w-12 h-10 mx-auto"
        : "gap-2.5 px-2 w-full"
    } ${
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
    <aside
      className={`bg-[#F3F4F6] flex flex-col justify-between px-4 h-screen py-4 border-r border-[#E5E7EB] fixed top-0 bottom-0 left-0 z-40 transition-all duration-300 ease-in-out md:translate-x-0 ${
        isCollapsed ? "w-20" : "w-64"
      } ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Collapse Toggle Button (Desktop only) */}
      <button
        onClick={toggleCollapse}
        className="hidden md:flex absolute -right-3 top-20 bg-white border border-gray-200 rounded-full w-6 h-6 items-center justify-center shadow-md hover:bg-gray-50 text-gray-500 hover:text-gray-700 z-50 transition-transform duration-300"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      <div className="flex flex-col min-h-0 flex-1">
        <div className="flex flex-row items-center justify-between mx-4 pb-6 flex-shrink-0">
          <Link href={"/"}>
            <div className="flex flex-row items-center gap-3">
              <div className="w-8 h-8 rounded-[4px] flex items-center justify-center bg-[#003EC7] flex-shrink-0">
                <Image
                  src={"/icons/eventhub-logo.svg"}
                  alt="Event Curator"
                  width={20}
                  height={24}
                />
              </div>

              {!isCollapsed && (
                <div>
                  <p className="text-[18px] font-bold">EventHub</p>
                  <p className="text-[10px] text-[#6B7280] font-bold">
                    Sponsorship Platform
                  </p>
                </div>
              )}
            </div>
          </Link>

          {!isCollapsed && (
            <button
              onClick={close}
              className="md:hidden p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar min-h-0 py-1">
          <ul className="flex flex-col items-start gap-1">
            {menuItems.map((item) => (
              <li key={item.name} className="w-full px-1 text-[14px]">
                <Link
                  href={item.href}
                  className={linkClass(item.href)}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className={iconClass(item.href)} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
            <li className="w-full px-1 text-[14px]">
              <Link
                href="/token-management"
                className={linkClass("/token-management")}
                title={isCollapsed ? "Token Management" : undefined}
              >
                <Image
                  src={"/icons/token.svg"}
                  width={20}
                  height={20}
                  alt="Token Management"
                  className="flex-shrink-0"
                />
                {!isCollapsed && <span className="">Token Management</span>}
              </Link>
            </li>
          </ul>
          {!isCollapsed && (
            <Link href={"./katalog-event"}>
              <Button className="rounded-[4px] bg-[#003EC7] text-white w-full mt-4">
                Eksplor Katalog Event
              </Button>
            </Link>
          )}
        </div>
      </div>
      <div className="border-t border-[#E5E7EB] pt-4 flex-shrink-0">
        <Link
          href="/pengaturan"
          className={`flex items-center text-[14px] transition-colors ${
            isCollapsed
              ? "justify-center py-2 px-0 w-12 mx-auto"
              : "gap-3 pb-2.5 px-3"
          } ${
            isActive("/pengaturan")
              ? "text-[#003EC7] font-semibold"
              : "text-[#6B7280] hover:text-[#374151]"
          }`}
          title={isCollapsed ? "Pengaturan" : undefined}
        >
          <Settings
            className={`w-6 h-6 flex-shrink-0 ${isActive("/pengaturan") ? "text-[#003EC7]" : ""}`}
          />
          {!isCollapsed && <span>Pengaturan</span>}
        </Link>

        <Link
          href="/bantuan"
          className={`flex items-center text-[14px] transition-colors ${
            isCollapsed
              ? "justify-center py-2 px-0 w-12 mx-auto"
              : "gap-3 py-2.5 px-3"
          } ${
            isActive("/bantuan")
              ? "text-[#003EC7] font-semibold"
              : "text-[#6B7280] hover:text-[#374151]"
          }`}
          title={isCollapsed ? "Bantuan" : undefined}
        >
          <HelpCircle
            className={`w-6 h-6 flex-shrink-0 ${isActive("/bantuan") ? "text-[#003EC7]" : ""}`}
          />
          {!isCollapsed && <span>Bantuan</span>}
        </Link>

        {!isCollapsed && (
          <div className="px-4 py-4 bg-[#EEF2FF] border border-[#E0E7FF] rounded-lg">
            <h3 className="text-[14px] font-semibold text-[#1E40AF] mb-1">
              Upgrade to Pro
            </h3>
            <p className="text-[12px] text-[#475569] mb-3">
              Dapatkan akses ke analytics premium dan sponsorship tools
              eksklusif.
            </p>
            <Link href={"/token-management"}>
              <Button className="w-full bg-[#003EC7] hover:bg-[#002BA8] text-white text-[14px] py-1.5">
                Upgrade Now
              </Button>
            </Link>
          </div>
        )}
        <Button
          onClick={handleLogout}
          className={`text-[#BA1A1A] bg-transparent rounded-[8px] mt-2 transition-all duration-300 ${
            isCollapsed
              ? "w-12 h-10 p-0 flex items-center justify-center mx-auto"
              : "w-full px-4 py-2"
          }`}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </aside>
  );
}
