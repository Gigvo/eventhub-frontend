"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  X,
  MessageCircle,
  Mail,
  CheckCircle,
  Zap,
  Users,
  Award,
  Copy,
  Eye,
} from "lucide-react";
import Image from "next/image";

interface SponsorProposal {
  id: string;
  company: string;
  logo: string;
  badge: string;
  sector: string;
  receivedAt: string;
  eventName: string;
  sponsorPackage: string;
  message: string;
  whatsapp: string;
  email: string;
  matchScore: number;
  targetAudience: string;
  sponsorHistory: number;
}

const CariSponsor = () => {
  const [proposals, setProposals] = useState<SponsorProposal[]>([
    {
      id: "1",
      company: "PT Maju Digital",
      logo: "/pt-maju-digital.png",
      badge: "24jam",
      sector: "Teknologi & Digital Marketing",
      receivedAt: "30 April 2026, 14:30 WIB",
      eventName: "Tech Fest Jakarta 2026",
      sponsorPackage: "Platinum Tier",
      message:
        '"Kami melihat potensi besar dalam audiences target Tech Innovate 2024 yang sangat relevan dengan produk baru kami. Kami ingin mendiskusikan penyesuaian penempatan logo pada Main Stage serta slot keynote speaker selama 15 menit."',
      whatsapp: "+62 812-3456-7890",
      email: "marketing@maju-digital.co.id",
      matchScore: 94,
      targetAudience: "Gen Z, Tech-Savvy",
      sponsorHistory: 12,
    },
  ]);

  const [showContact, setShowContact] = useState(false);

  const handleAccept = (id: string) => {
    // Handle accept logic
    console.log("Accepted proposal:", id);
  };

  const handleReject = (id: string) => {
    setProposals(proposals.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Notification Banner */}
      <div className="bg-blue-600 text-white rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-xl">⚡</div>
          <p className="text-sm font-medium">
            PT Maju Digital tertarik dengan proposal event &quot;Tech Innovate
            2024&quot; Anda!
          </p>
        </div>
        <button className="text-white hover:bg-blue-700 p-1 rounded">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Proposal Cards */}
        {proposals.map((proposal) => (
          <div key={proposal.id} className="overflow-hidden ">
            {/* Header with Sponsor Info */}
            <div className="bg-white p-6 rounded-t-[8px]">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className="relative h-16 w-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={proposal.logo}
                      alt={proposal.company}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {proposal.company}
                      </h3>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        BARU
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{proposal.sector}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Diterima pada</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {proposal.receivedAt}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pb-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold mb-1">
                      EVENT TUJUAN
                    </p>
                    <p className="text-gray-900 font-medium">
                      {proposal.eventName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold mb-1">
                      PAKET SPONSOR
                    </p>
                    <p className="text-gray-900 font-medium">
                      {proposal.sponsorPackage}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold mb-2">
                      PESAN DARI PERUSAHAAN
                    </p>
                    <p className="text-sm text-gray-700 italic">
                      {proposal.message}
                    </p>
                  </div>
                </div>

                {/* Right Column - Contact Card */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-4">
                    {/* WhatsApp */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="h-4 w-4 text-green-600" />
                        <p className="text-xs text-gray-600 font-semibold">
                          WHATSAPP
                        </p>
                      </div>
                      <p className="text-sm text-gray-900 font-mono">
                        {showContact ? proposal.whatsapp : "•• ••• •••• •••••"}
                      </p>
                    </div>

                    {/* Email */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <p className="text-xs text-gray-600 font-semibold">
                          EMAIL BISNIS
                        </p>
                      </div>
                      <p className="text-sm text-gray-900">
                        {showContact
                          ? proposal.email
                          : "••••••••@••••••••••••.•••"}
                      </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-red-50 rounded-lg p-3 space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700">
                          Akses kontak langsung PIC perusahaan
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <MessageCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700">
                          Buka fitur Chat di dalam platform.
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700">
                          Formulir Kontak otomatis tersedia.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-[#E5E7EB] p-6 flex items-center justify-between gap-4 rounded-b-[8px]">
              <div className="flex gap-4 flex-1">
                <Button
                  onClick={() => {
                    handleAccept(proposal.id);
                    setShowContact(true);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2 h-12 font-semibold"
                >
                  <CheckCircle className="h-5 w-5" />
                  Setujui & Buka Kontak
                </Button>
                <Button
                  onClick={() => handleReject(proposal.id)}
                  variant="outline"
                  className="flex-1 border-red-600 text-red-600 hover:bg-red-50 h-12 font-semibold"
                >
                  <X className="h-5 w-5" />
                  Tolak
                </Button>
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-2">
                  💭 Menyetujui akan memberikan phak sponsor bahasa Anda siap
                  berkelaborasi.
                </p>
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-gray-50 mt-6">
              <div className="flex items-center gap-4">
                {/* Match Score */}
                <div className="flex items-center gap-4 flex-1 bg-white p-4 rounded-[8px]">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">
                      MATCH SCORE
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-gray-900">
                        {proposal.matchScore}%
                      </p>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        AI MATCH
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Target Audience */}
                <div className="flex items-center gap-4 flex-1 bg-white p-4 rounded-[8px]">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">
                      TARGET AUDIENS
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {proposal.targetAudience}
                    </p>
                  </div>
                </div>

                {/* Sponsor History */}
                <div className="flex items-center gap-4 flex-1 bg-white p-4 rounded-[8px]">
                  <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">
                      RIWAYAT SPONSOR
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {proposal.sponsorHistory} Event Tahun ini
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className=" px-6 py-4  text-center mt-6">
              <p className="text-xs text-gray-500">
                🔒 Privasi data Anda dan sponsor dilindungi sesuai Syarat &
                Ketentuan Layanan EventHub Business.
              </p>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {proposals.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-500 text-lg">
              Tidak ada proposal sponsor saat ini
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CariSponsor;
