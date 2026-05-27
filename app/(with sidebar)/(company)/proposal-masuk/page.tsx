"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Lock,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Download,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { apiCall } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface PitchListResponse {
  id: string;
  eventId: string;
  companyProfileId: string;
  tierId: string;
  status: string;
  initiatedBy: string;
  message: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    slug: string;
    category: string;
    startDate: string;
    endDate: string;
    city: string;
    expectedAttendees: number;
    eoProfile: {
      id: string;
      organizationName: string;
      campus: string;
    };
  };
  tier: {
    name: string;
    price: number;
  };
}

interface PitchDetailResponse extends PitchListResponse {
  event: PitchListResponse["event"] & {
    eoProfile: {
      phoneNumber: string;
      user: {
        email: string;
      };
    };
  };
}

export default function ProposalMasuk() {
  const router = useRouter();
  const [pitches, setPitches] = useState<PitchListResponse[]>([]);
  const [selectedPitchId, setSelectedPitchId] = useState<string | null>(null);
  const [pitchDetail, setPitchDetail] = useState<PitchDetailResponse | null>(
    null,
  );
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState("Semua");

  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const fetchPitches = async () => {
    try {
      setLoadingList(true);
      const res = await apiCall<{ data: PitchListResponse[] }>(
        "/pitches/incoming",
        { requireAuth: true },
      );
      setPitches(res.data || []);
      if (res.data?.length > 0) {
        setSelectedPitchId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };
  useEffect(() => {
    fetchPitches();
  }, []);

  const fetchPitchDetail = async (id: string) => {
    try {
      setLoadingDetail(true);
      const res = await apiCall<{ data: PitchDetailResponse }>(
        `/pitches/incoming/${id}`,
        { requireAuth: true },
      );
      setPitchDetail(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (selectedPitchId) {
      fetchPitchDetail(selectedPitchId);
    } else {
      setPitchDetail(null);
    }
  }, [selectedPitchId]);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateRange = (start: string, end: string) => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    if (d1.getTime() === d2.getTime()) {
      return d1.toLocaleDateString("id-ID", options);
    }
    return `${d1.getDate()}-${d2.toLocaleDateString("id-ID", options)}`;
  };

  const maskEmail = (email: string) => {
    if (!email) return "";
    const [name, domain] = email.split("@");
    return `${name.charAt(0)}********@${domain}`;
  };

  const filteredPitches = pitches.filter((pitch) => {
    if (activeTab === "Semua") return true;
    if (activeTab === "Baru") return pitch.status === "PENDING";
    if (activeTab === "Ditinjau") return pitch.status === "UNDER_REVIEW";
    if (activeTab === "Setuju") return pitch.status === "ACCEPTED";
    if (activeTab === "Ditolak") return pitch.status === "REJECTED";
    return true;
  });

  const pendingCount = pitches.filter((p) => p.status === "PENDING").length;

  const handleAccept = async () => {
    try {
      if (!pitchDetail) return;
      await apiCall(`/pitches/incoming/${pitchDetail.id}/accept`, {
        method: "POST",
        requireAuth: true,
      });
      setShowAcceptDialog(false);
      fetchPitches();
      fetchPitchDetail(pitchDetail.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async () => {
    try {
      if (!pitchDetail) return;
      await apiCall(`/pitches/incoming/${pitchDetail.id}/reject`, {
        method: "POST",
        requireAuth: true,
        body: JSON.stringify({ reason: rejectReason }),
      });
      setShowRejectDialog(false);
      setRejectReason("");
      fetchPitches();
      fetchPitchDetail(pitchDetail.id);
    } catch (e) {
      console.error(e);
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadProposal = async () => {
    if (!pitchDetail) return;
    const slug = pitchDetail.event.slug;
    if (!slug) {
      alert("Slug event tidak ditemukan.");
      return;
    }

    setIsDownloading(true);
    try {
      const res = await apiCall<{
        data: {
          title: string;
          proposal: {
            source: string;
            fileUrl: string | null;
            content?: string | null;
          } | null;
        };
      }>(`/catalog/events/${slug}`, { requireAuth: false });

      const eventData = res.data;
      const proposal = eventData?.proposal;

      if (!proposal) {
        alert("Proposal tidak tersedia untuk event ini.");
        return;
      }

      if (proposal.source === "GENERATED" && proposal.content) {
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        document.body.appendChild(iframe);

        let htmlContent = proposal.content;
        try {
          if (htmlContent.startsWith("{")) {
            const parsed = JSON.parse(htmlContent);
            const listItems = (items: string[]) =>
              items.map((i) => `<li>${i}</li>`).join("");
            htmlContent = `
              <h2>Executive Summary</h2><p>${parsed.executiveSummary}</p>
              <h2>Latar Belakang Event</h2><p>${parsed.eventBackground}</p>
              <h2>Tujuan</h2><ul>${listItems(parsed.objectives)}</ul>
              <h2>Target Audiens</h2><p>${parsed.targetAudience}</p>
              <h2>Mengapa Event Ini?</h2><p>${parsed.whyThisEvent}</p>
              <h2>Manfaat Sponsorship</h2><ul>${listItems(parsed.sponsorshipBenefits)}</ul>
              <h2>Call to Action</h2><p>${parsed.callToAction}</p>
            `;
          }
        } catch (e) {}

        const cleanTitle = eventData.title.replace(/[^a-zA-Z0-9]/g, "_");
        const doc = iframe.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(`
            <html>
              <head>
                <title>Proposal_${cleanTitle}</title>
                <style>
                  body { 
                    font-family: 'Segoe UI', system-ui, sans-serif; 
                    line-height: 1.6; 
                    padding: 40px; 
                    color: #1a1a1a; 
                    max-width: 800px;
                    margin: 0 auto;
                  }
                  h1 { color: #003EC7; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 30px; }
                  h2 { color: #111827; margin-top: 32px; margin-bottom: 16px; font-size: 1.5rem; }
                  p { margin-bottom: 16px; text-align: justify; }
                  ul, ol { margin-bottom: 24px; padding-left: 24px; }
                  li { margin-bottom: 8px; }
                  @media print {
                    body { padding: 0; }
                  }
                </style>
              </head>
              <body>
                <h1>Proposal: ${eventData.title}</h1>
                ${htmlContent}
              </body>
            </html>
          `);
          doc.close();

          iframe.contentWindow?.focus();
          setTimeout(() => {
            iframe.contentWindow?.print();
            setTimeout(() => document.body.removeChild(iframe), 1000);
          }, 500);
        }
        return;
      }

      if (!proposal.fileUrl) {
        alert("File Proposal PDF belum tersedia untuk event ini.");
        return;
      }

      try {
        const response = await fetch(proposal.fileUrl);
        if (!response.ok) throw new Error("Network response was not ok");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const cleanTitle = eventData.title.replace(/[^a-zA-Z0-9]/g, "_");
        a.download = `Proposal_${cleanTitle}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.warn("Direct download failed, opening in new tab", error);
        window.open(proposal.fileUrl, "_blank");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal mengunduh proposal.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:py-8 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Proposal Masuk
          </h1>
          <p className="text-gray-600 text-sm mb-6">
            {pitches.length} proposal •{" "}
            <span className="text-blue-600 font-semibold">
              {pendingCount} belum ditinjau
            </span>
          </p>

          {/* Tabs */}
          <div className="flex gap-4 sm:gap-6 border-b border-gray-200 overflow-x-auto whitespace-nowrap pb-1">
            {["Semua", "Baru", "Ditinjau", "Setuju", "Ditolak"].map((tab) => {
              const count =
                tab === "Semua"
                  ? pitches.length
                  : tab === "Baru"
                    ? pendingCount
                    : tab === "Ditinjau"
                      ? pitches.filter((p) => p.status === "UNDER_REVIEW")
                          .length
                      : tab === "Setuju"
                        ? pitches.filter((p) => p.status === "ACCEPTED").length
                        : pitches.filter((p) => p.status === "REJECTED").length;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-medium shrink-0 ${
                    activeTab === tab
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel: List */}
          <div className="flex-1 min-w-0 space-y-4">
            {loadingList ? (
              <div className="text-center py-10 text-gray-500">Memuat...</div>
            ) : filteredPitches.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                Tidak ada proposal di kategori ini.
              </div>
            ) : (
              filteredPitches.map((pitch) => (
                <div
                  key={pitch.id}
                  onClick={() => setSelectedPitchId(pitch.id)}
                  className={`bg-white rounded-xl border p-4 cursor-pointer transition flex flex-col sm:flex-row items-stretch sm:items-start gap-4 ${
                    selectedPitchId === pitch.id
                      ? "border-blue-500 shadow-sm ring-1 ring-blue-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                      <span className="text-gray-400 font-bold text-lg">
                        {pitch.event.eoProfile.organizationName
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 text-base leading-snug">
                        {pitch.event.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3 truncate">
                        {pitch.event.eoProfile.organizationName} •{" "}
                        {formatDateRange(
                          pitch.event.startDate,
                          pitch.event.endDate,
                        )}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        {pitch.status !== "ACCEPTED" && (
                          <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 font-normal">
                            <Lock className="w-3 h-3 mr-1 inline" /> LOCKED
                          </Badge>
                        )}

                        <span className="text-sm text-gray-600 font-medium">
                          {formatRupiah(pitch.tier.price)} Target
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs py-1">
                      ✨ AI Match 94%
                    </Badge>
                    {selectedPitchId === pitch.id && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/proposal-masuk/${pitch.id}`);
                        }}
                        className="text-xs font-bold text-blue-600 hover:underline cursor-pointer pt-1 whitespace-nowrap"
                      >
                        Lihat Detail &rarr;
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Panel: Detail */}
          <div className="w-full lg:w-[400px] shrink-0">
            {loadingDetail || (loadingList && pitches.length > 0) ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500">
                Memuat detail...
              </div>
            ) : pitchDetail ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm lg:sticky lg:top-6">
                {/* Banner Placeholder */}
                <div className="h-32 bg-slate-800 relative p-4 flex items-end">
                  <h2 className="text-white text-xl font-bold z-10 relative">
                    {pitchDetail.event.title}
                  </h2>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                </div>

                <div className="p-6">
                  {/* Contact Box */}
                  <div className="border border-dashed border-gray-300 rounded-lg p-4 mb-6 bg-gray-50 relative">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-xs font-bold text-gray-500 tracking-wider">
                        KONTAK PENYELENGGARA
                      </h4>
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="space-y-2 mb-4">
                      {pitchDetail.status !== "ACCEPTED" && (
                        <>
                          <div className="flex items-center text-sm text-gray-600 gap-3">
                            <Phone className="w-4 h-4" />
                            <span>+62 812-XXXX-XXXX</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 gap-3">
                            <Mail className="w-4 h-4" />
                            <span>
                              {maskEmail(
                                pitchDetail.event.eoProfile.user?.email || "",
                              )}
                            </span>
                          </div>
                        </>
                      )}
                      {pitchDetail.status === "ACCEPTED" && (
                        <>
                          <div className="flex items-center text-sm text-gray-600 gap-3">
                            <Phone className="w-4 h-4" />
                            <span>
                              {pitchDetail.event.eoProfile.phoneNumber}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 gap-3">
                            <Mail className="w-4 h-4" />
                            <span>
                              {pitchDetail.event.eoProfile.user?.email || ""}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    {pitchDetail.status !== "ACCEPTED" &&
                      pitchDetail.status !== "REJECTED" &&
                      pitchDetail.status !== "CANCELLED" && (
                        <Button
                          className="w-full bg-[#5FB285] hover:bg-[#4d946d] text-white"
                          onClick={() => setShowAcceptDialog(true)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Setujui & Buka Kontak
                        </Button>
                      )}
                  </div>

                  {/* Message Box */}
                  <div className="bg-[#F8F9FA] rounded-lg p-4 border border-blue-100 text-sm text-gray-600 italic mb-6">
                    &quot;{pitchDetail.message}&quot;
                  </div>

                  {/* Detail Info */}
                  <div className="space-y-4 text-sm border-b border-gray-100 pb-6 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Organisasi</span>
                      <span className="font-semibold text-gray-900">
                        {pitchDetail.event.eoProfile.organizationName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Estimasi Audiens</span>
                      <span className="font-semibold text-gray-900">
                        {pitchDetail.event.expectedAttendees.toLocaleString(
                          "id-ID",
                        )}
                        +
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Kategori</span>
                      <div className="flex gap-2">
                        <Badge
                          variant="secondary"
                          className="font-normal text-gray-600"
                        >
                          {pitchDetail.event.category}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button
                    onClick={() =>
                      router.push(`/proposal-masuk/${pitchDetail.id}`)
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 mb-3 shadow-sm rounded-lg"
                  >
                    Lihat Detail
                  </Button>

                  <div className="flex gap-3 mb-6">
                    <Button
                      variant="outline"
                      className={`flex-1 text-gray-600 ${
                        pitchDetail.status === "ACCEPTED" ||
                        pitchDetail.status === "REJECTED" ||
                        pitchDetail.status === "CANCELLED"
                          ? "hidden"
                          : ""
                      }`}
                      onClick={() => setShowRejectDialog(true)}
                    >
                      Tolak Proposal
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-gray-600 gap-2"
                      onClick={handleDownloadProposal}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Unduh...
                        </>
                      ) : (
                        <>Unduh Proposal</>
                      )}
                    </Button>
                  </div>
                </div>

                {/* AI Insight */}
                {/* <div className="bg-[#B94B2E] text-white p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4" />
                    <span className="text-xs font-bold tracking-wider">
                      AI INSIGHT
                    </span>
                  </div>
                  <p className="text-sm text-white/90">
                    Proposal ini memiliki skor keterlibatan media sosial yang
                    tinggi di kalangan mahasiswa Jabodetabek.
                  </p>
                </div> */}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500">
                Pilih proposal untuk melihat detail
              </div>
            )}
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
              className="bg-[#5FB285] hover:bg-[#4d946d] text-white"
            >
              Setujui
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
            <AlertDialogCancel onClick={() => setRejectReason("")}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Tolak
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
