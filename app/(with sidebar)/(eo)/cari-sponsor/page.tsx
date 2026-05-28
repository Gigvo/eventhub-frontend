"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { apiCall } from "@/lib/api-client";
import {
  Zap,
  MapPin,
  Info,
  X,
  Check,
  Send,
  MessageSquare,
  Mail,
  Lock,
  ChevronDown,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────

interface EventDetail {
  id: string;
  title: string;
  slug: string;
  category: string;
  theme: string;
  description: string;
  city: string;
  venue: string;
  isOnline: boolean;
  startDate: string;
  endDate: string;
  expectedAttendees: number;
  audienceAgeMin: number;
  audienceAgeMax: number;
  audienceInterests: string[];
  bannerUrl: string | null;
  status: string;
  publishedAt: string | null;
  eoProfile: {
    organizationName: string;
    organizationType: string;
    campus: string;
    city: string;
    logoUrl: string | null;
    isVerified: boolean;
  };
  tiers: Tier[];
  proposal: {
    source: string;
    fileUrl: string;
  } | null;
}

interface Tier {
  id: string;
  name: string;
  price: number;
  benefits: string[];
  maxSlots: number | null;
}
interface SponsorRecommendation {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  description: string;
  logoUrl: string | null;
  city: string;
  targetAudience: string;
  preferences: {
    preferredInterests: string[];
    preferredCategories: string[];
    preferredAudienceAgeMax: number;
    preferredAudienceAgeMin: number;
  } | null;
  similarity: number;
  finalScore: number;
  scoreBreakdown: {
    semantic: number;
    category: number;
    city: number;
    audience: number;
  };
}

interface MyEvent {
  id: string;
  title: string;
  slug: string;
  status: string;
  tiers: {
    id: string;
    name: string;
    price: number;
    benefits: string[];
    maxSlots: number | null;
  }[];
}

interface IncomingOffer {
  id: string;
  eventId: string;
  companyProfileId: string;
  tierId: string;
  status: string;
  initiatedBy: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  respondedAt: string | null;
  closedAt: string | null;
  event: {
    id: string;
    title: string;
    slug: string;
  };
  companyProfile: {
    id: string;
    companyName: string;
    industry: string;
    logoUrl: string | null;
    city: string;
    phoneNumber?: string;
    user?: {
      email: string;
    };
  };
  tier: {
    name: string;
    price: number;
  };
}

interface MyPitch {
  id: string;
  eventId: string;
  companyProfileId: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CariSponsor() {
  // Temukan Sponsor state
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<
    SponsorRecommendation[]
  >([]);
  const [recoLoading, setRecoLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Gated Contact state
  const [offers, setOffers] = useState<IncomingOffer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [gatedFilter, setGatedFilter] = useState<string>("Semua");
  const [eventFilter, setEventFilter] = useState<string>("Semua Event");
  const [eventFilterOpen, setEventFilterOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [event, setEvent] = useState<MyEvent | null>(null);

  // ─── Pitch dialog state ───
  const [pitchDialogOpen, setPitchDialogOpen] = useState(false);
  const [pitchCompanyId, setPitchCompanyId] = useState<string | null>(null); // sponsor being pitched to
  const [pitchEventId, setPitchEventId] = useState<string | null>(null); // EO's chosen event
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [pitchMessage, setPitchMessage] = useState("");
  const [pitchSubmitting, setPitchSubmitting] = useState(false);
  const [pitchSuccess, setPitchSuccess] = useState(false);
  const [pitchError, setPitchError] = useState<string | null>(null);
  const [hasExistingPitch, setHasExistingPitch] = useState(false);
  const [myEvents, setMyEvents] = useState<MyEvent[]>([]);
  const [myEventsLoading, setMyEventsLoading] = useState(false);
  const [hasNoPublishedEvents, setHasNoPublishedEvents] = useState(false);
  const [myPitches, setMyPitches] = useState<MyPitch[]>([]);

  function openPitchDialog(companyProfileId: string) {
    setPitchCompanyId(companyProfileId);
    setPitchEventId(null);
    setSelectedTierId(null);
    setPitchMessage("");
    setPitchSuccess(false);
    setPitchError(null);
    setPitchDialogOpen(true);

    // Load events if not already loaded
    if (myEvents.length === 0) {
      setMyEventsLoading(true);
      apiCall<{ data: MyEvent[] }>("/events/my")
        .then((res) => {
          setMyEvents(
            (res.data || []).filter(
              (e) => e.status === "PUBLISHED" && e.tiers.length > 0,
            ),
          );
        })
        .catch(console.error)
        .finally(() => setMyEventsLoading(false));
    }
  }

  const handleCreatePitch = async () => {
    if (!pitchEventId || !selectedTierId || !pitchCompanyId) return;
    setPitchSubmitting(true);
    setPitchError(null);
    try {
      await apiCall("/pitches", {
        method: "POST",
        body: JSON.stringify({
          eventId: pitchEventId,
          companyProfileId: pitchCompanyId,
          tierId: selectedTierId,
          message: pitchMessage,
        }),
      });
      setPitchSuccess(true);
      // Optimistically update myPitches so the event is immediately hidden
      // from the event list if the dialog is reopened for the same company
      setMyPitches((prev) => [
        ...prev,
        {
          id: "pending",
          eventId: pitchEventId,
          companyProfileId: pitchCompanyId,
        },
      ]);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mengirim penawaran.";
      setPitchError(message);
    } finally {
      setPitchSubmitting(false);
    }
  };

  // Fetch events, pitches and recommendations on mount
  useEffect(() => {
    async function loadRecommendations() {
      setRecoLoading(true);
      try {
        const [eventsRes, pitchesRes] = await Promise.all([
          apiCall<{ data: MyEvent[] }>("/events/my"),
          apiCall<{ data: MyPitch[] }>("/pitches/my").catch(() => ({
            data: [] as MyPitch[],
          })),
        ]);

        // Store pitches for event filtering in dialog
        setMyPitches(pitchesRes.data || []);

        const publishedWithTiers = (eventsRes.data || []).filter(
          (e) => e.status === "PUBLISHED" && e.tiers.length > 0,
        );
        // Pre-populate so the dialog doesn't need a separate fetch
        setMyEvents(publishedWithTiers);
        setHasNoPublishedEvents(publishedWithTiers.length === 0);

        const publishedEvents = eventsRes.data.filter(
          (e) => e.status === "PUBLISHED",
        );
        if (publishedEvents.length > 0) {
          const latestEvent = publishedEvents[0];
          setSelectedEventId(latestEvent.id);
          const recoRes = await apiCall<{
            recommendations: SponsorRecommendation[];
          }>(`/recommendations/sponsors/${latestEvent.id}`);
          setRecommendations(recoRes.recommendations || []);
        }
      } catch (err) {
        console.error("Failed to load recommendations:", err);
      } finally {
        setRecoLoading(false);
      }
    }
    loadRecommendations();
  }, []);

  // Fetch incoming offers
  useEffect(() => {
    async function loadOffers() {
      setOffersLoading(true);
      try {
        const res = await apiCall<{ data: IncomingOffer[] }>(
          "/offers/incoming",
        );
        setOffers(res.data || []);
      } catch (err) {
        console.error("Failed to load offers:", err);
      } finally {
        setOffersLoading(false);
      }
    }
    loadOffers();
  }, []);

  // ─── Accept / Reject handlers ───

  async function handleAccept(offerId: string) {
    setActionLoading(offerId);
    try {
      await apiCall(`/offers/incoming/${offerId}/accept`, { method: "POST" });
      setOffers((prev) =>
        prev.map((o) => (o.id === offerId ? { ...o, status: "ACCEPTED" } : o)),
      );
    } catch (err) {
      console.error("Failed to accept:", err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(offerId: string) {
    setActionLoading(offerId);
    try {
      await apiCall(`/offers/incoming/${offerId}/reject`, { method: "POST" });
      setOffers((prev) =>
        prev.map((o) => (o.id === offerId ? { ...o, status: "REJECTED" } : o)),
      );
    } catch (err) {
      console.error("Failed to reject:", err);
    } finally {
      setActionLoading(null);
    }
  }

  // ─── Helpers ───

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatShortPrice = (amount: number) => {
    if (amount >= 1_000_000_000)
      return `Rp ${(amount / 1_000_000_000).toFixed(0)}M+`;
    if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(0)}jt+`;
    return `Rp ${(amount / 1_000).toFixed(0)}rb+`;
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return (
      d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }) +
      ", " +
      d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const handleWhatsApp = (phoneNumber: string | undefined, offerId: string) => {
    if (!phoneNumber) {
      window.location.href = `/cari-sponsor/gated-contact/${offerId}`;
      return;
    }
    let cleaned = phoneNumber.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.slice(1);
    }
    window.open(`https://wa.me/${cleaned}`, "_blank");
  };

  const handleEmail = (
    email: string | undefined,
    companyName: string,
    eventTitle: string,
    offerId: string,
  ) => {
    if (!email) {
      window.location.href = `/cari-sponsor/gated-contact/${offerId}`;
      return;
    }
    const subject = encodeURIComponent(`Kolaborasi Event: ${eventTitle}`);
    const body = encodeURIComponent(
      `Halo ${companyName},\n\nTerima kasih atas penawaran sponsorship yang Anda kirimkan untuk event "${eventTitle}". Kami sangat tertarik untuk berkolaborasi dengan Anda.\n\nMari kita jadwalkan sesi diskusi lebih lanjut.\n\nSalam,\n[Nama Event Organizer]`,
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  // Gated contact filters
  const gatedFilterTabs = ["Semua", "Baru", "Menunggu", "Disetujui", "Ditolak"];

  const statusToFilter: Record<string, string> = {
    PENDING: "Baru",
    UNDER_REVIEW: "Menunggu",
    NEGOTIATING: "Menunggu",
    ACCEPTED: "Disetujui",
    APPROVED: "Disetujui",
    REJECTED: "Ditolak",
  };

  const uniqueEvents = [
    "Semua Event",
    ...Array.from(new Set(offers.map((o) => o.event.title))),
  ];

  const filteredOffers = offers.filter((o) => {
    const matchesStatus =
      gatedFilter === "Semua" || statusToFilter[o.status] === gatedFilter;
    const matchesEvent =
      eventFilter === "Semua Event" || o.event.title === eventFilter;
    return matchesStatus && matchesEvent;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="text-xs font-bold text-blue-600 uppercase">
            BARU
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="text-xs font-bold text-orange-500 uppercase">
            MENUNGGU
          </span>
        );
      case "NEGOTIATING":
        return (
          <span className="text-xs font-bold text-purple-600 uppercase">
            NEGOSIASI
          </span>
        );
      case "ACCEPTED":
      case "APPROVED":
        return (
          <span className="text-xs font-bold text-green-600 uppercase">
            DISETUJUI
          </span>
        );
      case "REJECTED":
        return (
          <span className="text-xs font-bold text-red-500 uppercase">
            DITOLAK
          </span>
        );
      default:
        return (
          <span className="text-xs font-bold text-gray-500 uppercase">
            {status}
          </span>
        );
    }
  };

  // ─── Render ───

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Cari Sponsor
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Temukan mitra strategis yang sesuai dengan profil event Anda melalui
          AI Matching.
        </p>
      </div>

      <Tabs defaultValue="temukan" className="w-full">
        {/* Tabs */}
        <TabsList
          className="flex flex-wrap justify-start rounded-none h-auto p-0 mb-6 sm:mb-8 gap-4 sm:gap-6"
          variant={"line"}
        >
          <TabsTrigger
            value="temukan"
            className="rounded-none px-0 py-3 font-semibold text-gray-500 text-xs sm:text-sm"
          >
            Temukan Sponsor
          </TabsTrigger>
          <TabsTrigger
            value="gated"
            className="rounded-none px-0 py-3 font-semibold text-gray-500 text-xs sm:text-sm"
          >
            Sponsor Masuk
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════ TAB 1: TEMUKAN SPONSOR ═══════════════════════ */}
        <TabsContent value="temukan" className="mt-0">
          <div>
            {recoLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
                  >
                    <div className="h-14 w-14 bg-gray-200 rounded-xl mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-6" />
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded" />
                      <div className="h-3 bg-gray-200 rounded" />
                      <div className="h-3 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-1">
                  Belum ada rekomendasi sponsor
                </p>
                <p className="text-sm">
                  Pastikan Anda memiliki event yang sudah di-publish.
                </p>
              </div>
            ) : (
              <>
                {/* Sponsor Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {recommendations.map((sponsor) => {
                    const matchPercent = Math.round(sponsor.finalScore * 100);
                    return (
                      <div
                        key={sponsor.id}
                        className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col hover:shadow-md transition-shadow"
                      >
                        {/* Top row: Logo + Match badge */}
                        <div className="flex items-start justify-between mb-5">
                          <div className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {sponsor.logoUrl ? (
                              <Image
                                src={sponsor.logoUrl}
                                alt={sponsor.companyName}
                                width={56}
                                height={56}
                                className="object-cover"
                              />
                            ) : (
                              <div className="text-gray-400 font-bold text-xl">
                                {sponsor.companyName.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1 text-xs font-bold">
                            <Zap className="w-3 h-3" />
                            {matchPercent}% Match
                          </div>
                        </div>

                        {/* Company name */}
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {sponsor.companyName}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500 mb-5">
                          <MapPin className="w-3 h-3 mr-1" />
                          {sponsor.city}
                        </div>

                        {/* Info rows */}
                        <div className="space-y-3 flex-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                              Industri
                            </span>
                            <span className="text-sm font-semibold text-gray-900 bg-gray-50 px-2.5 py-0.5 rounded">
                              {sponsor.industry}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                              Budget
                            </span>
                            <span className="text-sm font-semibold text-green-600">
                              {sponsor.preferences
                                ? formatShortPrice(
                                    sponsor.preferences
                                      .preferredAudienceAgeMax * 100000,
                                  )
                                : "-"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Focus</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {sponsor.preferences?.preferredInterests?.[0] ??
                                sponsor.targetAudience?.split(",")[0]?.trim() ??
                                "-"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                              Active
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              {sponsor.preferences?.preferredCategories
                                ?.length ?? 0}
                              /bln
                            </span>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <Button
                          className={`w-full h-11 font-semibold text-white my-3 ${
                            hasNoPublishedEvents
                              ? "bg-amber-500 hover:bg-amber-500 cursor-not-allowed"
                              : hasExistingPitch || pitchSuccess
                                ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                                : "bg-[#3446C1] hover:bg-[#2a38a5]"
                          }`}
                          onClick={() =>
                            !hasNoPublishedEvents && openPitchDialog(sponsor.id)
                          }
                          disabled={
                            hasNoPublishedEvents ||
                            pitchSuccess ||
                            hasExistingPitch
                          }
                          title={
                            hasNoPublishedEvents
                              ? "Publikasikan event Anda terlebih dahulu untuk mengirim proposal"
                              : undefined
                          }
                        >
                          {hasNoPublishedEvents
                            ? "⚠ Belum Ada Event Aktif"
                            : hasExistingPitch || pitchSuccess
                              ? "Pitch Terkirim"
                              : "Kirim Pitch"}
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {/* Token Bar */}
                <div className="bg-gradient-to-r from-[#4338CA] to-[#7C3AED] rounded-xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-xs font-medium">
                        Remaining Proposal Tokens
                      </p>
                      <p className="text-white text-xl font-bold">140 Tokens</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="bg-white text-[#4338CA] border-white hover:bg-gray-100 font-semibold px-6"
                  >
                    Top Up Tokens
                  </Button>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* ═══════════════════════ TAB 2: GATED CONTACT ═══════════════════════ */}
        <TabsContent value="gated" className="mt-0">
          <div>
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-5 py-3.5 flex items-center gap-3 text-sm text-blue-700 mb-6">
              <Info className="w-4 h-4 flex-shrink-0" />
              Perusahaan yang tertarik akan muncul di sini. Setujui untuk
              membuka kontak dan mulai negosiasi.
            </div>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              {/* Event Filter Dropdown */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="text-sm font-medium text-gray-600 flex-shrink-0">
                  Filter Event:
                </span>
                <div className="relative flex-1 md:flex-initial min-w-0 md:min-w-[180px]">
                  <button
                    onClick={() => setEventFilterOpen(!eventFilterOpen)}
                    className="flex items-center justify-between gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition w-full"
                  >
                    <span className="truncate">{eventFilter}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </button>
                  {eventFilterOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                      {uniqueEvents.map((ev) => (
                        <button
                          key={ev}
                          onClick={() => {
                            setEventFilter(ev);
                            setEventFilterOpen(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${
                            eventFilter === ev
                              ? "text-[#3446C1] font-semibold bg-blue-50"
                              : "text-gray-700"
                          }`}
                        >
                          {ev}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                {gatedFilterTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setGatedFilter(tab)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      gatedFilter === tab
                        ? "bg-gray-800 text-white"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Offer Cards */}
            {offersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
                  >
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredOffers.length === 0 ? (
              <div className="text-center py-16 text-gray-500 bg-white border border-dashed border-gray-300 rounded-xl">
                <p>Belum ada sponsor yang masuk untuk filter ini.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOffers.map((offer) => {
                  const isAccepted =
                    offer.status === "ACCEPTED" || offer.status === "APPROVED";
                  const isRejected = offer.status === "REJECTED";
                  const isPending =
                    offer.status === "PENDING" ||
                    offer.status === "UNDER_REVIEW" ||
                    offer.status === "NEGOTIATING";

                  return (
                    <div
                      key={offer.id}
                      className={`bg-white rounded-xl border overflow-hidden transition-shadow hover:shadow-sm ${
                        isAccepted
                          ? "border-green-200"
                          : isRejected
                            ? "border-red-100"
                            : "border-gray-200"
                      }`}
                    >
                      {/* Main Row */}
                      <div className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                          {/* Left: Company Info */}
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {offer.companyProfile.logoUrl ? (
                                <Image
                                  src={offer.companyProfile.logoUrl}
                                  alt={offer.companyProfile.companyName}
                                  width={40}
                                  height={40}
                                  className="object-cover"
                                />
                              ) : (
                                <span className="text-gray-400 font-bold text-sm">
                                  {offer.companyProfile.companyName.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                                  {offer.companyProfile.companyName}
                                </h3>
                                {offer.status === "PENDING" && (
                                  <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                    BARU
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {offer.companyProfile.industry}
                              </p>
                            </div>
                          </div>

                          {/* Right: Date + Status */}
                          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-1 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                            <p className="text-[11px] text-gray-400">
                              {formatDateTime(offer.createdAt)}
                            </p>
                            <div>{getStatusBadge(offer.status)}</div>
                          </div>
                        </div>

                        {/* Meta Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-500 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <div>
                            <span className="font-bold text-gray-400 uppercase text-[9px] sm:text-[10px]">
                              Event Tujuan
                            </span>
                            <p className="text-gray-900 font-semibold text-xs sm:text-sm mt-0.5">
                              {offer.event.title}
                            </p>
                          </div>
                          <div>
                            <span className="font-bold text-gray-400 uppercase text-[9px] sm:text-[10px]">
                              Paket Sponsor
                            </span>
                            <p className="text-gray-900 font-semibold text-xs sm:text-sm capitalize mt-0.5">
                              {offer.tier.name}
                            </p>
                          </div>
                          <div>
                            <span className="font-bold text-gray-400 uppercase text-[9px] sm:text-[10px]">
                              AI Match Score
                            </span>
                            <p className="text-green-600 font-bold text-xs sm:text-sm mt-0.5 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              94% AI Match
                            </p>
                          </div>
                        </div>

                        {/* Action Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-gray-100">
                          {/* Left: contact status */}
                          <div className="flex items-center gap-1.5 text-xs">
                            {isAccepted ? (
                              <span className="text-green-600 font-medium flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                Kontak terbuka silakan hubungi tim
                              </span>
                            ) : (
                              <span className="text-gray-400 flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                Kontak terkunci setujui untuk membuka
                              </span>
                            )}
                          </div>

                          {/* Right: Actions */}
                          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
                            <button
                              className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1 mr-auto sm:mr-0 py-2"
                              onClick={() =>
                                (window.location.href = `/cari-sponsor/gated-contact/${offer.id}`)
                              }
                            >
                              Lihat Detail →
                            </button>

                            {isPending && (
                              <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 sm:flex-none border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold gap-1.5 h-9 justify-center"
                                  onClick={() => handleReject(offer.id)}
                                  disabled={actionLoading === offer.id}
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Tolak
                                </Button>
                                <Button
                                  size="sm"
                                  className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white font-semibold gap-1.5 h-9 justify-center"
                                  onClick={() => handleAccept(offer.id)}
                                  disabled={actionLoading === offer.id}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Setujui
                                </Button>
                              </div>
                            )}

                            {isAccepted && (
                              <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                  size="sm"
                                  className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white font-semibold gap-1.5 h-9 justify-center"
                                  onClick={() =>
                                    handleWhatsApp(
                                      offer.companyProfile.phoneNumber,
                                      offer.id,
                                    )
                                  }
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  Chat via WA
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 sm:flex-none font-semibold gap-1.5 h-9 justify-center bg-white"
                                  onClick={() =>
                                    handleEmail(
                                      offer.companyProfile.user?.email,
                                      offer.companyProfile.companyName,
                                      offer.event.title,
                                      offer.id,
                                    )
                                  }
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                  Kirim Email
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Pitch Dialog ─── */}
      <Dialog open={pitchDialogOpen} onOpenChange={setPitchDialogOpen}>
        <DialogContent className="lg:min-w-200">
          {pitchSuccess ? (
            /* ── Success state ── */
            <div className="py-8 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Proposal Terkirim!
              </DialogTitle>
              <p className="text-sm text-gray-500 leading-relaxed">
                Proposal Anda untuk{" "}
                <span className="font-semibold text-gray-800">
                  {myEvents.find((e) => e.id === pitchEventId)?.title ??
                    "event ini"}
                </span>{" "}
                telah berhasil dikirim ke sponsor. Tunggu respons mereka.
              </p>
              <Button
                className="mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8"
                onClick={() => (window.location.href = "/dashboard")}
              >
                Kembali ke Dashboard
              </Button>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">
                  Kirim Proposal ke Sponsor
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  Pilih event dan paket yang akan Anda tawarkan kepada sponsor
                  ini.
                </DialogDescription>
              </DialogHeader>

              <div className="lg:flex items-center gap-4">
                {/* Step 1: Event Selection */}
                <div className="mt-2 flex-1">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Pilih Event Anda
                  </p>
                  {myEventsLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                      <span className="ml-2 text-sm text-gray-500">
                        Memuat event...
                      </span>
                    </div>
                  ) : myEvents.length === 0 ? (
                    <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4 text-center">
                      Tidak ada event yang sudah dipublikasikan dan memiliki
                      paket sponsorship.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {(() => {
                        // Filter out events already pitched to this company
                        const available = myEvents.filter(
                          (ev) =>
                            !myPitches.some(
                              (p) =>
                                p.eventId === ev.id &&
                                p.companyProfileId === pitchCompanyId,
                            ),
                        );
                        if (available.length === 0) {
                          return (
                            <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4 text-center">
                              Semua event Anda sudah pernah mengirim proposal ke
                              sponsor ini.
                            </p>
                          );
                        }
                        return available.map((ev) => (
                          <button
                            key={ev.id}
                            onClick={() => {
                              setPitchEventId(ev.id);
                              setSelectedTierId(null); // reset tier when event changes
                            }}
                            className={`w-full text-left rounded-lg border px-4 py-3 transition-all ${
                              pitchEventId === ev.id
                                ? "border-[#3446C1] bg-blue-50 ring-1 ring-[#3446C1]"
                                : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                  pitchEventId === ev.id
                                    ? "border-[#3446C1] bg-[#3446C1]"
                                    : "border-gray-300"
                                }`}
                              >
                                {pitchEventId === ev.id && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {ev.title}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {ev.tiers.length} paket tersedia
                                </p>
                              </div>
                            </div>
                          </button>
                        ));
                      })()}
                    </div>
                  )}
                </div>

                {/* Step 2: Tier Selection (only when event chosen) */}
                {pitchEventId && (
                  <div className="mt-4 flex-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                      Pilih Paket Sponsor
                    </p>
                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                      {myEvents
                        .find((e) => e.id === pitchEventId)
                        ?.tiers.map((tier) => (
                          <button
                            key={tier.id}
                            onClick={() => setSelectedTierId(tier.id)}
                            className={`w-full text-left rounded-lg border p-3.5 transition-all ${
                              selectedTierId === tier.id
                                ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                                : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    selectedTierId === tier.id
                                      ? "border-blue-500 bg-blue-500"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {selectedTierId === tier.id && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                  )}
                                </div>
                                <span className="font-semibold text-gray-900 text-sm capitalize">
                                  {tier.name}
                                </span>
                              </div>
                              <span className="text-blue-600 font-bold text-sm">
                                {formatRupiah(tier.price)}
                              </span>
                            </div>
                            {tier.benefits && tier.benefits.length > 0 && (
                              <ul className="ml-6 space-y-0.5">
                                {tier.benefits.slice(0, 3).map((b, i) => (
                                  <li
                                    key={i}
                                    className="flex items-center gap-1.5 text-xs text-gray-500"
                                  >
                                    <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                                    {b}
                                  </li>
                                ))}
                                {tier.benefits.length > 3 && (
                                  <li className="text-xs text-gray-400 ml-4">
                                    +{tier.benefits.length - 3} benefit lainnya
                                  </li>
                                )}
                              </ul>
                            )}
                            {tier.maxSlots && (
                              <p className="ml-6 text-[11px] text-gray-400 mt-1">
                                Maks. {tier.maxSlots} slot
                              </p>
                            )}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Message Input */}
              <div className="mt-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Pesan Pitch
                </label>
                <textarea
                  rows={4}
                  value={pitchMessage}
                  onChange={(e) => setPitchMessage(e.target.value)}
                  minLength={10}
                  required
                  placeholder="Perkenalkan event Anda dan jelaskan mengapa sponsor ini cocok untuk berkolaborasi..."
                  className={`w-full rounded-lg border px-3.5 py-3 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:border-transparent transition ${
                    pitchMessage.length > 0 && pitchMessage.length < 10
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 focus:ring-blue-500"
                  }`}
                />
                {pitchMessage.length > 0 && pitchMessage.length < 10 && (
                  <p className="mt-1 text-xs text-red-500">
                    Pesan minimal 10 karakter. ({pitchMessage.length}/10)
                  </p>
                )}
              </div>

              {/* Error */}
              {pitchError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                  {pitchError}
                </p>
              )}

              <DialogFooter className="mt-2 gap-2 flex-col sm:flex-row">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPitchDialogOpen(false)}
                  disabled={pitchSubmitting}
                >
                  Batal
                </Button>
                <Button
                  className="flex-1 bg-[#3446C1] hover:bg-[#2a38a5] text-white font-semibold gap-2"
                  onClick={handleCreatePitch}
                  disabled={
                    !pitchEventId ||
                    !selectedTierId ||
                    pitchMessage.trim().length < 10 ||
                    pitchSubmitting
                  }
                >
                  {pitchSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Kirim Pitch
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
