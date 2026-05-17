import React from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Bell, Settings, CircleUserRound } from "lucide-react";

export default function NavbarProposalBuilder() {
  return (
    <nav className="flex items-center justify-between px-6 py-2">
      <div className="flex items-center gap-6 ">
        <p className="font-bold text-[20px]">Proposal Review</p>
        <Link href={"/dashboard"}>
          <Button variant={"ghost"} className="text-[14px] text-[#6B7280]">
            Dashboard
          </Button>
        </Link>
        <Link href={"/events"}>
          <Button variant={"ghost"} className="text-[14px] text-[#6B7280]">
            Events
          </Button>
        </Link>
        <Link href={"/proposal-smart-review"}>
          <Button variant={"ghost"} className="text-[14px] text-[#6B7280]">
            Proposals
          </Button>
        </Link>
        <Link href={"/katalog-event-eo"}>
          <Button variant={"ghost"} className="text-[14px] text-[#6B7280]">
            Katalog
          </Button>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Bell />
        <Settings />
        <CircleUserRound />
      </div>
    </nav>
  );
}
