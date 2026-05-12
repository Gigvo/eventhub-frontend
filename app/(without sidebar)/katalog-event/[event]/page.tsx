"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Share2,
  Bookmark,
  Clock,
  CheckCircle,
  Sparkles,
  Check,
} from "lucide-react";
import Image from "next/image";

interface EventDetail {
  id: string;
  title: string;
  banner: string;
  category: string;
  organizer: string;
  aiScore: number;
  description: string;
  targetAudience: {
    demographic: Array<{ label: string; value: number }>;
    industries: string[];
    tags: string[];
  };
  budget: { min: string; max: string };
  slotsAvailable: { current: number; total: number };
  deadlineProposal: string;
  paymentMethod: string;
  daysRemaining: number;
  matchBreakdown: Array<{ label: string; checked: boolean }>;
}

// Mock event details data
const eventDetailsMap: Record<string, EventDetail> = {
  "1": {
    id: "1",
    title: "TechForward 2024: Scaling The Future",
    banner: "/event-1.png",
    category: "CONFERENCE",
    organizer: "TechGlobal Indonesia",
    aiScore: 94,
    description:
      "TechForward 2024 adalah sebuah teknologi tahunan yang mempermudahkan para inovator, pemimpin industri untuk mempelajari tantangan terbaru dan ekosistem. Tahun ini, fokus utama kami adalah Scaling Sustainable AI dan ekosistem.\n\nEvent ini dirancang untuk memfasilitasi kolaborasi tingkat tinggi melalui workshop eksklusif, panel diskusi utama, sesi networking VIP. Dengan target 2.500 delegasi dari berbagai industri level C dan manager senior dari sektor finansial, manufaktur, dan e-commerce.",
    targetAudience: {
      demographic: [
        { label: "Usia 25-45", value: 72 },
        { label: "Jabatan Manajerial+", value: 56 },
      ],
      industries: ["FinTech", "SaaS", "Retail Tech", "Logistik"],
      tags: ["#Innovation", "#B2BNetworking", "#FutureTech", "#ScaleUp"],
    },
    budget: { min: "25", max: "150" },
    slotsAvailable: { current: 4, total: 10 },
    deadlineProposal: "12 OKT 2024",
    paymentMethod: "Cicilan 2x",
    daysRemaining: 5,
    matchBreakdown: [
      {
        label: "Audiences 72% sesuai dengan segment target brand Anda.",
        checked: true,
      },
      {
        label: "Sebarkan event memainkan ROI tinggi di kategori IT.",
        checked: true,
      },
      {
        label: "Lokasi event strategis begini HQ pemanggilnya Anda.",
        checked: true,
      },
    ],
  },
  // Add more events as needed
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [isInterested, setIsInterested] = useState(false);

  const eventId = params.event as string;
  const event = eventDetailsMap[eventId];

  if (!event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event tidak ditemukan</h1>
          <Button onClick={() => router.back()}>Kembali</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-5 w-5" />
              Kembali
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Proposal Markup</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">{event.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setIsSaved(!isSaved)}
            >
              <Bookmark
                className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`}
              />
              Simpan
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Bagikan
            </Button>
            <Button
              onClick={() => setIsInterested(!isInterested)}
              className={`rounded-[4px] font-semibold ${
                isInterested
                  ? "bg-[#22C55E] hover:bg-[#16A34A]"
                  : "bg-[#22C55E] hover:bg-[#16A34A]"
              }`}
            >
              ✓ Saya Tertarik
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 ">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8 bg-white">
            {/* Banner */}
            <div className="relative w-full h-80 overflow-hidden bg-gray-200 flex items-center justify-center">
              <Image
                src={event.banner}
                alt={event.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-end m-6">
                <div className="text-white">
                  <div className="text-sm font-semibold mb-2">
                    {event.category}
                  </div>
                  <h1 className="text-3xl font-bold">{event.title}</h1>
                </div>
              </div>

              {/* AI Score */}
              <div
                className="absolute bottom-4 right-4 rounded-lg p-3 text-center text-white border border-white/30"
                style={{
                  background:
                    "var(--color-white-10, rgba(255, 255, 255, 0.10))",
                }}
              >
                <div className="text-xs">AI MATCH SCORE</div>
                <div className="text-[40px] font-bold ">
                  {event.aiScore}
                  <span className="text-[18px]">%</span>
                </div>
              </div>
            </div>

            {/* About Event Section */}
            <div className="px-16">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="h-6 w-6  bg-gray-200 flex items-center justify-center text-sm">
                  01
                </div>
                Tentang Event
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm">
                {event.description}
              </p>
            </div>

            {/* Target Audiences */}
            <div className="px-16 pb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="h-6 w-6  bg-gray-200 flex items-center justify-center text-sm">
                  02
                </div>
                Target Audiens
              </h2>

              <div className="flex items-stretch gap-6  mb-6">
                {/* Demographics */}
                <div className="flex flex-col gap-6 bg-[#F2F4F6] p-4 border border-[#C3C5D9] rounded-[8px] flex-1">
                  {event.targetAudience.demographic.map((demo, idx) => (
                    <div key={idx}>
                      <div className="text-sm font-semibold text-gray-700 mb-2">
                        {demo.label}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full"
                          style={{ width: `${demo.value}%` }}
                        />
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {demo.value}%
                      </div>
                    </div>
                  ))}
                </div>

                {/* Industries */}
                <div className=" bg-[#F2F4F6] p-4 border border-[#C3C5D9] rounded-[8px] flex-1">
                  <div className="text-sm font-semibold text-gray-700 mb-3">
                    INDUSTRI DOMINAN
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {event.targetAudience.industries.map((industry, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="bg-gray-50 text-gray-700"
                      >
                        {industry}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {event.targetAudience.tags.map((tag, idx) => (
                  <Badge key={idx} className="bg-blue-100 text-blue-800">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Budget Info */}
            <Card className="p-6">
              <h3 className="text-xs font-semibold text-gray-600 mb-2">
                BUDGET RANGE
              </h3>
              <div className="text-2xl font-light text-blue-600 mb-4">
                IDR {event.budget.min} - {event.budget.max}jt
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between pb-2 border-b border-gray-300">
                  <div className="text-gray-600 text-xs">
                    Sisa Slot Tersedia
                  </div>
                  <div className="font-semibold text-gray-900">
                    {event.slotsAvailable.current} dari{" "}
                    {event.slotsAvailable.total}
                  </div>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-300">
                  <div className="text-gray-600 text-xs">Deadline Proposal</div>
                  <div className="font-semibold text-red-600">
                    {event.deadlineProposal}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-gray-600 text-xs">Metode Pembayaran</div>
                  <div className="font-semibold text-gray-900">
                    {event.paymentMethod}
                  </div>
                </div>
              </div>
              <div className="p-6 bg-[#003EC70D] rounded-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#003EC7]" />
                  AI Match Breakdown
                </h3>
                <div className="space-y-3">
                  {event.matchBreakdown.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <Check className="h-5 w-5 text-[#003EC7] flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                onClick={() => setIsInterested(!isInterested)}
                className={`w-full h-12 font-semibold ${
                  isInterested
                    ? "bg-[#22C55E] hover:bg-[#16A34A]"
                    : "bg-[#22C55E] hover:bg-[#16A34A]"
                }`}
              >
                ✓ Saya Tertarik
              </Button>
              <Button className="w-full font-semibold bg-white text-black border border-[#C3C5D9]">
                Lihat Profil
              </Button>
            </Card>

            {/* View Profile */}
            <div className="p-6 bg-[#E0E3E5] rounded-lg">
              <p className="text-xs text-[#434656] mb-4">
                Lengkapi data profil Anda untuk meningkatkan akurasi matching
                proposal hingga 15%.
              </p>
              <Button
                variant="outline"
                className="w-full border-white text-white bg-[#003EC7]"
              >
                Upgrade Plan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
