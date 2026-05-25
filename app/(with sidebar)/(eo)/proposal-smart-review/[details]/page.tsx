"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiCall } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Download,
  Sparkles,
  Info,
  Calendar,
  MapPin,
  Building2,
  Bell,
  Handshake,
  CheckCircle2,
  XCircle,
  Eye,
  Hourglass,
  Clock,
  Loader2,
  FileText,
} from "lucide-react";

interface PitchDetail {
  id: string;
  eventId: string;
  companyProfileId: string;
  tierId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | string;
  initiatedBy: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  respondedAt: string | null;
  closedAt: string | null;
  event: {
    id: string;
    eoProfileId: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    theme: string;
    bannerUrl: string | null;
    startDate: string;
    endDate: string;
    city: string;
    venue: string;
    isOnline: boolean;
    expectedAttendees: number;
    audienceAgeMin: number;
    audienceAgeMax: number;
    audienceInterests: string[];
    status: string;
    publishedAt: string | null;
  };
  companyProfile: {
    id: string;
    userId: string;
    companyName: string;
    industry: string;
    description: string;
    logoUrl: string | null;
    website: string | null;
    phoneNumber: string;
    city: string;
    targetAudience: string;
    preferences: string | null;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    user: {
      email: string;
    };
  };
  tier: {
    id: string;
    eventId: string;
    name: string;
    price: number;
    benefits: string[];
    maxSlots: number;
    createdAt: string;
    updatedAt: string;
  };
}

