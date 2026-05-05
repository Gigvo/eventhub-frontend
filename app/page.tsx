import Image from "next/image";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import SponsorCard from "@/components/sponsor-card";

export default function Home() {
  return (
    <div className="flex flex-wrap">
      <SponsorCard />
      <SponsorCard />
      <SponsorCard />
      <SponsorCard />
      <SponsorCard />
      <SponsorCard />
      <SponsorCard />
      <SponsorCard />
      <SponsorCard />
      <SponsorCard />
      <SponsorCard />
      <SponsorCard />
    </div>
  );
}
