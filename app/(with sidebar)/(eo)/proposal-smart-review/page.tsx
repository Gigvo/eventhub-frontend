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
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/api-client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Calendar, MapPin, Users, ImageIcon } from "lucide-react";

interface EventTier {
  id: string;
  name: string;
  price: number;
  benefits: string[];
  maxSlots: number;
}

interface MyEvent {
  id: string;
  title: string;
  bannerUrl: string | null;
  startDate: string;
  endDate: string;
  city: string;
  venue: string;
  expectedAttendees: number;
  status: string;
  tiers: EventTier[];
  _count: { offers: number };
}

export default function ProposalSmartReview() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // Lazy initialize eventId and eventName from localStorage or API
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventName, setEventName] = useState("Event");
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myEvents, setMyEvents] = useState<MyEvent[]>([]);
  const [eventsFilter, setEventsFilter] = useState<
    "SEMUA" | "PUBLISHED" | "DRAFT" | "SELESAI"
  >("SEMUA");
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

  // Load event data on mount (client-side only)
  useEffect(() => {
    const loadEventData = async () => {
      try {
        const savedStep3Data = localStorage.getItem("buatEventStep3Data");
        if (savedStep3Data) {
          const data = JSON.parse(savedStep3Data);
          setEventId(data.eventId);
          setEventName(data.eventName || "Event");
          setIsLoadingEvents(false);
          return;
        }

        const response = await apiCall<{ data: MyEvent[] }>("/events/my", {});

        if (response?.data && Array.isArray(response.data)) {
          setMyEvents(response.data);
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
    };

    loadEventData();
  }, []);

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !eventId) {
      showNotification("error", "File atau Event ID tidak ditemukan.");
      return;
    }

    const file = files[0];

    // Validate file type
    if (
      ![
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(file.type)
    ) {
      showNotification("error", "File harus berupa PDF atau DOCX.");
      return;
    }

    // Validate file size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      showNotification("error", "Ukuran file maksimal 15MB.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Step 1: Upload file to Firebase Storage
      const timestamp = Date.now();
      const fileName = `proposals/${eventId}/${timestamp}-${file.name}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, file);

      // Step 2: Get download URL
      const fileUrl = await getDownloadURL(storageRef);

      await apiCall(`/events/${eventId}/proposal`, {
        method: "POST",
        body: JSON.stringify({
          source: "UPLOAD",
          fileUrl: fileUrl,
        }),
      });

      showNotification("success", "Proposal berhasil diupload dan dianalisis!");
      setIsUploadDialogOpen(false);

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
              <Tabs defaultValue="event-kamu" className="mb-8">
                <TabsList className="flex items-center gap-8" variant={"line"}>
                  <TabsTrigger value="event-kamu">Event Kamu</TabsTrigger>
                  <TabsTrigger value="terbaru">Proposal Terbaru</TabsTrigger>
                  <TabsTrigger value="smart-review">
                    Proposal Smart Review
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="event-kamu" className="mt-6">
                  {/* Filter Buttons */}
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

                  {/* Event Grid */}
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
                          const ctaLabel =
                            event.status === "PUBLISHED"
                              ? "Kelola Event"
                              : event.status === "DRAFT"
                                ? "Lanjutkan Draft"
                                : "Lihat Laporan";

                          return (
                            <div
                              key={event.id}
                              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                            >
                              {/* Banner */}
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
                                {/* Status badge */}
                                <span
                                  className={`absolute top-3 left-3 ${statusColor} text-white text-[10px] font-bold px-2 py-0.5 rounded`}
                                >
                                  {statusLabel}
                                </span>
                              </div>

                              {/* Info */}
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

                                {/* Stats */}
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

                                {/* CTA */}
                                <div className="mt-auto pt-3 border-t border-gray-100 text-center">
                                  <button
                                    onClick={() =>
                                      router.push(`/buat-event?id=${event.id}`)
                                    }
                                    className="text-sm font-semibold text-[#003EC7] hover:underline"
                                  >
                                    {ctaLabel}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                      {/* Empty state */}
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
                </TabsContent>

                <TabsContent
                  value="smart-review"
                  className="grid grid-cols-3 gap-6 mt-6"
                >
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
                        Semua proposal di halaman ini otomatis dikurasi dengan
                        Jakarta Tech Fest 2026
                      </p>
                    </div>

                    {/* Proposal Card 1 */}
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 bg-[#DDE1FF4D]">
                      <div className="flex gap-4 items-center">
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 border-4  rounded-full flex items-center justify-center text-[#003EC7] text-xl font-bold border-[#003EC7]">
                            82
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs font-semibold">
                              AI POWERED
                            </Badge>
                            <h3 className="font-semibold text-gray-900 text-sm">
                              Template Proposal Utama
                            </h3>
                          </div>

                          <p className="text-xs text-blue-600 mb-2 font-medium">
                            Terakhir diperbaharui: 2 Jam yang lalu oleh Admin
                          </p>
                          <div className="flex gap-3 text-xs text-[#4B5563]">
                            <span className="bg-white rounded-[4px] px-2 py-1">
                              Tier: Platinum
                            </span>
                            <span className="bg-white rounded-[4px] px-2 py-1">
                              12 Halaman
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0 text-[14px] px-4 py-2"
                        >
                          Buka & Edit
                        </Button>
                      </div>
                    </Card>

                    {/* Proposal Card 2 */}
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-3 flex-1">
                          <div className="flex-shrink-0  p-4 bg-[#F3F4F6] rounded-[8px] flex items-center justify-center text-[#9CA3AF]">
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
                              <h3 className="font-semibold text-gray-900  text-sm">
                                Proposal Sponsorship - Vendor Lokal
                              </h3>
                            </div>

                            <div className="text-xs text-[#003EC7] space-y-0.5">
                              <p className="text-[14px]">
                                <span>Format:</span> PDF • 4.2 MB • Diupload 30
                                April 2026
                              </p>
                              <p className="bg-[#F9FAFB] rounded-[4px] px-2 py-1 text-[#4B5563] w-fit">
                                Status: Draft
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>

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
                      {/* Header */}
                      <div className="mb-6 pb-4 border-b">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            🤖 AI ANALYSIS
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Review untuk: Template Proposal
                        </h3>
                      </div>

                      {/* AI Analysis Metrics */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-[#F9FAFB] rounded-[4px] p-3">
                          <p className="text-xs font-semibold text-blue-600 mb-1">
                            STRUKTUR
                          </p>
                          <p className="text-3xl font-bold text-gray-900">
                            90{" "}
                            <span className="text-xs text-gray-500">/ 100</span>
                          </p>
                        </div>
                        <div className="bg-[#F9FAFB] rounded-[4px] p-3">
                          <p className="text-xs font-semibold text-blue-600 mb-1">
                            VISUAL
                          </p>
                          <p className="text-3xl font-bold text-gray-900">
                            74{" "}
                            <span className="text-xs text-gray-500">/ 100</span>
                          </p>
                        </div>
                        <div className="bg-[#F9FAFB] rounded-[4px] p-3">
                          <p className="text-xs font-semibold text-blue-600 mb-1">
                            NARASI
                          </p>
                          <p className="text-3xl font-bold text-gray-900">
                            86{" "}
                            <span className="text-xs text-gray-500">/ 100</span>
                          </p>
                        </div>
                        <div className="bg-[#F9FAFB] rounded-[4px] p-3">
                          <p className="text-xs font-semibold text-blue-600 mb-1">
                            RELEVANSI
                          </p>
                          <p className="text-3xl font-bold text-gray-900">
                            78{" "}
                            <span className="text-xs text-gray-500">/ 100</span>
                          </p>
                        </div>
                      </div>

                      {/* Issues */}
                      <div className="mb-6">
                        <h4 className="text-xs font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Image
                            src="/icons/alert-triangle.svg"
                            alt="alert"
                            width={14}
                            height={16}
                          />
                          MASALAH UTAMA (2)
                        </h4>
                        <div className="space-y-3">
                          <div className="flex gap-3 p-3 bg-[#D3E4FE4D] rounded-[8px]">
                            <div className="flex-shrink-0 mt-0.5">
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-red-700 mb-1">
                                Analisis ROI Kurang Detail
                              </p>
                              <p className="text-xs text-gray-600">
                                Sponsor korporat biasanya membuhukan matrix
                                konversi yang lebih spesifik di halaman 4.
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-3 p-3 bg-[#D3E4FE4D] rounded-[8px]">
                            <div className="flex-shrink-0 mt-0.5">
                              <AlertCircle className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-1">
                                Kualitas Gambar Footer
                              </p>
                              <p className="text-xs text-gray-600">
                                Logo partner pada halaman penutup memiliki
                                resolusi rendah ( 300dpi).
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2">
                        Lihat Analisis Lengkap →
                      </Button>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="terbaru">Proposal Terbaru</TabsContent>
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
