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
import { Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/api-client";
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
              {/* Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="mb-8"
              >
                <TabsList className="flex items-center gap-8" variant={"line"}>
                  <TabsTrigger value="event-kamu">Event Kamu</TabsTrigger>
                  <TabsTrigger value="proposal&sponsor">
                    Proposal & Sponsor
                  </TabsTrigger>
                  <TabsTrigger value="laporan">Laporan</TabsTrigger>
                </TabsList>

                <TabsContent value="event-kamu" className="mt-6">
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
                                    // SELESAI → go to cari-sponsor
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

                <TabsContent value="proposal&sponsor" className="mt-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Pane: List */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <h2 className="text-xl font-bold text-gray-900">
                            Sponsor Masuk
                          </h2>
                          <span className="text-sm font-semibold text-gray-400">
                            ({filteredOffers.length})
                          </span>
                        </div>
                        <div className="flex bg-white rounded-full p-1 border border-gray-200 shadow-sm">
                          {["Semua", "Menunggu", "Diterima"].map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setProposalFilter(tab as any)}
                              className={`px-5 py-1.5 text-sm rounded-full transition-colors ${
                                proposalFilter === tab
                                  ? "bg-blue-50 text-[#2A41C7] font-semibold"
                                  : "text-gray-500 hover:text-gray-900 font-medium"
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        {filteredOffers.map((offer) => (
                          <div
                            key={offer.id}
                            onClick={() => setSelectedOfferId(offer.id)}
                            className={`p-5 rounded-2xl border bg-white cursor-pointer transition-all hover:shadow-md flex items-center justify-between ${
                              selectedOfferId === offer.id
                                ? "border-blue-400 ring-1 ring-blue-400 shadow-sm"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm">
                                {offer.companyProfile.logoUrl ? (
                                  <Image
                                    src={offer.companyProfile.logoUrl}
                                    alt={offer.companyProfile.companyName}
                                    width={56}
                                    height={56}
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="text-gray-400 font-bold text-xl">
                                    {offer.companyProfile.companyName.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 text-base">
                                  {offer.companyProfile.companyName}
                                </h3>
                                <div className="text-xs font-medium text-gray-500 mt-1 flex items-center gap-2">
                                  <span>{formatRupiah(offer.tier.price)}</span>
                                  <span>•</span>
                                  <span className="capitalize">
                                    Tier: {offer.tier.name}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2.5">
                              <div className="flex items-center gap-1.5 text-[#2A41C7] font-bold text-xs">
                                <Sparkles className="w-3.5 h-3.5" />
                                94% Match
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${
                                  offer.status === "PENDING" ||
                                  offer.status === "UNDER_REVIEW"
                                    ? "bg-yellow-50 text-yellow-600 border border-yellow-100"
                                    : offer.status === "ACCEPTED" ||
                                        offer.status === "APPROVED"
                                      ? "bg-green-50 text-green-600 border border-green-100"
                                      : "bg-gray-50 text-gray-600 border border-gray-100"
                                }`}
                              >
                                {offer.status === "PENDING"
                                  ? "Menunggu"
                                  : offer.status === "UNDER_REVIEW"
                                    ? "Review"
                                    : offer.status === "ACCEPTED" ||
                                        offer.status === "APPROVED"
                                      ? "Diterima"
                                      : offer.status}
                              </span>
                            </div>
                          </div>
                        ))}

                        {filteredOffers.length === 0 && (
                          <div className="text-center py-16 text-gray-400 bg-white border border-dashed border-gray-300 rounded-xl">
                            Belum ada sponsor yang masuk.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Pane: Details or Widgets */}
                    <div className="w-full lg:w-[400px] flex flex-col gap-6">
                      {selectedOfferId && offerDetail ? (
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-6 shadow-sm">
                          {/* Details Header */}
                          <div className="p-6 border-b border-gray-100 text-center bg-gray-50/50">
                            <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 border border-gray-200 text-3xl font-bold text-gray-300 overflow-hidden shadow-sm">
                              {offerDetail.companyProfile.logoUrl ? (
                                <Image
                                  src={offerDetail.companyProfile.logoUrl}
                                  alt={offerDetail.companyProfile.companyName}
                                  width={80}
                                  height={80}
                                  className="object-cover"
                                />
                              ) : (
                                offerDetail.companyProfile.companyName.charAt(0)
                              )}
                            </div>
                            <h3 className="font-bold text-xl text-gray-900">
                              {offerDetail.companyProfile.companyName}
                            </h3>
                            <p className="text-sm font-medium text-gray-500 mt-1">
                              {offerDetail.companyProfile.industry}
                            </p>
                          </div>
                          <div className="p-6 space-y-6">
                            <div>
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                Penawaran
                              </h4>
                              <div className="bg-white rounded-xl p-4 border border-gray-200 flex justify-between items-center shadow-sm">
                                <span className="font-semibold text-gray-900 capitalize">
                                  {offerDetail.tier.name}
                                </span>
                                <span className="font-bold text-[#2A41C7]">
                                  {formatRupiah(offerDetail.tier.price)}
                                </span>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                Pesan
                              </h4>
                              <div className="text-sm leading-relaxed text-gray-700 bg-blue-50/50 p-5 rounded-xl border border-blue-100/50 italic">
                                &quot;{offerDetail.message}&quot;
                              </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                              <Button
                                variant="outline"
                                className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 font-semibold h-11"
                              >
                                Tolak
                              </Button>
                              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm font-semibold h-11">
                                Terima
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              className="w-full text-xs font-medium text-gray-400 mt-1 hover:text-gray-600"
                              onClick={() => setSelectedOfferId(null)}
                            >
                              Tutup Detail
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Widget 1: Event Performance */}
                          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-5">
                              Event Performance
                            </h3>
                            <div className="bg-gray-50/80 rounded-xl p-5 mb-5 border border-gray-100">
                              <p className="text-xs font-semibold text-gray-400 mb-1">
                                AI Proposal Score
                              </p>
                              <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-extrabold text-[#2A41C7]">
                                  8.4
                                </span>
                                <span className="text-sm font-bold text-gray-300">
                                  /10
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="border border-gray-100 rounded-xl p-4 shadow-sm bg-white">
                                <p className="text-xs font-semibold text-gray-400 mb-1.5">
                                  Impressions
                                </p>
                                <p className="font-bold text-lg text-gray-900">
                                  12.4K
                                </p>
                              </div>
                              <div className="border border-gray-100 rounded-xl p-4 shadow-sm bg-white">
                                <p className="text-xs font-semibold text-gray-400 mb-1.5">
                                  Proposal Views
                                </p>
                                <p className="font-bold text-lg text-gray-900">
                                  842
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Widget 2: Smart Review Tips */}
                          <div className="bg-[#2A41C7] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm">
                                <Sparkles className="w-4 h-4 text-white" />
                              </div>
                              <h3 className="font-bold text-base tracking-wide">
                                Smart Review Tips
                              </h3>
                            </div>
                            <p className="text-sm text-blue-100 leading-relaxed mb-6">
                              &quot;Berdasarkan analitik kami, menambahkan
                              rincian demografi pengunjung yang lebih spesifik
                              dapat meningkatkan ketertarikan sponsor sebesar
                              40%.&quot;
                            </p>
                            <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 transition-colors py-2.5 rounded-xl text-sm font-semibold tracking-wide backdrop-blur-sm">
                              Lihat Rekomendasi
                            </button>
                          </div>

                          {/* Widget 3: Target Sponsor */}
                          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex justify-between items-end mb-4">
                              <h3 className="font-bold text-gray-900">
                                Target Sponsor
                              </h3>
                              <span className="font-bold text-[#2A41C7]">
                                65%
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
                              <div
                                className="bg-[#2A41C7] h-2 rounded-full"
                                style={{ width: "65%" }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                              <span>IDR 1.2M Terkumpul</span>
                              <span>Target IDR 2.0M</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="laporan"></TabsContent>
              </Tabs>
            </>
          )}
        </>
      )}
    </div>
  );
}
