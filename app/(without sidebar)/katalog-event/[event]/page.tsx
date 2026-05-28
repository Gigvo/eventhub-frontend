"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  Share2,
  Bookmark,
  MapPin,
  Calendar,
  Users,
  Building2,
  Sparkles,
  Check,
  Loader2,
  Send,
  FileText,
} from "lucide-react";
import { apiCall } from "@/lib/api-client";
import Image from "next/image";

interface Tier {
  id: string;
  name: string;
  price: number;
  benefits: string[];
  maxSlots: number | null;
}

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
    fileUrl: string | null;
    content?: string | null;
  } | null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.event as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    apiCall<{ data: { role: string } }>("/auth/me")
      .then((res) => setUserRole(res.data.role))
      .catch(() => setUserRole(null));
  }, []);

  const handleDownloadPDF = async () => {
    if (!event) return;
    const proposal = event.proposal;

    if (proposal?.source === "GENERATED" && proposal.content) {
      setIsDownloading(true);

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

      const cleanTitle = event.title.replace(/[^a-zA-Z0-9]/g, "_");
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
              <h1>Proposal: ${event.title}</h1>
              ${htmlContent}
            </body>
          </html>
        `);
        doc.close();

        iframe.contentWindow?.focus();
        setTimeout(() => {
          iframe.contentWindow?.print();
          setTimeout(() => document.body.removeChild(iframe), 1000);
          setIsDownloading(false);
        }, 500);
      }
      return;
    }

    if (!proposal?.fileUrl) {
      alert("Proposal tidak tersedia untuk event ini.");
      return;
    }

    setIsDownloading(true);
    const fileUrl = proposal.fileUrl;

    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cleanTitle = event!.title.replace(/[^a-zA-Z0-9]/g, "_");
      a.download = `Proposal_${cleanTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.warn(
        "Direct download failed, falling back to window.open with GCS URL",
        error,
      );
      window.open(fileUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };
  // ─── Offer dialog state ───
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [offerMessage, setOfferMessage] = useState("");
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);
  const [hasExistingOffer, setHasExistingOffer] = useState(false);

  useEffect(() => {
    if (!slug) return;

    // Fetch event detail
    apiCall<{ data: EventDetail }>(`/catalog/events/${slug}`, {
      requireAuth: false,
    })
      .then((res) => {
        const fetchedEvent = res.data;
        setEvent(fetchedEvent);

        // After we have the eventId, check if user already sent an offer
        apiCall<{ data: { eventId: string }[] }>("/offers/my")
          .then((offersRes) => {
            const alreadySent = offersRes.data.some(
              (o) => o.eventId === fetchedEvent.id,
            );
            setHasExistingOffer(alreadySent);
          })
          .catch(() => {}); // silently ignore if not authenticated
      })
      .catch((err) => setError(err?.message ?? "Gagal memuat detail event."))
      .finally(() => setIsLoading(false));
  }, [slug]);

  function openOfferDialog() {
    setSelectedTierId(null);
    setOfferMessage("");
    setOfferSuccess(false);
    setOfferError(null);
    setOfferDialogOpen(true);
  }

  const handleCreateOffer = async () => {
    if (!event || !selectedTierId) return;
    setOfferSubmitting(true);
    setOfferError(null);
    try {
      await apiCall("/offers", {
        method: "POST",
        body: JSON.stringify({
          eventId: event.id,
          tierId: selectedTierId,
          message: offerMessage,
        }),
      });
      setOfferSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mengirim penawaran.";
      setOfferError(message);
    } finally {
      setOfferSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Event tidak ditemukan</h1>
          <p className="text-gray-500 text-sm mb-6">
            {error ?? "Event yang kamu cari tidak tersedia."}
          </p>
          <Button onClick={() => router.back()}>← Kembali</Button>
        </div>
      </div>
    );
  }

  const minTierPrice =
    event.tiers.length > 0
      ? Math.min(...event.tiers.map((t) => t.price))
      : null;
  const maxTierPrice =
    event.tiers.length > 0
      ? Math.max(...event.tiers.map((t) => t.price))
      : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ChevronLeft className="h-5 w-5" />
              Kembali
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Katalog Event</span>
              <span>/</span>
              <span className="text-gray-900 font-medium truncate max-w-xs">
                {event.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              title={
                !event?.proposal?.fileUrl
                  ? "Proposal PDF belum tersedia untuk event ini"
                  : undefined
              }
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              {isDownloading ? "Mengunduh..." : "Unduh PDF"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div
            className={`space-y-6 ${
              userRole === "COMPANY" ? "lg:col-span-2" : "lg:col-span-3"
            }`}
          >
            {/* Banner */}
            <div className="relative w-full h-72 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl overflow-hidden flex items-end">
              {event.bannerUrl ? (
                <Image
                  src={event.bannerUrl}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="relative z-10 p-6 text-white">
                <Badge className="bg-white/20 text-white border-none mb-2">
                  {event.category}
                </Badge>
                <h1 className="text-3xl font-bold">{event.title}</h1>
                <p className="text-white/80 text-sm mt-1">{event.theme}</p>
              </div>
            </div>

            {/* Quick Info Row */}
            <div className="grid grid-cols-3 lg:gap-4 gap-2">
              <div className="bg-white rounded-lg md:p-4 p-2 border flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tanggal</p>
                  <p className="md:text-sm text-xs font-medium">
                    {formatDate(event.startDate)}
                    {event.startDate !== event.endDate && (
                      <> – {formatDate(event.endDate)}</>
                    )}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg md:p-4 p-2 border flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Lokasi</p>
                  <p className="md:text-sm text-xs font-medium">
                    {event.isOnline
                      ? "Online"
                      : `${event.venue}, ${event.city}`}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg md:p-4 p-2 border flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Estimasi Peserta</p>
                  <p className="md:text-sm text-xs font-medium">
                    {event.expectedAttendees.toLocaleString("id-ID")} orang
                  </p>
                </div>
              </div>
            </div>

            {/* About Event */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="h-6 w-6 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-600">
                  01
                </span>
                Tentang Event
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Target Audience */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="h-6 w-6 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-600">
                  02
                </span>
                Target Audiens
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 border rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Rentang Usia
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {event.audienceAgeMin} – {event.audienceAgeMax} tahun
                  </p>
                </div>
                <div className="bg-gray-50 border rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Minat
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {event.audienceInterests.map((interest, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sponsorship Tiers */}
            {event.tiers.length > 0 && (
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="h-6 w-6 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-600">
                    03
                  </span>
                  Paket Sponsorship
                </h2>
                <div className="space-y-4">
                  {event.tiers.map((tier) => (
                    <div
                      key={tier.id}
                      className="border rounded-lg p-4 hover:border-blue-300 transition"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-gray-900">
                          {tier.name}
                        </span>
                        <span className="text-blue-600 font-bold text-lg">
                          {formatPrice(tier.price)}
                        </span>
                      </div>
                      {tier.benefits && tier.benefits.length > 0 && (
                        <ul className="space-y-1.5">
                          {tier.benefits.map((benefit, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-gray-600"
                            >
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      )}
                      {tier.maxSlots && (
                        <p className="text-xs text-gray-400 mt-2">
                          Maks. {tier.maxSlots} slot
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Organizer */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Penyelenggara
              </h2>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                  {event.eoProfile.organizationName[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {event.eoProfile.organizationName}
                    {event.eoProfile.isVerified && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    {event.eoProfile.organizationType}
                  </p>
                  <p className="text-sm text-gray-500">
                    {event.eoProfile.campus} · {event.eoProfile.city}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          {userRole === "COMPANY" && (
            <div className="space-y-6">
              <Card className="p-6 sticky top-24">
                {/* Budget */}
                {minTierPrice !== null && (
                  <>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Budget Range
                    </p>
                    <p className="text-2xl font-light text-blue-600 mb-4">
                      {minTierPrice === maxTierPrice
                        ? formatPrice(minTierPrice)
                        : `${formatPrice(minTierPrice)} – ${formatPrice(maxTierPrice!)}`}
                    </p>
                  </>
                )}

                {/* AI Match Box */}
                <div className="p-4 bg-blue-50 rounded-lg mb-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-blue-900">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    Kenapa Event Ini?
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-700">
                        Target usia {event.audienceAgeMin}–
                        {event.audienceAgeMax} tahun.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-700">
                        {event.expectedAttendees.toLocaleString("id-ID")}{" "}
                        estimasi peserta.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-700">
                        Kategori {event.category} · {event.city}.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  className={`w-full h-11 font-semibold text-white mb-3 ${
                    hasExistingOffer || offerSuccess
                      ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                  onClick={openOfferDialog}
                  disabled={offerSuccess || hasExistingOffer}
                >
                  {hasExistingOffer || offerSuccess
                    ? "✓ Penawaran Terkirim"
                    : "✓ Saya Tertarik"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full font-semibold text-gray-700"
                  onClick={() => router.back()}
                >
                  Lihat Katalog Lain
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* ─── Offer Dialog ─── */}
      {userRole === "COMPANY" && (
        <Dialog open={offerDialogOpen} onOpenChange={setOfferDialogOpen}>
          <DialogContent className="max-w-lg">
            {offerSuccess ? (
              /* ── Success state ── */
              <div className="py-8 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Penawaran Terkirim!
                </DialogTitle>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Penawaran Anda untuk{" "}
                  <span className="font-semibold text-gray-800">
                    {event?.title}
                  </span>{" "}
                  telah berhasil dikirim. Tim EO akan segera meninjau dan
                  merespons penawaran Anda.
                </p>
                <Button
                  className="mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8"
                  onClick={() => setOfferDialogOpen(false)}
                >
                  Tutup
                </Button>
              </div>
            ) : (
              /* ── Form state ── */
              <>
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">
                    Kirim Penawaran Sponsorship
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-500">
                    Pilih paket dan tulis pesan Anda untuk{" "}
                    <span className="font-medium text-gray-700">
                      {event?.title}
                    </span>
                    .
                  </DialogDescription>
                </DialogHeader>

                {/* Tier Selection */}
                <div className="mt-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Pilih Paket Sponsor
                  </p>
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {event?.tiers.map((tier) => (
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
                            {formatPrice(tier.price)}
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

                {/* Message Input */}
                <div className="mt-4">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                    Pesan Penawaran
                  </label>
                  <textarea
                    rows={4}
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    minLength={10}
                    required
                    placeholder="Perkenalkan perusahaan Anda dan jelaskan mengapa Anda tertarik mensponsori event ini..."
                    className={`w-full rounded-lg border px-3.5 py-3 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:border-transparent transition ${
                      offerMessage.length > 0 && offerMessage.length < 10
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-200 focus:ring-blue-500"
                    }`}
                  />

                  {/* Helper text for user feedback */}
                  {offerMessage.length > 0 && offerMessage.length < 10 && (
                    <p className="mt-1 text-xs text-red-500">
                      Pesan harus memiliki minimal 10 karakter. (
                      {offerMessage.length}/10)
                    </p>
                  )}
                </div>

                {/* Error */}
                {offerError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                    {offerError}
                  </p>
                )}

                <DialogFooter className="mt-2 gap-2 flex-col sm:flex-row">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setOfferDialogOpen(false)}
                    disabled={offerSubmitting}
                  >
                    Batal
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold gap-2"
                    onClick={handleCreateOffer}
                    disabled={
                      !selectedTierId || !offerMessage.trim() || offerSubmitting
                    }
                  >
                    {offerSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Kirim Penawaran
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
