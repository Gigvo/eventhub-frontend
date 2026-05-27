"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Sparkles,
  Calendar,
  MapPin,
  Users,
  ImageIcon,
  Download,
  Building2,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Award,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/api-client";

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

interface EventInfo {
  id: string;
  title: string;
  slug: string;
}

interface CompanyProfile {
  id: string;
  companyName: string;
  industry: string;
  logoUrl: string | null;
  city: string;
}

interface SponsorTier {
  name: string;
  price: number;
}

interface sponsorOffer {
  id: string;
  eventId: string;
  companyProfileId: string;
  tierId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  initiatedBy: "COMPANY" | "ORGANIZER" | string;
  message: string;
  createdAt: string;
  updatedAt: string;
  respondedAt: string | null;
  closedAt: string | null;
  event: EventInfo;
  companyProfile: CompanyProfile;
  tier: SponsorTier;
}

export default function ProposalSmartReview() {
  const router = useRouter();

  // Controlled tab for programmatic switching from event-kamu CTA
  const [activeTab, setActiveTab] = useState("event-kamu");

  // Lazy initialize eventId and eventName from localStorage or API
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventName, setEventName] = useState("Event");
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  const [myEvents, setMyEvents] = useState<MyEvent[]>([]);
  const [eventsFilter, setEventsFilter] = useState<
    "SEMUA" | "PUBLISHED" | "DRAFT" | "SELESAI"
  >("SEMUA");
  const [proposalFilter, setProposalFilter] = useState<
    "Semua" | "Menunggu" | "Diterima"
  >("Semua");
  const [sponsorOffer, setSponsorOffer] = useState<sponsorOffer[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [offerDetail, setOfferDetail] = useState<any | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [laporanDetail, setLaporanDetail] = useState<any | null>(null);
  const [isLoadingLaporan, setIsLoadingLaporan] = useState(false);

  // Proposal analysis fetched directly from /events/{id}/proposal — not from /events/my

  useEffect(() => {
    async function loadEventData() {
      try {
        const response = await apiCall<{ data: MyEvent[] }>("/events/my", {});
        if (response?.data && Array.isArray(response.data)) {
          setMyEvents(response.data);

          const savedStep3Data = localStorage.getItem("buatEventStep3Data");
          if (savedStep3Data) {
            const data = JSON.parse(savedStep3Data);
            if (data.eventId) {
              setEventId(data.eventId);
              setEventName(data.eventName || "Event");
              return;
            }
          }

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

    async function loadSponsorData() {
      try {
        const response = await apiCall<{ data: sponsorOffer[] }>(
          "/offers/incoming",
          {},
        );
        if (response?.data && Array.isArray(response.data)) {
          setSponsorOffer(response.data);
        }
      } catch (error) {
        console.error("Failed to load sponsors:", error);
      }
    }

    loadEventData();
    loadSponsorData();
  }, []);

  async function fetchOfferDetail(id: string) {
    setIsLoadingDetail(true);
    try {
      const res = await apiCall<{ data: any }>(`/offers/incoming/${id}`, {});
      if (res?.data) {
        setOfferDetail(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingDetail(false);
    }
  }

  useEffect(() => {
    if (selectedOfferId) {
      fetchOfferDetail(selectedOfferId);
    } else {
      setOfferDetail(null);
    }
  }, [selectedOfferId]);

  useEffect(() => {
    if (activeTab === "laporan" && eventId) {
      const fetchLaporan = async () => {
        setIsLoadingLaporan(true);
        try {
          const res = await apiCall<any>(`/events/${eventId}`);
          if (res?.success && res?.data) {
            setLaporanDetail(res.data);
          }
        } catch (e) {
          console.error("Failed to fetch laporan event detail", e);
        } finally {
          setIsLoadingLaporan(false);
        }
      };
      fetchLaporan();
    }
  }, [activeTab, eventId]);

  const filteredOffers = sponsorOffer.filter((offer) => {
    if (proposalFilter === "Semua") return true;
    if (proposalFilter === "Menunggu")
      return offer.status === "PENDING" || offer.status === "UNDER_REVIEW";
    if (proposalFilter === "Diterima")
      return offer.status === "ACCEPTED" || offer.status === "APPROVED";
    return true;
  });

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
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
              <div className="text-center max-w-md px-4">
                <div className="mb-4 text-6xl">📋</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Belum ada event
                </h2>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
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
              {/* Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="mb-6 sm:mb-8"
              >
                <TabsList className="flex flex-wrap items-center gap-4 sm:gap-8" variant={"line"}>
                  <TabsTrigger value="event-kamu">Event Kamu</TabsTrigger>

                  <TabsTrigger value="laporan">Laporan</TabsTrigger>
                </TabsList>

                <TabsContent value="event-kamu" className="mt-6">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(["SEMUA", "PUBLISHED", "DRAFT", "SELESAI"] as const).map(
                      (f) => (
                        <button
                          key={f}
                          onClick={() => setEventsFilter(f)}
                          className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors ${
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-gray-100 rounded-xl h-72 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                  {(() => {
                                    // DRAFT + no proposal → go to step 3 of buat-event
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
                                            router.push(
                                              `/proposal-smart-review?id=${event.id}&tab=smart-review`,
                                            );
                                          }}
                                          className="text-sm font-semibold text-[#003EC7] hover:underline"
                                        >
                                          Edit Proposal
                                        </button>
                                      );
                                    }
                                    if (event.status === "PUBLISHED") {
                                      const isEventEnded =
                                        new Date() > new Date(event.endDate);
                                      if (isEventEnded) {
                                        return (
                                          <button
                                            onClick={() => {
                                              setEventId(event.id);
                                              setEventName(event.title);
                                              setActiveTab("laporan");
                                            }}
                                            className="text-sm font-semibold text-[#003EC7] hover:underline"
                                          >
                                            Lihat Laporan
                                          </button>
                                        );
                                      }
                                      return (
                                        <button
                                          onClick={() => {
                                            router.push(
                                              `/proposal-smart-review?id=${event.id}&tab=smart-review`,
                                            );
                                          }}
                                          className="text-sm font-semibold text-[#003EC7] hover:underline"
                                        >
                                          Kelola Event
                                        </button>
                                      );
                                    }
                                    // SELESAI → go to Laporan tab
                                    return (
                                      <button
                                        onClick={() => {
                                          setEventId(event.id);
                                          setEventName(event.title);
                                          setActiveTab("laporan");
                                        }}
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

                      {/* Empty state */}
                      {myEvents.filter(
                        (e) =>
                          eventsFilter === "SEMUA" || e.status === eventsFilter,
                      ).length === 0 && (
                        <div className="col-span-full py-16 text-center text-gray-400">
                          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                          <p className="text-sm">
                            Belum ada event untuk kategori ini.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="laporan">
                  {isLoadingLaporan ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-500 font-medium">
                        Memuat Laporan Event...
                      </p>
                    </div>
                  ) : !laporanDetail ||
                    laporanDetail.status !== "PUBLISHED" ||
                    !laporanDetail.endDate ||
                    new Date() <= new Date(laporanDetail.endDate) ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm text-center px-6">
                      <div className="bg-gray-100 p-4 rounded-full mb-4">
                        <Users className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Silakan Klik &quot;Lihat Laporan&quot; Terlebih Dahulu
                      </h3>
                      <p className="text-gray-500 text-sm max-w-sm mb-6">
                        Anda belum memuat data event apa pun. Silakan kembali ke
                        tab &quot;Event Kamu&quot; dan klik tombol &quot;Lihat
                        Laporan&quot; pada salah satu event yang telah selesai
                        untuk melihat laporan pasca-event.
                      </p>
                      <Button
                        onClick={() => setActiveTab("event-kamu")}
                        className="bg-[#003EC7] hover:bg-[#002FB0]"
                      >
                        Kembali ke Event Kamu
                      </Button>
                    </div>
                  ) : (
                    (() => {
                      // Process stats & details
                      const acceptedOffers =
                        laporanDetail.offers?.filter(
                          (o: any) =>
                            o.status === "APPROVED" || o.status === "ACCEPTED",
                        ) || [];
                      const displayFund = acceptedOffers.reduce(
                        (acc: number, o: any) => acc + (o.tier?.price || 0),
                        0,
                      );
                      const targetFund = (laporanDetail.tiers || []).reduce(
                        (acc: number, t: any) =>
                          acc + t.price * (t.maxSlots || 0),
                        0,
                      );

                      // Default fallback values if no accepted offers to make UI premium and realistic (like mockup)
                      const displaySponsorsCount =
                        acceptedOffers.length > 0 ? acceptedOffers.length : 0;
                      const displayMitraAktif =
                        acceptedOffers.length > 0 ? acceptedOffers.length : 0;
                      const displayAttendees =
                        laporanDetail.expectedAttendees || 0;

                      // ROI calculation: dynamic from aiScore or default 4.8
                      const roiScore = laporanDetail.proposal?.aiScore
                        ? (laporanDetail.proposal.aiScore / 20).toFixed(1)
                        : "0";

                      // Progress percentage
                      const progressPercent =
                        targetFund > 0
                          ? Math.round((displayFund / targetFund) * 100)
                          : 0;

                      // Format currency helpers
                      const formatCurrency = (val: number) => {
                        return new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          maximumFractionDigits: 0,
                        }).format(val);
                      };

                      const handlePrintLaporan = () => {
                        window.print();
                      };

                      return (
                        <div className="space-y-6 sm:space-y-8 animate-fadeIn mt-6">
                          {/* Header Section */}
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                                  {laporanDetail.title}
                                </h1>
                                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 text-[10px] sm:text-xs font-bold rounded-full border border-emerald-200 tracking-wider">
                                  SELESAI
                                </span>
                              </div>
                              <p className="text-gray-500 text-xs sm:text-sm">
                                Laporan komprehensif pasca-event dan
                                rekonsiliasi dana sponsor.
                              </p>
                            </div>
                            <Button
                              onClick={handlePrintLaporan}
                              className="bg-[#003EC7] hover:bg-[#002FB0] text-white px-5 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2 shadow-sm transition-all w-full md:w-auto justify-center"
                            >
                              <Download className="w-4 h-4" />
                              Unduh Laporan PDF
                            </Button>
                          </div>

                          {/* Metrics Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Card 1 */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full translate-x-8 -translate-y-8 transition-transform group-hover:scale-110" />
                              <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-blue-100">
                                <DollarSign className="w-6 h-6 text-[#003EC7]" />
                              </div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                TOTAL DANA TERKUMPUL
                              </p>
                              <p className="text-2xl font-black text-gray-900">
                                {formatCurrency(displayFund)}
                              </p>
                            </div>

                            {/* Card 2 */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-full translate-x-8 -translate-y-8 transition-transform group-hover:scale-110" />
                              <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-indigo-100">
                                <Building2 className="w-6 h-6 text-indigo-600" />
                              </div>
                              <p className="text-xs font-bold text-indigo-500 sm:absolute sm:top-6 sm:right-6 static mb-2 sm:mb-0 tracking-wide">
                                {displayMitraAktif} Mitra Aktif
                              </p>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                SPONSOR TERAKUISISI
                              </p>
                              <p className="text-2xl font-black text-gray-900">
                                {displaySponsorsCount} Perusahaan
                              </p>
                            </div>

                            {/* Card 3 */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/50 rounded-full translate-x-8 -translate-y-8 transition-transform group-hover:scale-110" />
                              <div className="bg-amber-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-amber-100">
                                <Users className="w-6 h-6 text-amber-600" />
                              </div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                TOTAL AUDIENS
                              </p>
                              <p className="text-2xl font-black text-gray-900">
                                {displayAttendees.toLocaleString("id-ID")} Orang
                              </p>
                            </div>
                          </div>

                          {/* Content Layout Grid */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Left Columns */}
                            <div className="lg:col-span-2 space-y-8">
                              {/* Sponsor Agreements Table */}
                              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                  <h3 className="font-extrabold text-gray-900 text-lg tracking-tight">
                                    Detail Kesepakatan Sponsor Utama
                                  </h3>
                                  <span className="text-xs font-bold text-[#003EC7] hover:underline cursor-pointer">
                                    Lihat Semua
                                  </span>
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left border-collapse min-w-[600px]">
                                    <thead>
                                      <tr className="bg-gray-50/75 border-b border-gray-100">
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                          Mitra
                                        </th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                          Paket
                                        </th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                          Nilai Kontrak
                                        </th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                          Status
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {laporanDetail.offers &&
                                      laporanDetail.offers.length > 0 ? (
                                        laporanDetail.offers.map(
                                          (offer: any) => (
                                            <tr
                                              key={offer.id}
                                              className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                            >
                                              <td className="p-4 flex items-center gap-3">
                                                <div className="bg-gray-100 p-2 rounded-xl">
                                                  <Building2 className="w-4 h-4 text-gray-500" />
                                                </div>
                                                <span className="font-bold text-gray-900">
                                                  {offer.companyProfile
                                                    ?.companyName ||
                                                    "PT Kolaborasi"}
                                                </span>
                                              </td>
                                              <td className="p-4 text-sm font-semibold text-gray-600">
                                                {offer.tier?.name ||
                                                  "Tier Sponsor"}
                                              </td>
                                              <td className="p-4 text-sm font-bold text-gray-900">
                                                {formatCurrency(
                                                  offer.tier?.price || 0,
                                                )}
                                              </td>
                                              <td className="p-4">
                                                <span
                                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold tracking-wider ${
                                                    offer.status ===
                                                      "APPROVED" ||
                                                    offer.status === "ACCEPTED"
                                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                      : "bg-amber-50 text-amber-700 border border-amber-200"
                                                  }`}
                                                >
                                                  {offer.status ===
                                                    "APPROVED" ||
                                                  offer.status === "ACCEPTED"
                                                    ? "Lunas"
                                                    : offer.status === "PENDING"
                                                      ? "Tidak ada respon"
                                                      : offer.status ===
                                                          "REJECTED"
                                                        ? "Ditolak"
                                                        : ""}
                                                </span>
                                              </td>
                                            </tr>
                                          ),
                                        )
                                      ) : (
                                        <tr>
                                          <td
                                            colSpan={4}
                                            className="p-8 text-center text-gray-400 text-sm"
                                          >
                                            Belum ada sponsor terdaftar untuk
                                            event ini.
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Cooperation Log Activity */}
                              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                                <h3 className="font-extrabold text-gray-900 text-lg tracking-tight">
                                  Log Aktivitas Kerjasama
                                </h3>
                                <div className="relative pl-8 border-l-2 border-gray-100 space-y-8">
                                  {/* Timeline Item 1 */}
                                  <div className="relative">
                                    <div className="absolute -left-[41px] top-0.5 bg-emerald-500 text-white rounded-full p-1.5 border-4 border-white shadow-sm">
                                      <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                        {new Date(
                                          laporanDetail.endDate,
                                        ).toLocaleDateString("id-ID", {
                                          day: "numeric",
                                          month: "long",
                                          year: "numeric",
                                        })}{" "}
                                        — 14:30
                                      </span>
                                      <h4 className="font-bold text-gray-955 text-sm">
                                        Laporan Laporan Akhir Diverifikasi AI
                                      </h4>
                                      <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                                        Semua bukti fisik dan digital telah
                                        divalidasi oleh sistem SponsorMatch.
                                      </p>
                                    </div>
                                  </div>

                                  {/* Timeline Item 2 */}
                                  <div className="relative">
                                    <div className="absolute -left-[41px] top-0.5 bg-[#003EC7] text-white rounded-full p-1.5 border-4 border-white shadow-sm">
                                      <TrendingUp className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                        {new Date(
                                          laporanDetail.startDate,
                                        ).toLocaleDateString("id-ID", {
                                          day: "numeric",
                                          month: "long",
                                          year: "numeric",
                                        })}{" "}
                                        — 22:00
                                      </span>
                                      <h4 className="font-bold text-gray-955 text-sm">
                                        Event Selesai Dilaksanakan
                                      </h4>
                                      <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                                        Event &quot;{laporanDetail.title}&quot;
                                        sukses mendatangkan{" "}
                                        {displayAttendees.toLocaleString(
                                          "id-ID",
                                        )}
                                        + pengunjung unik.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Sidebar Area */}
                            <div className="space-y-6">
                              {/* Fundraising Progress Card */}
                              <div className="bg-gradient-to-br from-[#003EC7] to-[#6366F1] rounded-2xl p-6 text-white shadow-md relative overflow-hidden group">
                                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />

                                <div className="flex justify-between items-center mb-6">
                                  <span className="text-[10px] font-black tracking-widest uppercase text-blue-100">
                                    FUNDRAISING PROGRESS
                                  </span>
                                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                                    <TrendingUp className="w-4 h-4 text-white" />
                                  </div>
                                </div>

                                <p className="text-4xl font-black mb-6 tracking-tight">
                                  {progressPercent}%
                                </p>

                                <div className="w-full bg-white/20 rounded-full h-3 mb-6 overflow-hidden">
                                  <div
                                    className="bg-amber-400 h-full rounded-full"
                                    style={{
                                      width: `${Math.min(progressPercent, 100)}%`,
                                    }}
                                  />
                                </div>
                                <div className="flex justify-between text-xs font-bold text-blue-100 mb-6">
                                  <span>
                                    Target: {formatCurrency(targetFund)}
                                  </span>
                                  <span>
                                    Capai: {formatCurrency(displayFund)}
                                  </span>
                                </div>

                                <div className="border-t border-white/10 pt-4 flex justify-between items-center text-xs">
                                  <div>
                                    <p className="text-blue-200 text-[10px] uppercase font-bold tracking-wider">
                                      Total Biaya
                                    </p>
                                    <p className="font-extrabold text-sm mt-0.5">
                                      {formatCurrency(0)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-blue-200 text-[10px] uppercase font-bold tracking-wider">
                                      Profit Bersih
                                    </p>
                                    <p className="font-extrabold text-sm mt-0.5 text-amber-400">
                                      {formatCurrency(displayFund)}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Account Manager Box */}
                              {/* <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 text-center space-y-4">
                                <p className="text-xs font-bold text-slate-500 leading-relaxed">
                                  Butuh bantuan rekonsiliasi data atau audit
                                  eksternal?
                                </p>
                                <button
                                  onClick={() =>
                                    alert("Menghubungi Account Manager...")
                                  }
                                  className="w-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 py-3 rounded-xl text-sm font-extrabold text-slate-700 shadow-sm transition-all"
                                >
                                  Hubungi Account Manager
                                </button>
                              </div> */}
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </>
      )}
    </div>
  );
}
