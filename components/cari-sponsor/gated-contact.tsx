"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { apiCall } from "@/lib/api-client";
import {
  ArrowLeft,
  Lock,
  Building2,
  MapPin,
  Globe,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  Check,
  X,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ───────────────────────────────────────────────────────────────────

interface OfferDetail {
  id: string;
  eventId: string;
  status: string;
  initiatedBy: string;
  message: string;
  createdAt: string;
  respondedAt: string | null;
  closedAt: string | null;
  event: {
    id: string;
    eoProfileId: string;
    title: string;
  };
  companyProfile: {
    id: string;
    userId: string;
    companyName: string;
    industry: string;
    description: string;
    logoUrl: string | null;
    website: string | null;
    phoneNumber: string | null;
    city: string;
    targetAudience: string | null;
    isVerified: boolean;
    createdAt: string;
    user: {
      email: string;
    };
  };
  tier: {
    id: string;
    name: string;
    price: number;
    benefits: string[];
    maxSlots: number;
  };
  _count: {
    messages: number;
  };
}

// ─── Helpers for Masking Contact Information ───────────────────────────────────

const maskPhone = (phone: string | null) => {
  if (!phone) return "+62 812-XXXX-XXXX";
  // Clean phone number from non-digits except +
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+62")) {
    const prefix = cleaned.slice(0, 6); // e.g. +62812
    return `${prefix.slice(0, 3)} ${prefix.slice(3)}-XXXX-XXXX`;
  } else if (cleaned.startsWith("0")) {
    const prefix = cleaned.slice(0, 4); // e.g. 0812
    return `${prefix}-XXXX-XXXX`;
  }
  return "+62 812-XXXX-XXXX";
};

const maskEmail = (email: string | null) => {
  if (!email) return "p*********@ui.ac.id";
  const parts = email.split("@");
  if (parts.length !== 2) return "p*********@ui.ac.id";
  const [username, domain] = parts;
  if (username.length <= 1) {
    return `${username}*@${domain}`;
  }
  const firstChar = username.charAt(0);
  const asterisks = "*".repeat(Math.max(8, username.length - 1));
  return `${firstChar}${asterisks}@${domain}`;
};

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  offerId: string;
}

