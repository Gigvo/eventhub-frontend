"use client";

import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Upload,
  Download,
  MoreVertical,
  AlertCircle,
  FileText,
  CloudUpload,
  Sparkles,
  Filter,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/api-client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Calendar, MapPin, Users, ImageIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProposalTerbaru from "@/components/proposal-terbaru";

interface EventTier {
  id: string;
  name: string;
  price: number;
  benefits: string[];
  maxSlots: number;
}

interface MyEvent {
  id: string;
  slug: string;
  title: string;
  category: string;
  bannerUrl: string | null;
  startDate: string;
  endDate: string;
  city: string;
  venue: string;
  expectedAttendees: number;
  status: string;
  tiers: EventTier[];
  proposal: {
    id: string;
    source: string;
    aiScore: number | null;
    aiFeedback: string | null;
    fileUrl: string | null;
  } | null;
  _count: { offers: number };
}

export default function ProposalSmartReview() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // Controlled tab for programmatic switching from event-kamu CTA
  const [activeTab, setActiveTab] = useState("terbaru");

  // Lazy initialize eventId and eventName from localStorage or API
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventName, setEventName] = useState("Event");
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myEvents, setMyEvents] = useState<MyEvent[]>([]);

  // Proposal analysis fetched directly from /events/{id}/proposal — not from /events/my
  const [proposalAnalysis, setProposalAnalysis] = useState<{
    id: string;
    source: string;
    aiScore: number | null;
    aiFeedback: string | null;
    fileUrl: string | null;
    content: string | null;
  } | null>(null);
  const [isFetchingAnalysis, setIsFetchingAnalysis] = useState(false);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [aiOptions, setAiOptions] = useState({
    proposalScore: true,
    identifyIssues: false,
    matchEventData: true,
  });

  // Helper function to show notification
  const showNotification = (
    type: "success" | "error",
    message: string,
    duration = 4000,
  ) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), duration);
  };

  useEffect(() => {
    async function loadEventData() {
      try {
        const response = await apiCall<{ data: MyEvent[] }>("/events/my", {});
        if (response?.data && Array.isArray(response.data)) {
          setMyEvents(response.data);

          // 1. Check URL parameters first (passed from katalog-event-eo)
          if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const urlId = params.get("id");
            const urlTab = params.get("tab");

            if (urlTab) setActiveTab(urlTab);

            if (urlId) {
              const eventFromUrl = response.data.find((e) => e.id === urlId);
              if (eventFromUrl) {
                setEventId(eventFromUrl.id);
                setEventName(eventFromUrl.title);
                return;
              }
            }
          }

          // 2. Fallback to localStorage
          const savedStep3Data = localStorage.getItem("buatEventStep3Data");
          if (savedStep3Data) {
            const data = JSON.parse(savedStep3Data);
            if (data.eventId) {
              setEventId(data.eventId);
              setEventName(data.eventName || "Event");
              return;
            }
          }

          // 3. Fallback to latest event
          const latestEvent = response.data[0];
          if (latestEvent) {
            setEventId(latestEvent.id);
            setEventName(latestEvent.title || "Event");
          }
        }
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setIsLoadingEvents(false);
      }
    }

    loadEventData();
  }, []);

  async function fetchProposalAnalysis(id: string) {
    setIsFetchingAnalysis(true);
    try {
      const storageRef = ref(storage, `events/${id}/proposal.pdf`);
      const fileUrl = await getDownloadURL(storageRef);

      const res = await apiCall<{
        success: boolean;
        data: {
          id: string;
          source: string;
          aiScore: number | null;
          aiFeedback: string | null;
          fileUrl: string | null;
          content: string | null;
        };
      }>(`/events/${id}/proposal`, {
        method: "POST",
        body: JSON.stringify({ source: "UPLOAD", fileUrl }),
      });
      console.log(res);

      if (res?.data) setProposalAnalysis(res.data);
    } catch {
      // File not in Firebase yet (no proposal uploaded) — clear state
      setProposalAnalysis(null);
    } finally {
      setIsFetchingAnalysis(false);
    }
  }

  useEffect(() => {
    if (!eventId) {
      setProposalAnalysis(null);
      return;
    }
    const activeEvent = myEvents.find((e) => e.id === eventId);
    const proposal = activeEvent?.proposal;
    if (!proposal) {
      setProposalAnalysis(null);
    } else if (proposal.source === "UPLOAD") {
      fetchProposalAnalysis(eventId);
    } else {
      setProposalAnalysis(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, myEvents]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !eventId) {
      showNotification("error", "File atau Event ID tidak ditemukan.");
      return;
    }

    const file = files[0];

    // Validate file type — PDF only (per UPLOAD_GUIDE.md)
    if (file.type !== "application/pdf") {
      showNotification("error", "File harus berupa PDF.");
      return;
    }

    // Validate file size (max 10MB per UPLOAD_GUIDE.md)
    if (file.size > 10 * 1024 * 1024) {
      showNotification("error", "Ukuran file maksimal 10MB.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Step 1: Upload file to Firebase Storage
      // Path: events/{eventId}/proposal.pdf (per UPLOAD_GUIDE.md)
      const path = `events/${eventId}/proposal.pdf`;
      const storageRef = ref(storage, path);

      await uploadBytes(storageRef, file);

      // Step 2: Get download URL
      const fileUrl = await getDownloadURL(storageRef);
      console.log("response firebase: ", fileUrl);

      const responseSet = await apiCall<{
        success: boolean;
        data: {
          id: string;
          source: string;
          aiScore: number | null;
          aiFeedback: string | null;
          fileUrl: string;
          content: string | null;
        };
      }>(`/events/${eventId}/proposal`, {
        method: "POST",
        body: JSON.stringify({
          source: "UPLOAD",
          fileUrl: fileUrl,
        }),
      });

      // Immediately show what the API returned (aiScore may be null if AI is still processing)
      if (responseSet?.data) setProposalAnalysis(responseSet.data);

      showNotification(
        "success",
        "Proposal berhasil diupload! Analisis AI sedang berjalan...",
      );
      setIsUploadDialogOpen(false);

      // Re-fetch from Firebase after 5s to pick up completed AI score
      if (eventId) setTimeout(() => fetchProposalAnalysis(eventId), 5000);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal mengupload proposal";
      showNotification("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Loading State */}
      {isLoadingEvents && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-gray-600">Memuat event Anda...</p>
          </div>
        </div>
      )}

      {!isLoadingEvents && (
        <>
          {eventId === null ? (
            // No event found - show message
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center max-w-md">
                <div className="mb-4 text-6xl">📋</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Belum ada event
                </h2>
                <p className="text-gray-600 mb-6">
                  Silakan buat event terlebih dahulu sebelum upload proposal.
                </p>
                <Button
                  onClick={() => router.push("/buat-event")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                >
                  Buat Event Baru
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Notification Toast */}
              {notification && (
                <div
                  className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                    notification.type === "success"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  <div className="text-xl font-bold">
                    {notification.type === "success" ? "✓" : "⚠"}
                  </div>
                  <p className="font-medium">{notification.message}</p>
                </div>
              )}

              {/* Breadcrumb & Title */}
              <div className="mb-8">
                <div className="text-sm text-gray-600 mb-2">
                  Proposal Smart Review • {eventName}
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {eventName}
                </h1>
              </div>

              {/* Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="mb-8"
              >
                <TabsList className="flex items-center gap-8" variant={"line"}>
                  {/* <TabsTrigger value="event-kamu">Event Kamu</TabsTrigger> */}
                  <TabsTrigger value="terbaru">Proposal Terbaru</TabsTrigger>
                  <TabsTrigger value="smart-review">
                    Proposal Smart Review
                  </TabsTrigger>
                </TabsList>

                {/* <TabsContent value="event-kamu" className="mt-6">
                  <div className="flex gap-2 mb-6">
                    {(["SEMUA", "PUBLISHED", "DRAFT", "SELESAI"] as const).map(
                      (f) => (
                        <button
                          key={f}
                          onClick={() => setEventsFilter(f)}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                            eventsFilter === f
                              ? "bg-[#003EC7] text-white border-[#003EC7]"
                              : "bg-white text-gray-600 border-gray-300 hover:border-[#003EC7] hover:text-[#003EC7]"
                          }`}
                        >
                          {f === "SEMUA"
                            ? "Semua"
                            : f === "PUBLISHED"
                              ? "Aktif"
                              : f === "DRAFT"
                                ? "Draft"
                                : "Selesai"}
                        </button>
                      ),
                    )}
                  </div>

                  {isLoadingEvents ? (
                    <div className="grid grid-cols-3 gap-6">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-gray-100 rounded-xl h-72 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-6">
                      {myEvents
                        .filter(
                          (e) =>
                            eventsFilter === "SEMUA" ||
                            e.status === eventsFilter,
                        )
                        .map((event) => {
                          const statusLabel =
                            event.status === "PUBLISHED"
                              ? "AKTIF"
                              : event.status === "DRAFT"
                                ? "DRAFT"
                                : "SELESAI";
                          const statusColor =
                            event.status === "PUBLISHED"
                              ? "bg-green-500"
                              : event.status === "DRAFT"
                                ? "bg-yellow-500"
                                : "bg-gray-500";
                          const startDate = new Date(event.startDate);
                          const endDate = new Date(event.endDate);
                          const formatDate = (d: Date) =>
                            d.toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            });
                          const maxTierPrice = event.tiers.length
                            ? Math.max(...event.tiers.map((t) => t.price))
                            : null;
                          const formatPrice = (p: number) => {
                            if (p >= 1_000_000)
                              return `IDR ${(p / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
                            if (p >= 1_000)
                              return `IDR ${(p / 1_000).toFixed(0)}K`;
                            return `IDR ${p}`;
                          };
                          

                          return (
                            <div
                              key={event.id}
                              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                            >
                              <div className="relative h-44 bg-gray-100">
                                {event.bannerUrl ? (
                                  <Image
                                    src={event.bannerUrl}
                                    alt={event.title}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-10 h-10 text-gray-300" />
                                  </div>
                                )}
                                <span
                                  className={`absolute top-3 left-3 ${statusColor} text-white text-[10px] font-bold px-2 py-0.5 rounded`}
                                >
                                  {statusLabel}
                                </span>
                              </div>

                              <div className="p-4 flex flex-col flex-1">
                                <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-snug">
                                  {event.title}
                                </h3>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span>
                                    {formatDate(startDate)} –{" "}
                                    {formatDate(endDate)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span>
                                    {event.venue}, {event.city}
                                  </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 mb-4">
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {maxTierPrice
                                        ? formatPrice(maxTierPrice)
                                        : "-"}
                                    </p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                                      Target
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {event.expectedAttendees.toLocaleString(
                                        "id-ID",
                                      )}
                                    </p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                                      Pax
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {event._count.offers}
                                    </p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                                      Sponsor
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-auto pt-3 border-t border-gray-100 text-center">
                                  {(() => {
                                    if (
                                      event.status === "DRAFT" &&
                                      !event.proposal
                                    ) {
                                      return (
                                        <button
                                          onClick={() => {
                                            localStorage.setItem(
                                              "buatEventStep3Data",
                                              JSON.stringify({
                                                eventId: event.id,
                                                eventName: event.title,
                                              }),
                                            );
                                            router.push(
                                              `/buat-event?id=${event.id}&step=3`,
                                            );
                                          }}
                                          className="text-sm font-semibold text-[#003EC7] hover:underline"
                                        >
                                          Lanjutkan Draft
                                        </button>
                                      );
                                    }
                                    if (
                                      event.status === "DRAFT" &&
                                      event.proposal
                                    ) {
                                      return (
                                        <button
                                          onClick={() => {
                                            setEventId(event.id);
                                            setEventName(event.title);
                                            setActiveTab("smart-review");
                                          }}
                                          className="text-sm font-semibold text-[#003EC7] hover:underline"
                                        >
                                          Edit Proposal
                                        </button>
                                      );
                                    }
                                    if (event.status === "PUBLISHED") {
                                      return (
                                        <button
                                          onClick={() => {
                                            setEventId(event.id);
                                            setEventName(event.title);
                                            setActiveTab("smart-review");
                                          }}
                                          className="text-sm font-semibold text-[#003EC7] hover:underline"
                                        >
                                          Kelola Event
                                        </button>
                                      );
                                    }
                                    return (
                                      <button
                                        onClick={() =>
                                          router.push("/cari-sponsor")
                                        }
                                        className="text-sm font-semibold text-[#003EC7] hover:underline"
                                      >
                                        Lihat Laporan
                                      </button>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                      {myEvents.filter(
                        (e) =>
                          eventsFilter === "SEMUA" || e.status === eventsFilter,
                      ).length === 0 && (
                        <div className="col-span-3 py-16 text-center text-gray-400">
                          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                          <p className="text-sm">
                            Belum ada event untuk kategori ini.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent> */}

                <TabsContent value="smart-review" className="mt-6">
                  {/* Guard: no event selected yet */}
                  {!eventId ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <div className="text-5xl mb-4">📋</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Belum ada event dipilih
                      </h3>
                      <p className="text-sm text-gray-500 mb-6 max-w-sm">
                        Buka tab <strong>Event Kamu</strong> dan klik tombol
                        pada salah satu event untuk membuka Smart Review-nya.
                      </p>
                      <button
                        onClick={() => setActiveTab("event-kamu")}
                        className="px-5 py-2 bg-[#003EC7] text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                      >
                        Lihat Event Kamu
                      </button>
                    </div>
                  ) : (
                    (() => {
                      const activeEvent = myEvents.find(
                        (e) => e.id === eventId,
                      );
                      const eventProposal = activeEvent?.proposal ?? null;
                      const tier = activeEvent?.tiers?.[0] ?? null;

                      // For UPLOAD: use proposalAnalysis (fetched via Firebase → POST)
                      // For GENERATED: aiScore is already in /events/my
                      const proposal = eventProposal;
                      const aiScore =
                        eventProposal?.source === "UPLOAD"
                          ? (proposalAnalysis?.aiScore ?? null)
                          : (eventProposal?.aiScore ?? null);

                      return (
                        <div className="grid grid-cols-3 gap-6">
                          {/* Left Column - Proposals */}
                          <div className="col-span-2 space-y-4">
                            <div className="flex items-center justify-between mb-6">
                              <h2 className="text-xl font-semibold text-gray-900">
                                Proposal
                              </h2>
                              <Button
                                className="gap-2 px-4 py-2 bg-[#003EC7]"
                                onClick={() => setIsUploadDialogOpen(true)}
                              >
                                <Upload className="w-4 h-4" />
                                Upload Proposal
                              </Button>
                            </div>

                            {/* Info Banner */}
                            <div className="bg-[#E5E7EB] border border-[#D0E1FB] rounded-lg p-4 flex items-center gap-3">
                              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                              <p className="text-sm text-blue-900">
                                Semua proposal di halaman ini dikurasi untuk{" "}
                                <strong>{eventName}</strong>
                              </p>
                            </div>

                            {/* Proposal Card */}
                            {!proposal ? (
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center text-center">
                                <FileText className="w-8 h-8 text-gray-300 mb-3" />
                                <p className="text-sm text-gray-500 mb-1">
                                  Belum ada proposal
                                </p>
                                <p className="text-xs text-gray-400">
                                  Upload proposal PDF untuk mendapatkan analisis
                                  AI
                                </p>
                              </div>
                            ) : proposal.source === "GENERATED" ? (
                              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 bg-[#DDE1FF4D]">
                                <div className="flex gap-4 items-center">
                                  <div className="flex-shrink-0">
                                    <div className="w-14 h-14 border-4 rounded-full flex items-center justify-center text-[#003EC7] text-xl font-bold border-[#003EC7]">
                                      {proposal.aiScore ?? "–"}
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs font-semibold">
                                        AI GENERATED
                                      </Badge>
                                      <h3 className="font-semibold text-gray-900 text-sm">
                                        Proposal {eventName}
                                      </h3>
                                    </div>
                                    {tier && (
                                      <div className="flex gap-3 text-xs text-[#4B5563]">
                                        <span className="bg-white rounded-[4px] px-2 py-1">
                                          Tier: {tier.name}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            ) : (
                              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex gap-3 flex-1">
                                    <div className="flex-shrink-0 p-4 bg-[#F3F4F6] rounded-[8px] flex items-center justify-center text-[#9CA3AF]">
                                      <FileText className="w-9 h-9" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Badge
                                          variant="outline"
                                          className="text-xs font-semibold bg-gray-50"
                                        >
                                          MANUAL UPLOAD
                                        </Badge>
                                        <h3 className="font-semibold text-gray-900 text-sm">
                                          Proposal {eventName}
                                        </h3>
                                      </div>
                                      <p className="text-xs text-gray-500">
                                        Skor AI:{" "}
                                        <strong>
                                          {proposal.aiScore ?? "–"}
                                        </strong>
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsUploadDialogOpen(true)}
                                    className="flex-shrink-0"
                                  >
                                    Ganti PDF
                                  </Button>
                                </div>
                              </Card>
                            )}

                            {/* Upload Section */}
                            <div
                              onClick={() => setIsUploadDialogOpen(true)}
                              className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center text-center hover:border-gray-400 cursor-pointer transition-colors"
                            >
                              <Upload className="w-8 h-8 text-gray-400 mb-3" />
                              <p className="text-gray-600 text-sm">
                                Upload Proposal Lain
                              </p>
                            </div>
                          </div>

                          {/* Right Column - AI Analysis */}
                          <div className="col-span-1">
                            <Card className="p-6 bg-white sticky top-6">
                              <div className="mb-6 pb-4 border-b">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    🤖 AI ANALYSIS
                                  </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Review untuk: {eventName}
                                </h3>
                              </div>

                              {isFetchingAnalysis ? (
                                <div className="text-center py-8">
                                  <div className="flex items-center justify-center mb-4">
                                    <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-[#003EC7] animate-spin" />
                                  </div>
                                  <p className="text-xs text-gray-400">
                                    Mengambil hasil analisis...
                                  </p>
                                </div>
                              ) : aiScore === null ? (
                                !proposal ? (
                                  // No proposal uploaded yet
                                  <div className="text-center py-8">
                                    <div className="text-4xl mb-3">📊</div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">
                                      Belum ada analisis
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      Upload proposal PDF untuk mendapatkan skor
                                      AI
                                    </p>
                                    <Button
                                      className="mt-4 bg-[#003EC7] hover:bg-blue-700 text-sm"
                                      onClick={() =>
                                        setIsUploadDialogOpen(true)
                                      }
                                    >
                                      Upload Sekarang
                                    </Button>
                                  </div>
                                ) : (
                                  // Proposal uploaded, AI still processing
                                  <div className="text-center py-8">
                                    <div className="flex items-center justify-center mb-4">
                                      <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-[#003EC7] animate-spin" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800 mb-1">
                                      Sedang dianalisis...
                                    </p>
                                    <p className="text-xs text-gray-400 mb-4">
                                      AI sedang membaca dan mengevaluasi
                                      proposal kamu. Ini mungkin memerlukan
                                      beberapa detik.
                                    </p>
                                    {/* <Button
                                      onClick={() => loadEventData()}
                                      className="text-xs text-blue-600 hover:underline"
                                      variant={"ghost"}
                                    >
                                      Refresh hasil →
                                    </Button> */}
                                  </div>
                                )
                              ) : (
                                <>
                                  {/* Overall score ring */}
                                  <div className="flex items-center justify-center mb-6">
                                    <div className="w-20 h-20 rounded-full border-4 border-[#003EC7] flex items-center justify-center">
                                      <span className="text-2xl font-bold text-[#003EC7]">
                                        {aiScore}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Sub-scores (derived from single aiScore) */}
                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                    {[
                                      {
                                        label: "STRUKTUR",
                                        value: Math.min(
                                          100,
                                          Math.round(aiScore * 1.1),
                                        ),
                                      },
                                      {
                                        label: "VISUAL",
                                        value: Math.max(
                                          0,
                                          Math.round(aiScore * 0.9),
                                        ),
                                      },
                                      {
                                        label: "NARASI",
                                        value: Math.min(
                                          100,
                                          Math.round(aiScore * 1.05),
                                        ),
                                      },
                                      {
                                        label: "RELEVANSI",
                                        value: Math.max(
                                          0,
                                          Math.round(aiScore * 0.95),
                                        ),
                                      },
                                    ].map(({ label, value }) => (
                                      <div
                                        key={label}
                                        className="bg-[#F9FAFB] rounded-[4px] p-3"
                                      >
                                        <p className="text-xs font-semibold text-blue-600 mb-1">
                                          {label}
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900">
                                          {value}{" "}
                                          <span className="text-xs text-gray-500">
                                            / 100
                                          </span>
                                        </p>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Score bar */}
                                  <div className="mb-4">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                      <span>Skor Keseluruhan</span>
                                      <span
                                        className={
                                          aiScore >= 70
                                            ? "text-green-600"
                                            : aiScore >= 50
                                              ? "text-yellow-600"
                                              : "text-red-600"
                                        }
                                      >
                                        {aiScore >= 70
                                          ? "Baik"
                                          : aiScore >= 50
                                            ? "Cukup"
                                            : "Perlu Perbaikan"}
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full transition-all ${
                                          aiScore >= 70
                                            ? "bg-green-500"
                                            : aiScore >= 50
                                              ? "bg-yellow-500"
                                              : "bg-red-500"
                                        }`}
                                        style={{ width: `${aiScore}%` }}
                                      />
                                    </div>
                                  </div>

                                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2">
                                    Lihat Analisis Lengkap →
                                  </Button>
                                </>
                              )}
                            </Card>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </TabsContent>

                <TabsContent value="terbaru">
                  <ProposalTerbaru />
                </TabsContent>
              </Tabs>

              {/* Upload Dialog */}
              <Dialog
                open={isUploadDialogOpen}
                onOpenChange={setIsUploadDialogOpen}
              >
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Upload Proposal</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Info Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 mb-0.5">
                          Akan dikaitkan dengan: {eventName}
                        </p>
                      </div>
                    </div>

                    {/* File Upload Area */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:border-gray-400 cursor-pointer transition-colors"
                    >
                      <div className="bg-blue-50 rounded-full p-4 mb-3">
                        <CloudUpload className="w-8 h-8 text-blue-500" />
                      </div>
                      <p className="font-medium text-gray-900 mb-1">
                        Tarik & lepas file di sini
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Mendukung PDF, DOCX hingga 15MB
                      </p>
                      <Button variant="outline" size="sm" className="text-sm">
                        Pilih File dari Komputer
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                      />
                    </div>

                    {/* AI Options */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-[#0052FF]" />
                        OPSI REVIEW AI
                      </h3>

                      {/* Option 1 */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Nilai skor proposal
                          </p>
                          <p className="text-xs text-gray-500">
                            Analisis potensi keberlanjutan sponsor
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setAiOptions((prev) => ({
                              ...prev,
                              proposalScore: !prev.proposalScore,
                            }))
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            aiOptions.proposalScore
                              ? "bg-blue-600"
                              : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              aiOptions.proposalScore
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Option 2 */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Identifikasi masalah
                          </p>
                          <p className="text-xs text-gray-500">
                            Temukan kekurangan data atau inkonsistensi
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setAiOptions((prev) => ({
                              ...prev,
                              identifyIssues: !prev.identifyIssues,
                            }))
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            aiOptions.identifyIssues
                              ? "bg-blue-600"
                              : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              aiOptions.identifyIssues
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Option 3 */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Cocockan data event
                          </p>
                          <p className="text-xs text-gray-500">
                            Verifikasi kesesuaian dengan target sponsor
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setAiOptions((prev) => ({
                              ...prev,
                              matchEventData: !prev.matchEventData,
                            }))
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            aiOptions.matchEventData
                              ? "bg-blue-600"
                              : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              aiOptions.matchEventData
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-3 pt-4">
                    <DialogClose asChild>
                      <Button
                        variant="outline"
                        className=" px-6 py-2"
                        disabled={isSubmitting}
                      >
                        Batal
                      </Button>
                    </DialogClose>
                    <Button
                      disabled={isSubmitting || !eventId}
                      onClick={() => fileInputRef.current?.click()}
                      className=" bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                    >
                      {isSubmitting ? "Mengupload..." : "Upload & Analisis →"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </>
      )}
    </div>
  );
}
