"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Bookmark,
  Share2,
  Lock,
  Phone,
  Mail,
  CheckCircle2,
  Download,
  Building2,
  MapPin,
  Calendar,
  XCircle,
  Loader2,
  Check,
  User,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { apiCall } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Tier {
  id: string;
  name: string;
  price: number;
  benefits: string[];
  maxSlots: number;
}

interface PitchDetail {
  id: string;
  eventId: string;
  status: string;
  message: string;
  createdAt: string;
  tierId: string;
  event: {
    id: string;
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
    expectedAttendees: number;
    audienceAgeMin: number;
    audienceAgeMax: number;
    audienceInterests: string[];
    eoProfile: {
      id: string;
      organizationName: string;
      campus: string;
      logoUrl: string | null;
      phoneNumber: string;
      user: {
        email: string;
      };
    };
    tiers: Tier[];
  };
  tier: Tier;
}

export default function ProposalCardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pitchId = params.card as string;

  const [pitch, setPitch] = useState<PitchDetail | null>(null);
  const [proposalFileUrl, setProposalFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (!pitchId) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        // 1. Fetch Pitch Details
        const res = await apiCall<{ data: PitchDetail }>(
          `/pitches/incoming/${pitchId}`,
          {
            requireAuth: true,
          },
        );
        if (!res.data) throw new Error("Pitch not found");
        setPitch(res.data);

        // 2. Fetch catalog details in background to resolve proposal fileUrl
        try {
          const catRes = await apiCall<{
            data: { proposal?: { fileUrl: string } };
          }>(`/catalog/events/${res.data.event.slug}`);
          if (catRes?.data?.proposal?.fileUrl) {
            setProposalFileUrl(catRes.data.proposal.fileUrl);
          }
        } catch (e) {
          console.warn("Could not load catalog proposal file URL", e);
        }
      } catch (err) {
        console.error("Failed to fetch proposal details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [pitchId]);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDownloadPDF = async () => {
    const fileUrl = proposalFileUrl || "https://firebasestorage.googleapis.com";
    setIsDownloading(true);
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Failed to fetch file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Proposal_${pitch?.event.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("Direct download failed, opening in new tab:", err);
      window.open(fileUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAccept = async () => {
    if (!pitchId) return;
    setIsActionLoading(true);
    try {
      await apiCall(`/pitches/incoming/${pitchId}/accept`, {
        method: "POST",
        requireAuth: true,
      });
      setPitch((prev) => (prev ? { ...prev, status: "ACCEPTED" } : null));
      setShowAcceptDialog(false);
    } catch (err) {
      alert("Gagal menyetujui proposal.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!pitchId) return;
    setIsActionLoading(true);
    try {
      await apiCall(`/pitches/incoming/${pitchId}/reject`, {
        method: "POST",
        requireAuth: true,
        body: JSON.stringify({ reason: rejectReason }),
      });
      setPitch((prev) => (prev ? { ...prev, status: "REJECTED" } : null));
      setShowRejectDialog(false);
      setRejectReason("");
    } catch (err) {
      alert("Gagal menolak proposal.");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-500 font-semibold text-sm">
          Memuat dokumen proposal...
        </p>
      </div>
    );
  }

  if (!pitch) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg m-8 border border-red-100">
        <p className="font-semibold mb-4">Proposal tidak ditemukan</p>
        <Button
          variant="outline"
          onClick={() => router.push("/proposal-masuk")}
        >
          Kembali
        </Button>
      </div>
    );
  }

  const { event, tier, status } = pitch;
  const isAccepted = status === "ACCEPTED";
  const isPending = status === "PENDING";
  const isRejected = status === "REJECTED";

  const maskEmail = (email: string) => {
    if (!email) return "";
    const [name, domain] = email.split("@");
    return `${name.charAt(0)}********@${domain}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="bg-white border-b sticky top-0 z-20 px-4 sm:px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-extrabold text-gray-900 mr-2">
            Proposal Card
          </h1>
          <div className="hidden sm:flex items-center text-xs text-gray-400 font-medium">
            <span
              className="hover:text-blue-600 cursor-pointer"
              onClick={() => router.push("/dashboard")}
            >
              Dashboard
            </span>
            <span className="mx-2">&gt;</span>
            <span
              className="hover:text-blue-600 cursor-pointer"
              onClick={() => router.push("/proposal-masuk")}
            >
              Proposal Masuk
            </span>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-900 truncate max-w-[200px]">
              {event.title}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-6 text-gray-500">
          <BellIcon />
          <SettingsIcon />
          <UserCircleIcon />
        </div>
      </div>

      {/* Action Header bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/proposal-masuk")}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2 bg-white text-gray-700 h-9 px-4 shadow-sm border-gray-200 hover:bg-gray-50"
          >
            <Bookmark className="w-4 h-4" /> Simpan
          </Button>
          <Button
            variant="outline"
            className="gap-2 bg-white text-gray-700 h-9 px-4 shadow-sm border-gray-200 hover:bg-gray-50"
          >
            <Share2 className="w-4 h-4" /> Bagikan
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Event details */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm w-full">
          {/* Banner Hero Card */}
          <div className="relative h-[200px] sm:h-[320px] w-full bg-slate-900">
            {event.bannerUrl ? (
              <Image
                src={event.bannerUrl}
                alt="Event Banner"
                fill
                className="object-cover opacity-80 mix-blend-overlay"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900 via-blue-900 to-slate-950" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
              <div className="flex gap-2 mb-3">
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none tracking-wide text-[10px] font-bold px-2.5 py-1">
                  {event.category || "CONFERENCE"}
                </Badge>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm tracking-wide text-[10px] font-bold px-2.5 py-1">
                  {event.city?.toUpperCase() || "JAKARTA"}, ID
                </Badge>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-md">
                {event.title}
              </h2>
            </div>
          </div>

          <div className="p-4 sm:p-8 space-y-8 sm:space-y-12">
            {/* Section 01: Tentang Event */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  01
                </span>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Tentang Event
                </h3>
              </div>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {event.description || "Deskripsi lengkap event tidak tersedia."}
              </div>
            </section>

            {/* Section 02: Target Audiens */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  02
                </span>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Target Audiens
                </h3>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                <div className="w-full p-4 sm:p-5 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Demografi Utama
                  </h4>

                  <div className="space-y-3.5">
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                        <span>
                          Usia {event.audienceAgeMin || 18}-
                          {event.audienceAgeMax || 45}
                        </span>
                        <span>72%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: "72%" }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                        <span>Jabatan Managerial+</span>
                        <span>58%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: "58%" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full p-4 sm:p-5 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Industri Dominan
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {event.audienceInterests?.length > 0 ? (
                      event.audienceInterests.map((interest) => (
                        <Badge
                          key={interest}
                          variant="secondary"
                          className="bg-white border text-gray-600 hover:bg-gray-100 font-semibold text-xs px-3 py-1"
                        >
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <>
                        <Badge
                          variant="secondary"
                          className="bg-white border text-gray-600 font-semibold text-xs px-3 py-1"
                        >
                          Fintech
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-white border text-gray-600 font-semibold text-xs px-3 py-1"
                        >
                          SaaS
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-white border text-gray-600 font-semibold text-xs px-3 py-1"
                        >
                          Retail Tech
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-white border text-gray-600 font-semibold text-xs px-3 py-1"
                        >
                          Logistik
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-white border text-gray-600 font-semibold text-xs px-3 py-1"
                        >
                          Investment
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Hashtag list */}
              <div className="flex flex-wrap gap-2.5">
                {[
                  "#Innovation",
                  "#B2BNetworking",
                  "#FutureTech",
                  "#ScaleUp",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-bold text-blue-600 border border-blue-100 bg-blue-50/50 hover:bg-blue-50 px-3 py-1.5 rounded-full cursor-pointer transition"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            {/* Section 03: Paket Sponsorship */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  03
                </span>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Paket Sponsorship
                </h3>
              </div>

              {/* Comparative Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white w-full">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-4 w-1/3">Benefit</th>
                        {event.tiers?.map((t) => (
                          <th
                            key={t.id}
                            className={`p-4 text-center ${t.id === pitch.tierId ? "bg-blue-50/80 text-blue-700 font-extrabold" : "text-gray-700"}`}
                          >
                            {t.name.toUpperCase()}
                          </th>
                        ))}
                        {(!event.tiers || event.tiers.length === 0) && (
                          <>
                            <th className="p-4 text-center">Gold</th>
                            <th className="p-4 text-center bg-blue-50/80 text-blue-700 font-extrabold">
                              Platinum
                            </th>
                            <th className="p-4 text-center">Diamond</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {/* Space Row */}
                      <tr className="hover:bg-gray-50/40">
                        <td className="p-4 font-semibold text-gray-600">
                          Booth Space
                        </td>
                        {event.tiers?.map((t) => (
                          <td
                            key={t.id}
                            className={`p-4 text-center ${t.id === pitch.tierId ? "bg-blue-50/40 text-blue-600 font-bold" : "text-gray-500"}`}
                          >
                            {t.name.toLowerCase().includes("gold")
                              ? "9 sqm"
                              : t.name.toLowerCase().includes("platinum")
                                ? "18 sqm"
                                : "36 sqm"}
                          </td>
                        ))}
                        {(!event.tiers || event.tiers.length === 0) && (
                          <>
                            <td className="p-4 text-center text-gray-500">
                              9 sqm
                            </td>
                            <td className="p-4 text-center bg-blue-50/40 text-blue-600 font-bold">
                              18 sqm
                            </td>
                            <td className="p-4 text-center text-gray-500">
                              36 sqm
                            </td>
                          </>
                        )}
                      </tr>
                      {/* Placement Row */}
                      <tr className="hover:bg-gray-50/40">
                        <td className="p-4 font-semibold text-gray-600">
                          Placement
                        </td>
                        {event.tiers?.map((t) => (
                          <td
                            key={t.id}
                            className={`p-4 text-center ${t.id === pitch.tierId ? "bg-blue-50/40 text-blue-600 font-bold" : "text-gray-500"}`}
                          >
                            {t.name.toLowerCase().includes("gold")
                              ? "Medium"
                              : t.name.toLowerCase().includes("platinum")
                                ? "Large + Banner"
                                : "Premium Placement"}
                          </td>
                        ))}
                        {(!event.tiers || event.tiers.length === 0) && (
                          <>
                            <td className="p-4 text-center text-gray-500">
                              Medium
                            </td>
                            <td className="p-4 text-center bg-blue-50/40 text-blue-600 font-bold">
                              Large + Banner
                            </td>
                            <td className="p-4 text-center text-gray-500">
                              Premium Placement
                            </td>
                          </>
                        )}
                      </tr>
                      {/* Mentions Row */}
                      <tr className="hover:bg-gray-50/40">
                        <td className="p-4 font-semibold text-gray-600">
                          Mentions
                        </td>
                        {event.tiers?.map((t) => (
                          <td
                            key={t.id}
                            className={`p-4 text-center ${t.id === pitch.tierId ? "bg-blue-50/40 text-blue-600 font-bold" : "text-gray-500"}`}
                          >
                            {t.name.toLowerCase().includes("gold")
                              ? "2x Daily"
                              : t.name.toLowerCase().includes("platinum")
                                ? "5x Daily"
                                : "Unlimited"}
                          </td>
                        ))}
                        {(!event.tiers || event.tiers.length === 0) && (
                          <>
                            <td className="p-4 text-center text-gray-500">
                              2x Daily
                            </td>
                            <td className="p-4 text-center bg-blue-50/40 text-blue-600 font-bold">
                              5x Daily
                            </td>
                            <td className="p-4 text-center text-gray-500">
                              Unlimited
                            </td>
                          </>
                        )}
                      </tr>
                      {/* Price Row */}
                      <tr className="hover:bg-gray-50/40 font-semibold">
                        <td className="p-4 text-gray-600">Investment</td>
                        {event.tiers?.map((t) => (
                          <td
                            key={t.id}
                            className={`p-4 text-center ${t.id === pitch.tierId ? "bg-blue-50/50 text-blue-700 font-extrabold" : "text-gray-800"}`}
                          >
                            {formatRupiah(t.price)}
                          </td>
                        ))}
                        {(!event.tiers || event.tiers.length === 0) && (
                          <>
                            <td className="p-4 text-center text-gray-800">
                              IDR 25jt
                            </td>
                            <td className="p-4 text-center bg-blue-50/50 text-blue-700 font-extrabold">
                              IDR 75jt
                            </td>
                            <td className="p-4 text-center text-gray-800">
                              IDR 150jt
                            </td>
                          </>
                        )}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 04: Penyelenggara */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  04
                </span>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Penyelenggara
                </h3>
              </div>

              <div className="border border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4 shadow-sm bg-white hover:shadow-md transition">
                <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-150 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <User className="h-8 w-8 text-gray-400" />
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-gray-900 leading-tight">
                      {event.eoProfile?.organizationName || "Nexus Collective"}
                    </h4>
                    {/* <span
                      onClick={() =>
                        router.push(`/cari-sponsor?focus=${event.eoProfile.id}`)
                      }
                      className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Lihat Profil
                    </span> */}
                  </div>

                  <p className="text-xs text-gray-400 font-medium">
                    Top-Tier Tech Event Organizer since 2015
                  </p>

                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                      Verified Organizer
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                      12 Successful Events
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Right Column: Interaction panel */}
        <div className="w-full lg:w-[400px] shrink-0 space-y-6">
          <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
            {/* Budget */}
            <div className="mb-6 border-b pb-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Budget Range
              </p>
              <h2 className="text-3xl font-extrabold text-blue-600 tracking-tight">
                {formatRupiah(tier.price)}
              </h2>
            </div>

            {/* Locked Contact Card */}
            <div
              className={`p-4 rounded-xl border relative overflow-hidden mb-6 transition-all duration-300 ${isAccepted ? "bg-green-50/50 border-green-200" : "bg-gray-50 border-gray-200 border-dashed"}`}
            >
              <div className="flex justify-between items-center mb-3.5">
                <span className="text-[10px] font-extrabold text-gray-700 uppercase tracking-wider">
                  Kontak Penyelenggara
                </span>
                {isAccepted ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-green-600" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-400" />
                )}
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone
                    className={`w-4 h-4 ${isAccepted ? "text-green-600" : "text-gray-400"}`}
                  />
                  <span
                    className={
                      isAccepted
                        ? "text-gray-900 font-bold"
                        : "text-gray-400 filter blur-[3.5px] select-none"
                    }
                  >
                    {event.eoProfile?.phoneNumber || "+62 812-3456-7890"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Mail
                    className={`w-4 h-4 ${isAccepted ? "text-green-600" : "text-gray-400"}`}
                  />
                  <span
                    className={
                      isAccepted
                        ? "text-gray-900 font-bold"
                        : "text-gray-400 filter blur-[3.5px] select-none"
                    }
                  >
                    {isAccepted
                      ? event.eoProfile?.user?.email || "tes@gmail.com"
                      : maskEmail(
                          event.eoProfile?.user?.email || "tes@gmail.com",
                        )}
                  </span>
                </div>
              </div>

              {!isAccepted && isPending && (
                <Button
                  onClick={() => setShowAcceptDialog(true)}
                  disabled={isActionLoading}
                  className="w-full bg-[#4BB543] hover:bg-[#3e9c36] text-white font-bold py-5 shadow-sm rounded-lg"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Setujui & Buka
                  Kontak
                </Button>
              )}
              {isRejected && (
                <div className="w-full bg-red-50 text-red-700 border border-red-100 font-bold py-3 rounded-lg flex items-center justify-center text-xs">
                  <XCircle className="w-4.5 h-4.5 mr-2 text-red-600" /> Proposal
                  Ditolak
                </div>
              )}
            </div>

            {/* Message Box */}
            {pitch.message && (
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 mb-6">
                <p className="text-xs text-gray-600 italic leading-relaxed whitespace-pre-line">
                  &quot;{pitch.message}&quot;
                </p>
              </div>
            )}

            {/* Bottom Actions grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(true)}
                disabled={!isPending || isActionLoading}
                className="border-gray-200 text-gray-600 font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 py-5 rounded-lg text-xs"
              >
                Tolak Proposal
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="border-gray-200 text-gray-700 font-bold hover:bg-gray-50 py-5 rounded-lg text-xs"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-gray-500" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Unduh Proposal
              </Button>
            </div>

            {/* <Button
              onClick={() =>
                router.push(`/cari-sponsor?focus=${event.eoProfile.id}`)
              }
              className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-blue-600 font-bold py-5 rounded-lg shadow-sm transition h-auto text-xs"
            >
              Lihat Profil
            </Button> */}
          </Card>

          {/* Upgrade banner panel */}
          <div className="bg-gray-100 border border-gray-200 rounded-2xl p-5 space-y-4 shadow-inner">
            <p className="text-xs text-gray-600 leading-relaxed font-bold">
              Lengkapi data profil Anda untuk meningkatkan akurasi matching
              proposal hingga 15%.
            </p>
            <Button className="w-full bg-[#1e2c7a] hover:bg-[#131b54] text-white font-bold text-xs py-2.5 h-auto rounded-lg shadow-sm">
              Upgrade Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Accept Dialog */}
      <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Setujui Proposal</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menyetujui proposal ini? Anda akan
              mendapatkan akses ke kontak penyelenggara dan dapat berdiskusi
              lebih lanjut.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAccept}
              disabled={isActionLoading}
              className="bg-[#4BB543] hover:bg-[#3d9636] text-white"
            >
              {isActionLoading ? "Menyetujui..." : "Setujui"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tolak Proposal</AlertDialogTitle>
            <AlertDialogDescription>
              Berikan alasan mengapa Anda menolak proposal ini. Alasan ini akan
              dikirimkan kepada penyelenggara event.
            </AlertDialogDescription>
            <div className="mt-4">
              <textarea
                className="w-full min-h-[100px] p-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tulis alasan penolakan..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setRejectReason("");
                setShowRejectDialog(false);
              }}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isActionLoading || !rejectReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isActionLoading ? "Menolak..." : "Tolak"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Simple icons for top right bar
const BellIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);
const SettingsIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);
const UserCircleIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
