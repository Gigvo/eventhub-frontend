import React from "react";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export default function SponsorCard() {
  return (
    <div className="bg-white rounded-[12px] h-fit p-6">
      <div className="flex flex-row justify-between pb-6">
        <p>Sponsor Image</p>
        <div className="bg-[#82F9BE] rounded-[4px]">
          <p>Verified</p>
        </div>
      </div>
      <p className="pb-2 text-[20px] font-bold">Sponsor Name</p>
      <Badge className="bg-[#50DCFF33] text-[#00687B] text-xs">
        Sponsor Badge
      </Badge>
      <div className="flex flex-row justify-between pt-6 pb-4 text-[#94A3B8]">
        <p className="text-xs">Sponsor Money</p>
        <p className="text-xs">Sponsor Location</p>
      </div>
      <div className="flex flex-col justify-center gap-2">
        <Button className="w-90 py-2.5 text-[14px] bg-[#003D9B]">
          View Details
        </Button>
        <div className="flex flex-row gap-2 w-full">
          <Button className="flex-1 text-[12px] py-2.5 bg-[#F3F4F6] text-[#191C1E]">
            Bookmark
          </Button>
          <Button className="flex-1 text-[12px] py-2.5 bg-[#F3F4F6] text-[#191C1E]">
            Compare
          </Button>
        </div>
      </div>
    </div>
  );
}
