"use client";

import React, { useState, useEffect, useRef } from "react";
import { Filter } from "lucide-react";
import { useRouter } from "next/navigation";

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
  proposal: { id: string; source: string; aiScore: number } | null;
  _count: { offers: number };
}

import { apiCall } from "@/lib/api-client";

export default function ProposalTerbaru() {
  const router = useRouter();
  const [myEvents, setMyEvents] = useState<MyEvent[]>([]);
  const [proposalStatusFilter, setProposalStatusFilter] = useState<
    "semua" | "menunggu" | "negosiasi" | "disetujui" | "ditolak"
  >("semua");
  const [proposalPage, setProposalPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const PROPOSALS_PER_PAGE = 4;

  useEffect(() => {
    apiCall<{ data: MyEvent[] }>("/events/my", {})
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) setMyEvents(res.data);
      })
      .catch((err) => console.error("Failed to load events:", err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-gray-50 flex items-center gap-4 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-2 bg-gray-100 rounded w-1/4" />
            </div>
            <div className="h-5 w-16 bg-gray-200 rounded" />
            <div className="h-5 w-20 bg-gray-200 rounded" />
            <div className="h-5 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {(() => {
        const getProposalStatus = (ev: MyEvent) => {
          if (ev.status === "PUBLISHED") return "disetujui";
          if (ev._count.offers > 0) return "negosiasi";
          if (ev.proposal) return "menunggu";
          return "menunggu";
        };
        const statusBadge = (s: string) => {
          if (s === "disetujui") return "bg-green-100 text-green-700";
          if (s === "negosiasi") return "bg-orange-100 text-orange-700";
          if (s === "ditolak") return "bg-red-100 text-red-700";
          return "bg-yellow-100 text-yellow-700";
        };
        const tierBadge = (name: string) => {
          const n = name.toLowerCase();
          if (n.includes("platinum")) return "bg-purple-200 text-purple-800";
          if (n.includes("gold")) return "bg-yellow-200 text-yellow-800";
          if (n.includes("silver")) return "bg-gray-200 text-gray-700";
          return "bg-blue-100 text-blue-700";
        };
        const avatarColors = [
          "bg-blue-500",
          "bg-red-500",
          "bg-green-500",
          "bg-purple-500",
          "bg-orange-500",
        ];
        const filtered = myEvents.filter((ev) => {
          if (proposalStatusFilter === "semua") return true;
          return getProposalStatus(ev) === proposalStatusFilter;
        });
        const totalPages = Math.max(
          1,
          Math.ceil(filtered.length / PROPOSALS_PER_PAGE),
        );
        const paginated = filtered.slice(
          (proposalPage - 1) * PROPOSALS_PER_PAGE,
          proposalPage * PROPOSALS_PER_PAGE,
        );
        return (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Proposal Terbaru
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Kelola dan tinjau semua proposal sponsorship yang masuk untuk
                  event kamu.
                </p>
              </div>
              <button className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
                <Filter className="w-4 h-4" /> Filter
              </button>
            </div>
            {/* Sub-tabs */}
            <div className="flex items-center justify-between px-6 border-b border-gray-100">
              <div className="flex">
                {(
                  [
                    "semua",
                    "menunggu",
                    "negosiasi",
                    "disetujui",
                    "ditolak",
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setProposalStatusFilter(tab);
                      setProposalPage(1);
                    }}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                      proposalStatusFilter === tab
                        ? "border-blue-600 text-blue-700"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-400">
                Menampilkan {Math.min(PROPOSALS_PER_PAGE, filtered.length)} dari{" "}
                {filtered.length} event
              </span>
            </div>
            {/* Table head */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              <div>Perusahaan / Event</div>
              <div>Paket</div>
              <div>Tanggal</div>
              <div>Status</div>
              <div>Aksi</div>
            </div>
            {/* Rows */}
            {paginated.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-sm">
                Tidak ada event untuk kategori ini.
              </div>
            ) : (
              paginated.map((ev) => {
                const status = getProposalStatus(ev);
                const tier = ev.tiers[0];
                const date = new Date(ev.startDate).toLocaleDateString(
                  "id-ID",
                  { day: "numeric", month: "short", year: "numeric" },
                );
                const initial = (ev.title[0] ?? "E").toUpperCase();
                const color =
                  avatarColors[ev.title.charCodeAt(0) % avatarColors.length];
                return (
                  <div
                    key={ev.id}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 border-b border-gray-50 items-center hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
                      >
                        {initial}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 leading-tight">
                          {ev.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {ev.category} · {ev.city}
                        </p>
                      </div>
                    </div>
                    <div>
                      {tier ? (
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide ${tierBadge(tier.name)}`}
                        >
                          {tier.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{date}</div>
                    <div>
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${statusBadge(status)}`}
                      >
                        {status}
                      </span>
                    </div>
                    <div>
                      <button
                        onClick={() =>
                          router.push(`/proposal-smart-review?event=${ev.id}`)
                        }
                        className="text-sm font-semibold text-[#003EC7] hover:underline"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                );
              })
            )}
            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4">
              <button
                onClick={() => setProposalPage(Math.max(1, proposalPage - 1))}
                disabled={proposalPage === 1}
                className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setProposalPage(p)}
                      className={`w-8 h-8 rounded text-sm font-medium transition ${
                        proposalPage === p
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>
              <button
                onClick={() =>
                  setProposalPage(Math.min(totalPages, proposalPage + 1))
                }
                disabled={proposalPage === totalPages}
                className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        );
      })()}
    </>
  );
}
