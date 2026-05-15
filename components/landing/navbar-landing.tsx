"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { useAuth } from "@/providers/auth-provider";

export default function NavbarLanding() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <nav className="px-80 flex items-center justify-between bg-white border-b border-[#E5E7EB] px-8 py-4">
      <div className="flex items-center gap-6">
        <span className="text-[18px] font-bold text-[#111827] mr-2">
          EventHub
        </span>

        <Link
          href={"/features"}
          className="text-[14px] text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          Features
        </Link>
        <Link
          href={"/pricing"}
          className="text-[14px] text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          Pricing
        </Link>
        <Link
          href={"/katalog-event"}
          className="text-[14px] text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          Katalog Event
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {!isLoading && !isAuthenticated && (
          <>
            <Button
              variant="ghost"
              className="text-[14px] text-[#6B7280] hover:text-[#111827]"
            >
              Log In
            </Button>
            <Button className="rounded-[8px] bg-[#003EC7] hover:bg-[#002BA8] text-white text-[14px] px-5 py-2">
              Get Started
            </Button>
          </>
        )}
        {!isLoading && isAuthenticated && (
          <Link href={"/dashboard"}>
            <Button className="rounded-[8px] bg-[#003EC7] hover:bg-[#002BA8] text-white text-[14px] px-5 py-2">
              Dashboard
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
