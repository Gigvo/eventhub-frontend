import React from "react";
import Image from "next/image";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventOrganizerProfile {
  organizationName: string;
  logoUrl: string | null;
}

interface EventDetails {
  id: string;
  title: string;
  slug: string;
  category: string;
  bannerUrl: string | null;
  startDate: string;
  endDate: string;
  city: string;
  eoProfile: EventOrganizerProfile;
}

interface SponsorshipTier {
  name: string;
  price: number;
}

interface KerjasamaProps {
  id: string;
  eventId: string;
  companyProfileId: string;
  tierId: string;
  status: "ACCEPTED" | "UNDER_REVIEW" | "PENDING" | "REJECTED" | string;
  initiatedBy: "EO" | "COMPANY" | string;
  message: string;
  createdAt: string;
  updatedAt: string;
  respondedAt: string | null;
  closedAt: string | null;
  event: EventDetails;
  tier: SponsorshipTier;
}

export default function KerjasamaCard({
  id,
  event,
  tier,
}: KerjasamaProps) {
  const now = new Date();
  const start = event.startDate ? new Date(event.startDate) : new Date();
  const end = event.endDate ? new Date(event.endDate) : new Date();

  let progressText = "";
  let progressPercent = 0;
  let badgeText = "";
  let badgeColor = "";
  let trackColor = "";
  let textColor = "";

  if (now < start) {
    progressText = "Tanda Tangan Kontrak (25%)";
    progressPercent = 25;
    badgeText = "PERSIAPAN";
    badgeColor = "bg-[#973918]";
    trackColor = "bg-[#973918]";
    textColor = "text-[#973918]";
  } else if (now >= start && now <= end) {
    progressText = "Aktif (65%)";
    progressPercent = 65;
    badgeText = "BERJALAN";
    badgeColor = "bg-[#3446C1]";
    trackColor = "bg-[#475569]";
    textColor = "text-[#475569]";
  } else {
    progressText = "Pelaporan (90%)";
    progressPercent = 90;
    badgeText = "MENUJU SELESAI";
    badgeColor = "bg-[#586475]";
    trackColor = "bg-[#475569]";
    textColor = "text-[#475569]";
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col sm:flex-row bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm h-auto sm:h-[180px]">
      {/* Left: Image */}
      <div className="relative w-full sm:w-[280px] h-[160px] sm:h-full bg-gray-100 flex-shrink-0">
        {event.bannerUrl ? (
          <Image
            src={event.bannerUrl}
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        <div className={`absolute top-4 left-4 px-3 py-1 text-[10px] font-bold text-white rounded ${badgeColor} uppercase tracking-wider shadow-sm`}>
          {badgeText}
        </div>
      </div>

      {/* Middle: Info */}
      <div className="flex-1 p-5 flex flex-col justify-between border-b sm:border-b-0 sm:border-r border-gray-100">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1.5">{event.title}</h3>
            <div className="flex items-center text-xs text-gray-500 font-medium">
              <Building2 className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
              {event.eoProfile?.organizationName || "Organizer"} (EO)
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Nilai Kontrak</p>
            <p className="text-sm font-medium text-gray-600">{formatRupiah(tier.price)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 sm:mt-0 pb-3">
          <div className="flex justify-between items-end mb-2.5">
            <p className="text-xs font-bold text-gray-600">Progres Kerjasama</p>
            <p className={`text-xs font-bold ${textColor}`}>{progressText}</p>
          </div>
          
          <div className="relative w-full pt-1">
            {/* Background track */}
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              {/* Fill track */}
              <div 
                className={`h-full rounded-full ${trackColor}`} 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            
            {/* Markers */}
            <div className="flex justify-between mt-2.5 text-[10px] font-semibold text-gray-300 relative px-1">
              <div className="flex flex-col items-center absolute left-0 -translate-x-1/2">
                <div className={`w-2 h-2 rounded-full mb-1.5 ${progressPercent >= 25 ? trackColor : 'bg-gray-300'}`}></div>
                <span className={progressPercent >= 25 ? 'text-gray-500' : ''}>Kontrak</span>
              </div>
              <div className="flex flex-col items-center absolute left-[45%] -translate-x-1/2">
                <div className={`w-2 h-2 rounded-full mb-1.5 ${progressPercent >= 65 ? trackColor : 'bg-gray-300'}`}></div>
                <span className={progressPercent >= 65 ? 'text-gray-500' : ''}>Aktif</span>
              </div>
              <div className="flex flex-col items-center absolute left-[75%] -translate-x-1/2">
                <div className={`w-2 h-2 rounded-full mb-1.5 ${progressPercent >= 90 ? trackColor : 'bg-gray-300'}`}></div>
                <span className={progressPercent >= 90 ? 'text-gray-500' : ''}>Pelaporan</span>
              </div>
              <div className="flex flex-col items-center absolute right-0 translate-x-1/2">
                <div className={`w-2 h-2 rounded-full mb-1.5 ${progressPercent >= 100 ? trackColor : 'bg-gray-300'}`}></div>
                <span className={progressPercent >= 100 ? 'text-gray-500' : ''}>Selesai</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Action */}
      <div className="w-full sm:w-[200px] flex-shrink-0 flex items-center justify-center p-6 bg-white">
        <Button className="w-full bg-[#3446C1] hover:bg-blue-700 text-white font-medium py-2.5 h-auto">
          Lihat Detail
        </Button>
      </div>
    </div>
  );
}
