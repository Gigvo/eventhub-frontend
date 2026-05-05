"use client";

import React from "react";
import { Bell, CircleUserRound, MessageSquare } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function Navbar() {
  return (
    <nav className="bg-[#F8F9FB] py-4.5 px-8 flex items-center justify-between sticky top-0 w-full border-b-1 border-[#E5E7EB] z-10 opacity-100">
      <Input
        placeholder="Cari event, sponsor, atau laporan..."
        className="w-88"
      />
      <div className="flex flex-row items-center">
        <div className="flex items-center gap-4 pr-6 border-r-1 border-[#FFDBD2]">
          <Bell className="" />
          <MessageSquare className="" />
        </div>
        <div className="flex flex-row gap-3 items-center pl-6">
          <div>
            <p className="text-[14px] font-bold">Budi Santoso</p>
            <p className="text-[11px] text-[#6B7280]">Event Organizer</p>
          </div>
          <CircleUserRound className="w-8 h-8" />
        </div>
        <Button className="rounded-[4px] bg-[#003EC7] ml-6 px-4 py-2">
          Buat Event Baru
        </Button>
      </div>
    </nav>
  );
}
