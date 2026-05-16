"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function NavbarLanding() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

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
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-[14px] text-[#6B7280] hover:text-[#111827]"
              >
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="rounded-[8px] bg-[#003EC7] hover:bg-[#002BA8] text-white text-[14px] px-5 py-2">
                Get Started
              </Button>
            </Link>
          </>
        )}
        {!isLoading && isAuthenticated && (
          <>
            <Link href={"/dashboard"}>
              <Button className="rounded-[8px] bg-[#003EC7] hover:bg-[#002BA8] text-white text-[14px] px-5 py-2">
                Dashboard
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-[8px]"
            >
              Logout
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