export default function GatedContactDetail({ offerId }: Props) {
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      try {
        const res = await apiCall<{ data: OfferDetail }>(
          `/offers/incoming/${offerId}`,
        );
        setOffer(res.data);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat detail penawaran.");
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [offerId]);

  async function handleAccept() {
    if (!offer) return;
    setActionLoading(true);
    try {
      await apiCall(`/offers/incoming/${offer.id}/accept`, { method: "POST" });
      setOffer((prev) => (prev ? { ...prev, status: "ACCEPTED" } : prev));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!offer) return;
    setActionLoading(true);
    try {
      await apiCall(`/offers/incoming/${offer.id}/reject`, { method: "POST" });
      setOffer((prev) => (prev ? { ...prev, status: "REJECTED" } : prev));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleWhatsApp = () => {
    const rawPhone = offer?.companyProfile.phoneNumber;
    if (!rawPhone) return;
    let cleaned = rawPhone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.slice(1);
    }
    window.open(`https://wa.me/${cleaned}`, "_blank");
  };

  const handleEmail = () => {
    const email = offer?.companyProfile.user.email;
    if (!email) return;
    const subject = encodeURIComponent(`Kolaborasi Event: ${offer.event.title}`);
    const body = encodeURIComponent(
      `Halo ${offer.companyProfile.companyName},\n\nTerima kasih atas penawaran sponsorship yang Anda kirimkan untuk event "${offer.event.title}". Kami sangat tertarik untuk berkolaborasi dengan Anda.\n\nMari kita jadwalkan sesi diskusi lebih lanjut.\n\nSalam,\n[Nama Event Organizer]`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_self");
  };

  // ─── Loading ───
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-8 animate-pulse" />
          <div className="bg-white rounded-2xl border border-gray-200 p-8 animate-pulse">
            <div className="flex gap-5 mb-8">
              <div className="w-20 h-20 bg-gray-200 rounded-2xl" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-5 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">
            {error || "Penawaran tidak ditemukan."}
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 text-blue-600 hover:underline text-sm font-medium"
          >
            ← Kembali
          </button>
        </div>
      </div>
    );
  }

  const isAccepted = offer.status === "ACCEPTED" || offer.status === "APPROVED";
  const isRejected = offer.status === "REJECTED";
  const isPending =
    offer.status === "PENDING" ||
    offer.status === "UNDER_REVIEW" ||
    offer.status === "NEGOTIATING";
  const contactVisible = isAccepted;

  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING: {
      label: "Baru",
      className: "bg-blue-100 text-blue-700 border border-blue-200",
    },
    UNDER_REVIEW: {
      label: "Menunggu",
      className: "bg-orange-100 text-orange-700 border border-orange-200",
    },
    NEGOTIATING: {
      label: "Negosiasi",
      className: "bg-purple-100 text-purple-700 border border-purple-200",
    },
    ACCEPTED: {
      label: "Disetujui",
      className: "bg-green-100 text-green-700 border border-green-200",
    },
    APPROVED: {
      label: "Disetujui",
      className: "bg-green-100 text-green-700 border border-green-200",
    },
    REJECTED: {
      label: "Ditolak",
      className: "bg-red-100 text-red-600 border border-red-200",
    },
  };

  const currentStatus = statusConfig[offer.status] ?? {
    label: offer.status,
    className: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Sponsor Masuk
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-8 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              {/* Logo */}
              <div className="w-20 h-20 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {offer.companyProfile.logoUrl ? (
                  <Image
                    src={offer.companyProfile.logoUrl}
                    alt={offer.companyProfile.companyName}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-gray-400 font-bold text-3xl">
                    {offer.companyProfile.companyName.charAt(0)}
                  </span>
                )}
              </div>

              {/* Company Info */}
              <div className="flex flex-col items-center sm:items-start">
                <div className="flex items-center gap-3 mb-1 flex-wrap justify-center sm:justify-start">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {offer.companyProfile.companyName}
                  </h1>
                  {offer.companyProfile.isVerified && (
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm mb-3">
                  {offer.companyProfile.industry}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {offer.companyProfile.city}
                  </span>
                  {offer.companyProfile.website && (
                    <a
                      href={offer.companyProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-blue-600 hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center md:justify-end flex-shrink-0">
              <span
                className={`text-xs font-bold px-4 py-1.5 rounded-full ${currentStatus.className}`}
              >
                {currentStatus.label}
              </span>
            </div>
          </div>

          {/* Description */}
          {offer.companyProfile.description && (
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4 mb-6">
              {offer.companyProfile.description}
            </p>
          )}

          {/* Contact Info — blurred when not accepted */}
          <div className="border border-gray-100 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              {contactVisible ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Lock className="w-4 h-4 text-gray-400" />
              )}
              <h3 className="text-sm font-bold text-gray-700">
                {contactVisible
                  ? "Kontak Terbuka"
                  : "Kontak Terkunci — Setujui untuk membuka"}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              {contactVisible ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                      Nomor Telepon
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {offer.companyProfile.phoneNumber || "-"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gray-50/60 border border-gray-100 rounded-xl">
                  <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Nomor Telepon
                    </p>
                    <p className="text-sm font-mono font-medium text-slate-600 tracking-wide select-none">
                      {maskPhone(offer.companyProfile.phoneNumber)}
                    </p>
                  </div>
                </div>
              )}

              {/* Email */}
              {contactVisible ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                      Email
                    </p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {offer.companyProfile.user.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gray-50/60 border border-gray-100 rounded-xl min-w-0">
                  <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Email
                    </p>
                    <p className="text-sm font-mono font-medium text-slate-600 tracking-wide select-none truncate">
                      {maskEmail(offer.companyProfile.user.email)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {!contactVisible && (
              <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                {isRejected
                  ? "Penawaran ini telah ditolak. Kontak tidak tersedia."
                  : "Setujui penawaran ini untuk membuka akses kontak perusahaan."}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          {isPending && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold h-11 gap-2 justify-center w-full"
                onClick={handleReject}
                disabled={actionLoading}
              >
                <X className="w-4 h-4" />
                Tolak Penawaran
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold h-11 gap-2 justify-center w-full"
                onClick={handleAccept}
                disabled={actionLoading}
              >
                <Check className="w-4 h-4" />
                Setujui &amp; Buka Kontak
              </Button>
            </div>
          )}

          {isAccepted && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold h-11 gap-2 justify-center w-full"
                onClick={handleWhatsApp}
              >
                <MessageSquare className="w-4 h-4" />
                Chat via WhatsApp
              </Button>
              <Button
                variant="outline"
                className="flex-1 font-semibold h-11 gap-2 justify-center w-full bg-white"
                onClick={handleEmail}
              >
                <Mail className="w-4 h-4" />
                Kirim Email
              </Button>
            </div>
          )}

          {/* Offer Details Card */}
          <div className="my-8">
            <h2 className="text-base font-bold text-gray-900 mb-4">
              Detail Penawaran
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 bg-gray-50 border border-gray-100 p-4 sm:p-5 rounded-2xl">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Event Tujuan
                </p>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-450" />
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {offer.event.title}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Paket Sponsor
                </p>
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {offer.tier.name}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Nilai Kontrak
                </p>
                <p className="text-sm font-bold text-green-600">
                  {formatRupiah(offer.tier.price)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Tanggal Masuk
                </p>
                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {formatDate(offer.createdAt)}
                </div>
              </div>
            </div>

            {/* Benefits */}
            {offer.tier.benefits && offer.tier.benefits.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Benefit Paket
                </p>
                <div className="flex flex-wrap gap-2">
                  {offer.tier.benefits.map((benefit, i) => (
                    <span
                      key={i}
                      className="bg-blue-55/60 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Message */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Pesan dari Perusahaan
              </p>
              <blockquote className="text-sm text-gray-700 italic bg-blue-50/60 border-l-4 border-blue-400 pl-4 pr-4 py-3 rounded-r-xl leading-relaxed">
                &quot;{offer.message}&quot;
              </blockquote>
            </div>
          </div>
        </div>

        {/* AI Match Card */}
        <div className="bg-gradient-to-r from-[#4338CA] to-[#7C3AED] rounded-2xl p-5 sm:p-6 text-white shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-base">AI Match Score</h3>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            Berdasarkan analisis AI kami, perusahaan ini memiliki kesesuaian
            yang tinggi dengan profil event Anda. Setujui penawaran ini untuk
            membuka peluang kolaborasi.
          </p>
        </div>
      </div>
    </div>
  );
}