export default function OfferDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const pitchId = params.details as string;

  const [pitch, setPitch] = useState<PitchDetail | null>(null);
  const [eventProposalUrl, setEventProposalUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pitchId) return;

    setIsLoading(true);
    // Fetch pitch detail
    apiCall<{ data: PitchDetail }>(`/pitches/my/${pitchId}`)
      .then((res) => {
        setPitch(res.data);

        // Fetch event details to get the proposal fileUrl if available
        return apiCall<{ data: { proposal?: { fileUrl: string } } }>(
          `/events/${res.data.eventId}`,
        );
      })
      .then((eventRes) => {
        if (eventRes?.data?.proposal?.fileUrl) {
          setEventProposalUrl(eventRes.data.proposal.fileUrl);
        }
      })
      .catch((err) => {
        console.error("Failed to load details:", err);
        setError(err?.message ?? "Gagal memuat detail penawaran.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [pitchId]);

  const handleDownloadPDF = async () => {
    if (!eventProposalUrl) {
      alert("Proposal PDF tidak tersedia untuk event ini.");
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(eventProposalUrl);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cleanTitle =
        pitch?.event.title.replace(/[^a-zA-Z0-9]/g, "_") || "Proposal";
      a.download = `Proposal_${cleanTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("Direct download failed, opening in new tab:", err);
      window.open(eventProposalUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr: string) => {
    return (
      new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB"
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-500">Memuat detail penawaran...</p>
      </div>
    );
  }

  if (error || !pitch) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Card className="p-8 text-center border-red-100 bg-red-50/50">
          <p className="text-red-600 font-semibold mb-4">
            Error: {error || "Data penawaran tidak ditemukan"}
          </p>
          <Button onClick={() => router.push("/proposal-smart-review")}>
            Kembali ke Smart Review
          </Button>
        </Card>
      </div>
    );
  }

  // Get status metadata
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return {
          label: "Disetujui",
          color: "bg-green-100 text-green-800 border-green-200",
          progressLabel: "Disetujui",
        };
      case "REJECTED":
        return {
          label: "Ditolak",
          color: "bg-red-100 text-red-800 border-red-200",
          progressLabel: "Ditolak",
        };
      case "PENDING":
      default:
        return {
          label: "Under Review",
          color: "bg-blue-50 text-blue-700 border-blue-100",
          progressLabel: "Under Review",
        };
    }
  };

  const statusMeta = getStatusBadge(pitch.status);

  // Determine current active stepper step (1 to 4)
  let stepperStep = 3;
  if (pitch.status === "ACCEPTED" || pitch.status === "REJECTED") {
    stepperStep = 4;
  } else {
    stepperStep = 3;
  }

  // Get state properties for the right column steps
  const getStepState = (itemIndex: number) => {
    let state: "active" | "completed" | "future" = "future";
    if (itemIndex === 1) {
      if (stepperStep === 1) state = "active";
      else state = "completed";
    } else if (itemIndex === 2) {
      if (stepperStep === 2 || stepperStep === 3) state = "active";
      else if (stepperStep > 3) state = "completed";
      else state = "future";
    } else if (itemIndex === 3) {
      if (stepperStep === 4) state = "active";
      else state = "future";
    }

    if (state === "active") {
      return {
        circle: "bg-blue-100 text-blue-600 border border-blue-200 shadow-sm",
        title: "text-blue-600 font-bold",
        desc: "text-blue-500",
      };
    } else if (state === "completed") {
      return {
        circle: "bg-emerald-100 text-emerald-600 border border-emerald-200 shadow-sm",
        title: "text-gray-900 font-bold",
        desc: "text-gray-500",
      };
    } else {
      return {
        circle: "bg-gray-100 text-gray-400 border border-gray-200",
        title: "text-gray-400 font-bold",
        desc: "text-gray-400",
      };
    }
  };

  // Get style class for main progress stepper circles
  const getStepperCircleClass = (stepIndex: number) => {
    if (stepperStep === stepIndex) {
      return "w-10 h-10 rounded-full border-2 border-blue-600 bg-white text-blue-600 flex items-center justify-center shadow-sm z-10";
    } else if (stepperStep > stepIndex) {
      return "w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md z-10";
    } else {
      return "w-10 h-10 rounded-full border-2 border-gray-200 bg-white text-gray-400 flex items-center justify-center z-10";
    }
  };

  // Avatar initial color
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-emerald-600 text-white",
      "bg-blue-600 text-white",
      "bg-purple-600 text-white",
      "bg-orange-600 text-white",
      "bg-rose-600 text-white",
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span
          onClick={() => router.push("/dashboard")}
          className="hover:text-blue-600 hover:underline cursor-pointer transition"
        >
          Dashboard
        </span>
        <span>/</span>
        <span
          onClick={() => router.push("/proposal-smart-review?tab=terbaru")}
          className="hover:text-blue-600 hover:underline cursor-pointer transition"
        >
          Proposal Terbaru
        </span>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-xs">
          {pitch.companyProfile.companyName}
        </span>
      </div>

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Detail Penawaran
          </h1>
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarColor(pitch.companyProfile.companyName)}`}
            >
              {pitch.companyProfile.companyName[0].toUpperCase()}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
              <span>{pitch.companyProfile.companyName}</span>
              <span className="text-gray-300">•</span>
              <span>{pitch.event.title}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={!eventProposalUrl || isDownloading}
            className="gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download PDF
          </Button>
          <Button
            onClick={() =>
              router.push(`/proposal-smart-review?id=${pitch.eventId}`)
            }
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-none"
          >
            <Sparkles className="h-4 w-4" />
            Proposal Smart Review
          </Button>
        </div>
      </div>

      {/* Layout Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline Card */}
          <Card className="p-6 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-gray-900">
                Progress Penawaran
              </h2>
              <Badge
                className={`px-3 py-1 text-xs font-semibold border ${statusMeta.color}`}
              >
                {statusMeta.label}
              </Badge>
            </div>

            {/* Stepper Progress Bar */}
            <div className="relative">
              {/* Connector line */}
              <div className="absolute top-5 left-8 right-8 h-0.5 bg-gray-200 z-0" />
              <div
                className="absolute top-5 left-8 h-0.5 bg-blue-600 z-0 transition-all duration-500"
                style={{
                  width:
                    stepperStep === 1
                      ? "0%"
                      : stepperStep === 2
                        ? "33%"
                        : stepperStep === 3
                          ? "66%"
                          : "100%",
                }}
              />

              <div className="grid grid-cols-4 relative z-10 text-center">
                {/* Step 1: Proposal Dikirim */}
                <div className="flex flex-col items-center gap-2.5">
                  <div className={getStepperCircleClass(1)}>
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">
                      Proposal Dikirim
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {formatDate(pitch.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Step 2: Dilihat Sponsor */}
                <div className="flex flex-col items-center gap-2.5">
                  <div className={getStepperCircleClass(2)}>
                    <Eye className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">
                      Dilihat Sponsor
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {pitch.respondedAt
                        ? formatDate(pitch.respondedAt)
                        : "Sudah Dilihat"}
                    </p>
                  </div>
                </div>

                {/* Step 3: Sedang Direview */}
                <div className="flex flex-col items-center gap-2.5">
                  <div className={getStepperCircleClass(3)}>
                    <Hourglass className={`h-5 w-5 ${stepperStep === 3 ? "animate-pulse" : ""}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-600">
                      Sedang Direview
                    </p>

                    <p className="text-[10px] text-blue-500 font-semibold mt-0.5">
                      {pitch.respondedAt
                        ? formatDate(pitch.respondedAt)
                        : "Aktif Sekarang"}
                    </p>
                  </div>
                </div>

                {/* Step 4: Keputusan Final */}
                <div className="flex flex-col items-center gap-2.5">
                  {pitch.status === "ACCEPTED" ? (
                    <>
                      <div className={getStepperCircleClass(4)}>
                        <Handshake className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-green-700">
                          Disetujui
                        </p>
                        <p className="text-[10px] text-green-600 mt-0.5">
                          {pitch.respondedAt
                            ? formatDate(pitch.respondedAt)
                            : ""}
                        </p>
                      </div>
                    </>
                  ) : pitch.status === "REJECTED" ? (
                    <>
                      <div className={getStepperCircleClass(4)}>
                        <XCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-red-700">
                          Ditolak
                        </p>
                        <p className="text-[10px] text-red-600 mt-0.5">
                          {pitch.respondedAt
                            ? formatDate(pitch.respondedAt)
                            : ""}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={getStepperCircleClass(4)}>
                        <Handshake className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400">
                          Keputusan Final
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Belum Sampai
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Details Card */}
          <Card className="border border-gray-100 shadow-sm overflow-hidden bg-white">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2.5 text-blue-700 font-bold text-base">
              <Info className="h-5 w-5 text-blue-600" />
              <span>Rincian Penawaran</span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Perusahaan
                </span>
                <p className="text-sm font-semibold text-gray-900">
                  {pitch.companyProfile.companyName}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Event
                </span>
                <p className="text-sm font-semibold text-gray-900">
                  {pitch.event.title}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Paket Sponsorship
                </span>
                <p className="text-sm font-bold text-blue-700">
                  {pitch.tier.name} Partner ({formatPrice(pitch.tier.price)})
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Tanggal Kirim
                </span>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDateTime(pitch.createdAt)}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Terakhir Diperbarui
                </span>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDateTime(pitch.updatedAt)}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Status Saat Ini
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {pitch.status === "PENDING" && (
                    <Badge className="bg-yellow-50 text-yellow-700 border border-yellow-100 gap-1 text-[11px] font-medium py-0.5 px-2">
                      <Clock className="h-3.5 w-3.5 text-yellow-600" />
                      Review Internal
                    </Badge>
                  )}
                  {pitch.status === "ACCEPTED" && (
                    <Badge className="bg-green-50 text-green-700 border border-green-100 gap-1 text-[11px] font-medium py-0.5 px-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      Disetujui
                    </Badge>
                  )}
                  {pitch.status === "REJECTED" && (
                    <Badge className="bg-red-50 text-red-700 border border-red-100 gap-1 text-[11px] font-medium py-0.5 px-2">
                      <XCircle className="h-3.5 w-3.5 text-red-600" />
                      Ditolak
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Message/Closing remarks */}
            <div className="px-6 pb-6 pt-2">
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Catatan Penutup Proposal:
                </span>
                <p className="text-xs text-gray-600 italic leading-relaxed whitespace-pre-line">
                  &quot;{pitch.message}&quot;
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Langkah Berikutnya Card */}
          <Card className="p-6 border border-gray-100 shadow-sm bg-white space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-3">
              Langkah Berikutnya
            </h2>

            <div className="space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
              {/* Step 1 */}
              {(() => {
                const state = getStepState(1);
                return (
                  <div className="flex gap-4 items-start relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${state.circle}`}>
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 mt-0.5">
                      <h4 className={`text-sm ${state.title}`}>
                        Tunggu Respons
                      </h4>
                      <p className={`text-xs leading-relaxed ${state.desc}`}>
                        Sponsor telah menerima dokumen Anda.
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Step 2 */}
              {(() => {
                const state = getStepState(2);
                return (
                  <div className="flex gap-4 items-start relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${state.circle}`}>
                      <Bell className="h-5 w-5" />
                    </div>
                    <div className="space-y-3 mt-0.5 flex-1">
                      <div className="space-y-1">
                        <h4 className={`text-sm ${state.title}`}>
                          Ketahui Update Status
                        </h4>
                        <p className={`text-xs leading-relaxed ${state.desc}`}>
                          Cek perkembangan status pengajuan Anda melalui dashboard
                        </p>
                      </div>
                      {(stepperStep === 2 || stepperStep === 3) && (
                        <div className="bg-blue-50/50 border border-blue-100 rounded p-2.5 text-center">
                          <span className="text-[10px] font-bold text-blue-800">
                            Estimasi waktu: 2-3 hari kerja
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Step 3 */}
              {(() => {
                const state = getStepState(3);
                return (
                  <div className="flex gap-4 items-start relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${state.circle}`}>
                      <Handshake className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 mt-0.5">
                      <h4 className={`text-sm ${state.title}`}>
                        Tindak Lanjut
                      </h4>
                      <p className={`text-xs leading-relaxed ${state.desc}`}>
                        Langkah finalisasi kontrak jika disetujui oleh mitra.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </Card>

          {/* Target Company Card */}
          <Card className="p-6 bg-[#111827] text-white border-none shadow-xl flex flex-col justify-between space-y-6">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Target Perusahaan
              </span>

              <div className="flex items-center gap-4 mt-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-800 overflow-hidden shadow-inner">
                  <Building2 className="h-6 w-6 text-gray-800" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold truncate leading-tight">
                    {pitch.companyProfile.companyName}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 truncate flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                    <span>{pitch.companyProfile.city}, Indonesia</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-gray-800 pt-5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-medium">Match Score</span>
                <span className="text-emerald-400 font-bold">94%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: "94%" }}
                />
              </div>
            </div>

            <Button
              onClick={() =>
                router.push(`/cari-sponsor?focus=${pitch.companyProfileId}`)
              }
              className="w-full mt-4 bg-gray-850 hover:bg-gray-800 border border-gray-700 text-white font-medium gap-2 py-2.5 transition text-xs"
            >
              <Building2 className="h-4 w-4" />
              Lihat Profil Lengkap
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
