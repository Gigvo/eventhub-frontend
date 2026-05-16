import React from "react";
import { Button } from "../ui/button";

export default function NavbarOnboarding() {
  return (
    <nav className="px-60 flex items-center justify-between bg-white border-b border-[#E5E7EB] py-4 fixed top-0 left-0 right-0 z-20">
      <p className="text-[#003EC7] text-[24px] font-bold">EventHub</p>
      <div>
        <Button variant={"ghost"}>Help</Button>
        <Button variant={"ghost"} className="text-[#003EC7]">
          Logout
        </Button>
      </div>
    </nav>
  );
}
