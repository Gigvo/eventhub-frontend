"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/api-client";
import { MoveRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IncomingOffer {
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
  };
  tier: {
    name: string;
    price: number;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: "ALL", label: "Semua" },
  { key: "PENDING", label: "Menunggu" },
  { key: "ACCEPTED", label: "Disetujui" },
  { key: "REJECTED", label: "Ditolak" },
] as const;

type TabKey = (typeof STATUS_TABS)[number]["key"];

function statusBadge(status: string): { cls: string; label: string } {
  switch (status) {
    case "ACCEPTED":
      return { cls: "bg-green-100 text-green-700", label: "ACCEPTED" };
    case "REJECTED":
      return { cls: "bg-red-100 text-red-700", label: "REJECTED" };
    case "PENDING":
      return { cls: "bg-yellow-100 text-yellow-700", label: "PENDING" };
    case "UNDER_REVIEW":
      return { cls: "bg-yellow-100 text-yellow-700", label: "UNDER REVIEW" };
    default:
      return { cls: "bg-yellow-100 text-yellow-700", label: "Menunggu" };
  }
}

function tierBadge(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("platinum")) return "bg-purple-200 text-purple-800";
  if (n.includes("gold")) return "bg-yellow-200 text-yellow-800";
  if (n.includes("silver")) return "bg-gray-200 text-gray-700";
  return "bg-blue-100 text-blue-700";
}

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-red-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-teal-500",
];

function avatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

// ─── Component ───────────────────────────────────────────────────────────────

const PER_PAGE = 4;

export default function ProposalTerbaru() {
  const router = useRouter();
  const [offers, setOffers] = useState<IncomingOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");
  const [page, setPage] = useState(1);
  useEffect(() => {
    apiCall<{ data: IncomingOffer[] }>("/pitches/my", {})
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) setOffers(res.data);
      })
      .catch((err) => console.error("Failed to load offers:", err))
      .finally(() => setIsLoading(false));
  }, []);
  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="px-6 py-4 border-b border-gray-50 flex items-center gap-4 animate-pulse"
          >
            <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-2 bg-gray-100 rounded w-1/4" />
            </div>
            <div className="h-5 w-16 bg-gray-200 rounded" />
            <div className="h-5 w-20 bg-gray-200 rounded" />
            <div className="h-5 w-16 bg-gray-200 rounded" />
            <div className="h-5 w-12 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // ── Filtering + pagination ────────────────────────────────────────────────
  const filtered =
    activeTab === "ALL" ? offers : offers.filter((o) => o.status === activeTab);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE,
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">
          Proposal Terbaru
        </h2>
        <button
          onClick={() => router.push("/proposal-smart-review")}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Lihat Semua
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex items-center justify-between px-6 border-b border-gray-100">
        <div className="flex">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setPage(1);
              }}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400">
          {filtered.length} proposal
        </span>
      </div>

      {/* Table head */}
      <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
        <div>Event</div>
        <div>Perusahaan</div>
        <div>Paket</div>
        <div>Tanggal</div>
        <div>Status</div>
        <div />
      </div>

      {/* Rows */}
      {paginated.length === 0 ? (
        <div className="py-16 text-center text-gray-400 text-sm">
          Tidak ada proposal untuk kategori ini.
        </div>
      ) : (
        paginated.map((offer) => {
          const { cls, label } = statusBadge(offer.status);
          const initial = (
            offer.companyProfile.companyName[0] ?? "C"
          ).toUpperCase();
          const color = avatarColor(offer.companyProfile.companyName);
          const date = new Date(offer.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={offer.id}
              className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b border-gray-50 items-center hover:bg-gray-50 transition"
            >
              {/* Event */}
              <div className="text-sm text-gray-700 truncate">
                {offer.event.title}
              </div>
              {/* Company */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
                >
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-tight truncate">
                    {offer.companyProfile.companyName}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {offer.companyProfile.industry} ·{" "}
                    {offer.companyProfile.city}
                  </p>
                </div>
              </div>

              {/* Tier badge */}
              <div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide ${tierBadge(offer.tier.name)}`}
                >
                  {offer.tier.name}
                </span>
              </div>

              {/* Date */}
              <div className="text-sm text-gray-600">{date}</div>

              {/* Status badge */}
              <div>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${cls}`}
                >
                  {label}
                </span>
              </div>

              {/* Action */}
              <button
                onClick={() =>
                  router.push(`/proposal-smart-review/${offer.id}`)
                }
                className="text-sm font-semibold text-[#003EC7] border  rounded px-2 py-1 hover:bg-blue-50 transition whitespace-nowrap"
              >
                <MoveRight />
              </button>
            </div>
          );
        })
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => setPage(Math.max(1, safePage - 1))}
          disabled={safePage === 1}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40"
        >
          Sebelumnya
        </button>
        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded text-sm font-medium transition ${
                safePage === p
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          onClick={() => setPage(Math.min(totalPages, safePage + 1))}
          disabled={safePage === totalPages}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40"
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
}
